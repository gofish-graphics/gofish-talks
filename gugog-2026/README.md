# The Grammar of Graphics Needs Verbs: Towards a GUGOG

A 7-minute talk at the GUGOG workshop, IEEE VIS 2026 (Nov 9). It sets up the
panel. Slides: https://gofish-graphics.github.io/gofish-talks/gugog-2026/

The deck uses the shared template in `../talk-template/` for its look and its
Reveal setup.

## Running

```bash
pnpm install
pnpm dev
```

The dev server is at `http://localhost:4003/`. `pnpm build` writes `dist/`.

## Editing

- Slides: `sections/*.html`, one file per outline section. Their order is set
  in `vite.config.ts`.
- Speaker notes are in each slide's `<aside class="notes">`, with the outline
  bullets, the target time, and the running total. Press `S` to open them.
- Every figure is a labeled placeholder box. Replace each one with the real
  visual.
- The one-slide version of section 5, for running long, is a hidden slide at
  the end of `sections/05-big-vs-small.html`.
