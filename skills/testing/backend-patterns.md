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

If a use case is hard to test, the coupling is the smell — inject its collaborators through the constructor.

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
- **`public items`** — tests assert directly against repository state.
- **Same interface** — the fake honors the exact production contract.
- **Domain events** — if the entity is an aggregate root, dispatch its events on create/save/delete just like the real repo.
- **Compose fakes** — if a repo assembles data from others (joins), inject the other in-memory repos through its constructor.

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

Convention: `makeEntity(overrides?: Partial<Props>, id?: ID)` — `overrides` spread last; optional deterministic `id` for relational setups. Each test overrides only what it is about:

```
makeUser({ email: "invalid" })   // email-validation test
makeUser({ role: "MANAGER" })    // role test
makeUser()                        // creation test — defaults are fine
```

### Variations

- **Plain function** — flat entities (above).
- **Test Data Builder** — a fluent `aUser().withRole(ADMIN).build()` when there are many optional fields; defaults live in the builder.
- **Object literal** — a plain literal implementing the interface, for service fakes.
- **Object Mother + Builder** — the strongest form: the Mother is a **facade over construction** that exposes **named domain states**, each returning a builder you can still tweak. Named presets keep tests readable; the builder keeps them flexible. Reach for it when an entity has a few well-known kinds (roles, tiers, lifecycle states).

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

The named states (`.admin()`, `.pro()`, `.common()`) hide construction detail behind domain vocabulary — a test says *what kind* of user it needs, not *how* to assemble one.

## Either / Result testing — both branches

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

## Structure template

```
let repository   // dependency
let sut          // system under test

describe('Create User Use Case', () => {
  beforeEach(() => {                    // fresh instances every test — isolation
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

Group by scenario with `describe` (Success / Failure), state the expected behavior with `it`, and keep one Act per test.
