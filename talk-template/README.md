# GoFish talk template

The shared parts of a GoFish talk deck, taken from `scipy-2026/`:

- `src/deck.ts`: `startDeck()` sets up Reveal the way scipy-2026 does (a
  1280x720 canvas, no transitions, top-anchored slides, slide numbers, and
  the highlight and speaker-notes plugins). It also loads the theme CSS.
- `src/style.css`, `src/fonts/`, `src/hljs-github-light.css`: the theme. This
  is the talk-independent part of scipy-2026's `style.css`, with the
  "thesis-talk" skin, the Shantell Sans fonts, and the GitHub light code
  colors.
- `src/vite.ts`: the `gofishTalk()` Vite plugin. It inlines the talk's
  `sections/*.html` files, in the order you give, where `index.html` has the
  `<!-- sections -->` marker, so Vite bundles the images they use. It also
  adds the web font links and lets the dev server read the template's files.

## Using it in a talk

See `gugog-2026/` for a complete example. A talk needs:

- `pnpm-workspace.yaml` listing `.` and `../talk-template`
- `"@gofish-talks/template": "workspace:*"` in `dependencies`, and `vite` in
  `devDependencies`
- `vite.config.ts` with `base: "./"` and
  `gofishTalk({ sectionsDir, sections: [...] })` in `plugins`
- `main.ts` that calls `startDeck()` from `@gofish-talks/template`
- `index.html` with `<div class="reveal"><div class="slides"><!-- sections --></div></div>`

## Slide classes

- `.title-slide` and `.statement`: centered slides. Give them
  `data-background-color="#f7f2e8"`, as scipy-2026 does.
- `.part`: the small accent-colored label above a title.
- `.two-col` and `.split`: two-column layouts.
- `.big-claim`, `.tight-copy`, `.callout`, `.note-card`, `.source-line`
- `.placeholder-box` with a `.placeholder-label` first: a dashed box that
  stands in for a visual that has not been made yet.
- `.chart-container` and `pre.spec-mini`: frames for a chart and its code.

## Not included

- Live GoFish charts. scipy-2026 renders them from `charts.ts` with the
  `gofish-graphics` package. No talk that uses the template needs them yet.
- The click-to-edit mode. It is not in scipy-2026. It lives in the thesis
  defense deck (`phd-thesis-20260618/presentation/edit-mode.js` and
  `edit-server.mjs`), which is built differently, so it was not moved here.

## TODO: version drift

A talk that uses the template always gets the template's current version, so
a later template change also changes every older talk. This is a deliberate
shortcut. When a talk is finished, pin it to a frozen copy or version of the
template.
