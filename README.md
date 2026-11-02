# GoFish talks

Slides for public talks about [GoFish](https://github.com/gofish-graphics/gofish-graphics).
Each folder is a separate Reveal/Vite deck with its own dependencies.

| Talk | Folder | Slides |
| --- | --- | --- |
| SciPy 2026 | [`scipy-2026/`](scipy-2026/) | https://talks.gofish.graphics/scipy-2026/ |
| PyData 2026 | [`pydata-2026/`](pydata-2026/) | https://talks.gofish.graphics/pydata-2026/ |
| GUGOG @ IEEE VIS 2026 | [`gugog-2026/`](gugog-2026/) | https://talks.gofish.graphics/gugog-2026/ |

All talks are listed at https://talks.gofish.graphics/.

To run a talk, go into its folder and follow its README (usually `pnpm install` then `pnpm dev`).

## Shared template

[`talk-template/`](talk-template/) holds the look shared by new talks: the
Reveal setup, the theme and fonts, code highlighting, and a Vite plugin that
inlines a talk's `sections/*.html` files. It also has a slide editor that runs
in the browser during `pnpm dev` and saves into those files. `gugog-2026/`
uses it. `scipy-2026/`
and `pydata-2026/` are finished talks and do not use it.

A talk that uses the template has its own `pnpm-workspace.yaml` that lists
`.` and `../talk-template`, and depends on `"@gofish-talks/template":
"workspace:*"`. There is no `pnpm-workspace.yaml` at the repo root on purpose:
pnpm would use it for every talk folder that has no workspace file of its own
(`pydata-2026/`), and installing there would stop working.

TODO: a talk that uses the template always gets the template's current
version, so a later template change also changes every older talk. When a talk
is finished, pin it to a frozen copy or version of the template.

## Hosting

Every push to `main` builds each talk and deploys it to GitHub Pages
(`.github/workflows/pages.yml`). To add a talk, add its folder to the `talk`
list in that workflow and add a link to it in `index.html` and in the table above.
