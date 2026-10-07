> Part of the `testing` skill (see `SKILL.md`).

# Backend patterns

Patterns for testing use cases, domain logic, and services fast and in isolation. Language-agnostic; pseudocode is illustrative.

## Dependency inversion for testability

Use cases depend on **abstractions** (interfaces), not concrete implementations. This is what makes fast unit testing possible: the same use-case code runs against a real database in production and an in-memory array in tests.

```
UseCase ──depends on──▶ RepositoryInterface
                              ▲
              implements ┌────┴─────┐
                    PostgresRepo   InMemoryRepo (tests)
```

If a use case is hard to test, the coupling is the smell: inject its collaborators through the constructor.

**Wire unit tests by hand.** In a unit test, build the SUT with its fakes directly (`new CreateShiftUseCase(shiftsRepo, teamsRepo)`), with no DI container. A unit test that needs the framework's container to run is an integration test in disguise; the container belongs to the integration and E2E levels, where the real wiring is what is under test.

## In-Memory Repository (fake)

A test double implementing the same repository interface as production, storing data in a plain list or map. Tests run in milliseconds with zero infrastructure.

```
interface UsersRepository {
  create(user); findById(id); save(user); delete(user)
}

class InMemoryUsersRepository implements UsersRepository {
  public items = []                                  // publicly inspectable for assertions
  create(user) { this.items.push(user) }
  findById(id) { return this.items.find(u => u.id === id) ?? null }
  save(user)   { /* replace in items */ }
  delete(user) { /* filter out of items */ }
}
```

Key properties:
- **`public items`**: tests assert directly against repository state.
- **Same interface**: the fake honors the exact production contract.
- **Domain events**: if the entity is an aggregate root, dispatch its events on create/save/delete just like the real repo.
- **Compose fakes**: if a repo assembles data from others (joins), inject the other in-memory repos through its constructor.
- **Mirror the contract, edge cases included**: not found returns empty (`null`, an empty list, `none`) exactly as the real one does, instead of throwing; identity is compared the way the domain compares it. A fake that is kinder than production hides the bug the test was for.

## Mother Object / Test Data Factory

A function (or builder) that creates domain objects with **sensible defaults** and **optional overrides**. Without it, every test that builds a `User` must know all required fields, and adding a field breaks every test. With it, only the factory changes.

```
function makeUser(overrides = {}, id?) {
  return User.create({
    name:  "Default Name",        // sensible defaults
    email: "default@email.com",
    role:  "ASSISTANT",
    ...overrides                  // spread last so caller wins
  }, id)
}
```

Two rules keep factories honest:
- **Defaults produce a valid entity**: one that passes every domain invariant. A factory whose defaults are invalid makes every test that uses it start from a broken world.
- **Each call is independent**: references to other entities (foreign keys) get a fresh id per call, so two factory calls never collide by accident. Default values stay deterministic (fixed or seeded), per `fundamentals.md`.

Convention: `makeEntity(overrides?: Partial<Props>, id?: ID)`: `overrides` spread last; optional deterministic `id` for relational setups. Each test overrides only what it is about:

```
makeUser({ email: "invalid" })   // email-validation test
makeUser({ role: "MANAGER" })    // role test
makeUser()                        // creation test, defaults are fine
```

### Variations

- **Plain function**: flat entities (above).
- **Test Data Builder**: a fluent `aUser().withRole(ADMIN).build()` when there are many optional fields; defaults live in the builder.
- **Object literal**: a plain literal implementing the interface, for service fakes.
- **Object Mother + Builder**: the strongest form: the Mother is a **facade over construction** that exposes **named domain states**, each returning a builder you can still tweak. Named presets keep tests readable; the builder keeps them flexible. Reach for it when an entity has a few well-known kinds (roles, tiers, lifecycle states).

```
class UserObjectMother {
  static createUser() { return new UserBuilder() }        // sensible defaults
}
class UserBuilder {
  admin()      { this.role = "ADMIN";  return this }      // named states = the facade
  pro()        { this.role = "PRO";    return this }
  common()     { this.role = "COMMON"; return this }
  withEmail(e) { this.email = e;       return this }      // fluent overrides
  build()      { return User.create({
    name: "Default", email: this.email ?? "default@email.com", role: this.role ?? "COMMON"
  }) }
}

// reads like domain language:
UserObjectMother.createUser().admin().build()
UserObjectMother.createUser().pro().withEmail("pro@acme.com").build()
```

The named states (`.admin()`, `.pro()`, `.common()`) hide construction detail behind domain vocabulary: a test says *what kind* of user it needs, not *how* to assemble one. This is the domain-language building block of the **test DSL** (`fundamentals.md`).

## Either / Result testing: both branches

When an operation returns `Either<Error, Value>` (or a `Result`) instead of throwing, test **both** sides. The type system forces error paths to be first-class, not afterthoughts, and tests stay `try/catch`-free.

```
// Success (Right)
result = sut.execute(validInput)
expect(result.isRight()).toBe(true)
expect(result.value).toEqual(expectedOutput)

// Failure (Left)
result = sut.execute(invalidInput)
expect(result.isLeft()).toBe(true)
expect(result.value).toBeInstanceOf(ResourceNotFoundError)
```

When success carries no value (a delete returns `Right(null)`), asserting `isRight()` is not enough: assert the **side effect** too: the item is gone from the fake repository's `items`.

## Structure template

```
let repository   // dependency
let sut          // system under test

describe('Create User Use Case', () => {
  beforeEach(() => {                    // fresh instances every test, isolation
    repository = new InMemoryUsersRepository()
    sut = new CreateUserUseCase(repository)
  })

  describe('Success', () => {
    it('should create a user with valid data', async () => {
      const result = await sut.execute({ name: 'Alice', email: 'alice@test.com' })
      expect(result.isRight()).toBe(true)
      expect(repository.items).toHaveLength(1)
    })
  })

  describe('Failure', () => {
    it('should return error if email already exists', async () => {
      await repository.create(makeUser({ email: 'taken@test.com' }))
      const result = await sut.execute({ email: 'taken@test.com' })
      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(UserAlreadyExistsError)
    })
  })
})
```

Group by scenario with `describe` (Success / Failure), state the expected behavior with `it`, and keep one Act per test. A dependency the test never inspects can be an anonymous inline fake (`new Sut(repo, { notify: async () => {} })`); name it only when an assertion reads it.

## Service fakes

For external service interfaces (storage, email, encryption, payment), fake the interface. Pick the kind by what the test needs to see:

| Kind | Use when |
|---|---|
| **Stateful fake**: a class with a public list of what it received (`uploads[]`, `sentEmails[]`) | the test asserts on what was called |
| **No-op fake**: satisfies the interface and does nothing | the dependency must exist but is not what the test is about |
| **Object literal** returned by a factory | the interface has one or two methods |

```
class FakeUploader implements Uploader {
  public uploads = []
  async upload({ fileName }) { this.uploads.push({ fileName }); return { url: `fake://${fileName}` } }
}
```

## Domain event subscribers

A subscriber test proves that an event triggers the right side effect.

- **Arrange:** build the fakes, spy on the use case the subscriber calls, and register the subscriber (constructing it usually subscribes it). Reset the spy's counters **after** registration, in a second setup step, so registration calls do not count.
- **Act:** perform the operation that raises the event, usually creating or saving the aggregate through its fake repository.
- **Assert:** event dispatch is often asynchronous, so **poll the assertion until it holds or a timeout fires; never sleep**. Then assert the side effect in the target fake's `items`, not only that the spy was called.

```
it('creates member goals when a team goal is created', async () => {
  teamGoalsRepository.create(teamGoal)                         // raises the event
  await waitFor(() => expect(createGoals.execute).toHaveBeenCalled())
  expect(goalsRepository.items).toHaveLength(3)                // the side effect
})

// waitFor: retry the assertion every few ms until it passes; rethrow its error after the timeout
```

## Integration / E2E database isolation

Tests that hit a real database need their own world per suite (or per worker):

- **A schema or database per suite**, with a random name, migrated at suite start and **dropped at suite end**. Nothing is shared between suites, so they can run in parallel.
- **Flush caches** and other shared stores (Redis, in-process caches) at suite start.
- **Decide explicitly about domain events.** Turn in-process event dispatch off when the test drives the whole flow itself, and on when the dispatch is what is under test.
- Here the setup runs **once per suite** (`beforeAll`), because building a database per test is too slow. That does not contradict "fresh in `beforeEach`" in `fundamentals.md`: the suite owns the database, and each test still creates the rows it needs.

```
beforeAll(async () => { schema = randomId(); connectTo(schema); migrate() ; flushCache() })
afterAll(async  () => { dropSchema(schema); disconnect() })
```

