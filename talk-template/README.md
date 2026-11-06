# GoFish talk template

The shared parts of a GoFish talk deck, taken from `scipy-2026/`:

- `src/deck.ts`: `startDeck()` sets up Reveal the way scipy-2026 does (a
  1280x720 canvas, no transitions, top-anchored slides, slide numbers, and
  the highlight and speaker-notes plugins). It also loads the theme CSS. A
  talk can pass more Reveal options, such as `{ autoAnimateDuration: 0.3 }`,
  which override these.
- `src/style.css`, `src/fonts/`, `src/hljs-github-light.css`: the theme. This
  is the talk-independent part of scipy-2026's `style.css`, with the
  "thesis-talk" skin, the Shantell Sans fonts, and the GitHub light code
  colors.
- `src/vite.ts`: the `gofishTalk()` Vite plugin. It inlines the talk's
  `sections/*.html` files, in the order you give, where `index.html` has the
  `<!-- sections -->` marker, so Vite bundles the images they use. It also
  adds the web font links and lets the dev server read the template's files.
  Under `pnpm dev` it also runs the slide editor's save endpoints.
- `src/editor/`: the in-browser slide editor. See "Editing slides in the
  browser" below.
- `src/slide-layout.js`: places the annotations and images that the editor
  adds, and draws the code character highlights it adds. The published
  slides need this, so it is not part of `src/editor/`.

## Using it in a talk

See `gugog-2026/` for a complete example. A talk needs:

- `pnpm-workspace.yaml` listing `.` and `../talk-template`
- `"@gofish-talks/template": "workspace:*"` in `dependencies`, and `vite` in
  `devDependencies`
- `vite.config.ts` with `base: "./"` and
  `gofishTalk({ sectionsDir, sections: [...] })` in `plugins`
- `main.ts` that calls `startDeck()` from `@gofish-talks/template`
- `index.html` with `<div class="reveal"><div class="slides"><!-- sections --></div></div>`

## Editing slides in the browser

Run `pnpm dev` in the talk's folder and open the deck. Press `e` to turn edit
mode on or off. You can also add `?edit` to the URL to start with it on. A
blue "EDIT MODE" badge shows while it is on. Every change is saved straight
into the talk's `sections/*.html` files, so there is nothing to export.

The editor is the one from the thesis defense deck
(`phd-thesis-20260618/presentation/edit-mode.js`, `highlight-edit.js` and
`edit-server.mjs`), moved here with the same keys and behavior.

### Text

- Double-click a heading, paragraph, list item, caption, quote or table cell
  to edit its text in place.
- Click outside it or press Cmd+Enter to save. Press Esc to cancel.
- Click a text element once to select it, then press Backspace or Delete to
  remove it from the file. Table cells cannot be removed.

### Annotations and images

A tool shelf sits at the left edge of the window while edit mode is on.

- Text tool (`t`, or the "T" button): click the slide to add a free-floating
  label, type, then press Cmd+Enter. An empty label is discarded. Press Esc to
  go back to the Select tool.
- Image button: pick an image file to add it to the current slide. You can
  also drag a file from the Finder onto a slide. PNG, JPEG, GIF, WebP, SVG and
  HEIC are accepted, and HEIC photos are converted to JPEG with macOS `sips`.
  The file is saved in the talk's `images/inserted/` folder, and the build
  bundles it like any other image in a section.
- Select tool: drag a label or image to move it. Drag an image's corner
  handle to resize it, and hold Option to resize about its center.
- Press Backspace or Delete to remove the selected label or image. The image
  file stays in `images/inserted/`.
- Right-click an image for a menu that changes its stacking order or crops it.
  You can also press `c` to crop the selected image. In crop mode, drag the
  box or its corners, then press Enter or `c` to keep the crop or Esc to
  cancel. The crop does not change the image file.
- Select the title slide's `<h1>` to get a handle on its right edge that sets
  its width. The `<h1>` needs an `id` for this width to save.

A label can have `data-link="<name>"`. Moving it then moves every other label
with the same `data-link` to the same place, even on other slides.

### Code highlights

These work on a code block that has a `data-line-numbers` attribute.

- Hold Option and click a line number to turn the highlight on that line on
  or off. On a block with build steps (`data-line-numbers="1|2-3"`), this
  changes the step that is showing.
- Hold Option and drag across part of one line to highlight just those
  characters. The editor saves them as `data-char-marks`. Hold Option and click
  a character highlight to remove it.

### Code regions

To show which parts of two code blocks correspond, as the GUGOG paper's
comparison figures do, add `data-code-regions` to each `<code>` (with a
`data-line-numbers` attribute, like character highlights). The value is a
comma-separated list of `ROLE L1:C1-L2:C2` entries, e.g., `"A 3:5-5:28, B
9:5-14:33"`. Each region runs from line L1, column C1 through line L2, column
C2. Lines and columns start at 1, and both ends are included. Each region gets
a light fill in its role's color behind the code, and its letter shows in the
gutter on the line where the role begins. Roles `A` to `F` have colors in
`src/style.css`. The editor does not edit regions; change them in the HTML.

### Moving code word by word (`data-magic-move`)

By default, Reveal's auto-animate moves a code block's lines: a line whose
text is the same on both slides slides to its new place, and any other line
just appears. Add `data-magic-move` to a `<pre>` to move the code word by
word instead, as Keynote's "magic move" does:

```html
<section data-auto-animate data-auto-animate-id="demo">
  <pre data-id="demo-code" data-magic-move><code class="language-ts" data-line-numbers>chart(data)
  .mark(rect({ h: "temp" }))</code></pre>
</section>
<section data-auto-animate data-auto-animate-id="demo">
  <pre data-id="demo-code" data-magic-move><code class="language-ts" data-line-numbers>chart(data, { schema })
  .mark(rect({ h: "usd" }))</code></pre>
</section>
```

Each word, string, number and punctuation mark that is in both states moves
to its new place, including to another line. A new one fades in where it
ends up, and one that is gone fades out where it was. This works in both
directions. Spaces are not animated: a change of indentation shows as the
words after it moving.

How it works (`src/magic-move.js`):

- When the plugin inlines the sections (in dev and in builds alike), it
  splits each `data-magic-move` block into tokens and compares it with the
  same block on the previous slide, if Reveal would auto-animate between
  the two slides. The same block is the `<pre>` with the same `data-id`, or
  for blocks with no `data-id`, the one in the same place in the slide. The
  comparison is a longest common subsequence of the tokens' text. Tokens it
  pairs up keep their id, and other tokens get a new one. The ids go on the
  `<code>` as `data-magic-ids`, and the tokens that the previous and next
  states have and this one does not go in `data-magic-ghosts`.
- On load, after Reveal's highlight plugin has colored the code,
  `src/slide-layout.js` wraps each token in a `span.mm-token` with its id as
  `data-id`, which is what Reveal pairs up. Then it adds an empty, invisible
  `span.mm-ghost` for each ghost, at the gone token's old place, so that
  Reveal fades the token out instead of hiding it at once. Then it draws the
  char marks and regions, which work as before.

Limits:

- The block needs a monospace font, since ghosts are placed with `ch` and
  `lh` units.
- Only blocks that both have `data-magic-move` are compared. A block with
  build steps (`data-line-numbers="1|2-3"`) has not been tried.
- A string, comment or other token cannot span lines.
- The comparison only knows the tokens' text. When a token appears more than
  once, it prefers the pairing that keeps the most tokens next to each
  other, which is usually the one a reader expects, but not always.
- A ghost shows its token's text and color but not a char mark the token
  had.
- The editor's Option-drag and Option-click on char marks work on these
  blocks. Option-clicking a line number rebuilds the block and wraps its
  tokens again, but no slide that uses `data-magic-move` shows line numbers
  yet, so that path has not been tried in a deck.
- The dev server reads `src/vite.ts` once. After you change the plugin or
  `src/magic-move.js`, restart `pnpm dev`.

Character marks are drawn as one box even where they are split across
several spans (syntax colors or tokens).

### How saving works

- In dev only, the plugin adds `data-src-file` and `data-src-index` to each
  top-level slide `<section>`. These name the section file and the slide's
  position in that file. The editor sends them with every save, and the
  server finds the slide with the same scan that added them. Builds do not
  have these attributes.
- The server changes only the part of the file that was edited, and keeps the
  rest of the file byte for byte. It accepts only the section files listed in
  `gofishTalk({ sections })`.
- The page does not reload after a save from the editor, because the page
  already shows the change. If you edit a section file by hand, the page
  reloads as usual.
- A few seconds after the last save, the server makes a git commit with the
  files it wrote, e.g., "Edit mode: update gugog-2026/sections/03-verbs.html".
  It stages and commits only those files, and only if they are inside the
  talk's folder, so other changes in the repo are left alone. It commits on
  whatever branch is checked out, and it commits the whole file, including
  any hand edits in that same file. Start the server with `AUTOCOMMIT=0 pnpm
  dev` to turn this off.

The built site has none of the editor code and no save endpoints. It only has
`src/slide-layout.js` and the CSS rules in `style.css` that place the labels,
images and character highlights.

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

## TODO: version drift

A talk that uses the template always gets the template's current version, so
a later template change also changes every older talk. This is a deliberate
shortcut. When a talk is finished, pin it to a frozen copy or version of the
template.
