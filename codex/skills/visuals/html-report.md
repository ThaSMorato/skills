> Part of the `visuals` skill (see `SKILL.md`).

# HTML report

One self-contained HTML file per report: Tailwind and Mermaid from their CDNs, nothing else, no app code. It opens in any browser, prints, and lands nowhere in the repository.

## Where it goes
Resolve the temp directory the same way every run: `$TMPDIR`, else `/tmp` (`%TEMP%` on Windows). Write `<tmpdir>/<stage>-<slug>-<YYYYMMDD-HHMM>.html`, so each run gets a fresh file and an older one is never overwritten. Open it for the owner (`open <path>` on macOS, `xdg-open <path>` on Linux, `start <path>` on Windows) and **print the path**: a report the owner cannot find again is gone.

## Scaffold

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{{stage}}: {{scope}}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script type="module">
      import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";
      const dark = matchMedia("(prefers-color-scheme: dark)").matches;
      mermaid.initialize({ startOnLoad: true, theme: dark ? "dark" : "neutral" });
    </script>
    <style>
      .seam { border-style: dashed; }
      .leak { stroke: #dc2626; color: #dc2626; }
    </style>
  </head>
  <body class="bg-stone-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans">
    <main class="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      <header><!-- scope, date, legend --></header>
      <section id="top"><!-- the top recommendation --></section>
      <section id="items" class="space-y-10"><!-- one <article> per item --></section>
      <section id="not-covered"><!-- what the report does not cover --></section>
    </main>
  </body>
</html>
```

## Header
The scope, the date, the fixed point or commit it was read at, and a compact legend for the diagrams: solid box = module, dashed border = seam, red = a dependency that leaks across a seam, thick dark box = the part that absorbs the change. No introduction paragraph: straight to the items.

## Top recommendation
One larger card: the item to do first, one sentence on why, a link to its card. Nothing else.

## One card per item
Each item is an `<article>`:
- **Title**: short, names the move ("Pull pricing behind the order module").
- **Badges**: strength (`Strong` emerald, `Worth exploring` amber, `Speculative` slate), and the rule or category it serves (the tidy rule, the risk kind).
- **Files**: monospaced (`font-mono text-sm`), with `file:line` where the evidence is.
- **Before / after**: two columns side by side (stacked on narrow screens), about 320px tall, the centerpiece. Pick a pattern below.
- **Problem**: one sentence. What hurts.
- **Change**: one sentence. What moves where.
- **Gains**: up to four bullets of six words or fewer, in the project's terms ("pricing rules live in one module", "tests hit one interface").
- **ADR callout**, when it contradicts one: one line in an amber box.

If a card needs a paragraph, the diagram is wrong: redraw it.

## Diagram patterns
Pick per item, and vary them across the report: the same pattern on every card makes them blur together.

- **Mermaid graph**: `flowchart LR` for "X calls Y calls Z, and look at the tangle". A `classDef` colors leaking edges red and the absorbing module dark. A `sequenceDiagram` shows "before: six round trips; after: one".

  ```html
  <div class="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
    <pre class="mermaid">
      flowchart LR
        A[OrderHandler] --> B[OrderValidator]
        B --> C[OrderRepo]
        C -. leak .-> D[PricingClient]
        classDef leak stroke:#dc2626,stroke-width:2px;
        class C,D leak
    </pre>
  </div>
  ```
- **Boxes and arrows by hand**: `<div>`s with borders for modules, inline SVG `<line>`/`<path>` for arrows over a `relative` container. Use it when the "after" should read as one thick module with its old parts greyed inside, which Mermaid cannot weight.
- **Cross-section**: stacked horizontal bands (`h-10 border-l-4`) for the layers a call passes through. Before: six thin layers that each do nothing. After: one band named for what it now owns.
- **Mass diagram**: two rectangles per module, interface and implementation, heights to scale. Before: interface nearly as tall as implementation (shallow). After: a short interface over a tall implementation.
- **Call-tree collapse**: before, the calls as nested boxes; after, the same tree folded into one box with the now-internal calls faded inside.

## Style
- Editorial, not a dashboard: generous whitespace, one accent color plus red for leaks and amber for warnings.
- Labels inside diagrams in `text-xs uppercase tracking-wider`, so they read as a schematic, not as UI.
- Everything readable in light and dark (`dark:` classes; the scaffold picks the Mermaid theme from the system).

## Not covered
The last section says what the report leaves out: paths skipped, items listed in the markdown but not drawn, proposals dropped for lack of evidence. A report that looks complete and is not is worse than a shorter one.

## Check before handing it over
A Mermaid syntax error renders as an error box instead of a diagram, and nothing else reports it. Check every diagram renders, with what the environment has: a browser tool (load the file and look at a screenshot), or the Mermaid CLI on each diagram (`npx -y @mermaid-js/mermaid-cli -i <diagram>.mmd -o <diagram>.svg` fails on a syntax error). With neither, tell the owner the diagrams were not render-checked.
