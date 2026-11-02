# GoFish talks

Slides for public talks about [GoFish](https://github.com/gofish-graphics/gofish-graphics).
Each folder is a separate Reveal/Vite deck with its own dependencies.

| Talk | Folder | Slides |
| --- | --- | --- |
| SciPy 2026 | [`scipy-2026/`](scipy-2026/) | https://gofish-graphics.github.io/gofish-talks/scipy-2026/ |
| PyData 2026 | [`pydata-2026/`](pydata-2026/) | https://gofish-graphics.github.io/gofish-talks/pydata-2026/ |

All talks are listed at https://gofish-graphics.github.io/gofish-talks/.

To run a talk, go into its folder and follow its README (usually `pnpm install` then `pnpm dev`).

## Hosting

Every push to `main` builds each talk and deploys it to GitHub Pages
(`.github/workflows/pages.yml`). To add a talk, add its folder to the `talk`
list in that workflow and add a link to it in `index.html` and in the table above.
