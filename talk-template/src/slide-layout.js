// The part of the in-browser slide editor that published slides need.
//
// The editor (./editor/) writes a few attributes into a talk's sections/*.html
// that CSS alone can't render, so they are applied here on every load, in dev
// and in the built site alike:
//
//   - .slide-annotation and .slide-image: data-x/data-y (top-left corner,
//     percent of the 1280x720 slide), and for an image also data-w (width,
//     percent of the slide), data-z (z-index) and data-crop (see
//     applyImageCrop). CSS can't read a data-* attribute for positioning.
//   - .title-slide h1: data-w (percent of the slide) becomes --title-h1-w,
//     which style.css reads for the heading's max-width.
//   - <code data-char-marks="...">: character-range highlights inside a code
//     line, wrapped in span.char-mark after reveal's highlight plugin has
//     built the per-line table.
//
// This code is taken unchanged from the thesis defense deck's edit-mode.js
// and highlight-edit.js, where it ran as part of the editor scripts. It is
// split out here because the editor itself only loads during `pnpm dev`.
//
// It also wraps the tokens of <pre data-magic-move> code blocks in spans
// with stable data-ids, so Reveal's auto-animate moves them word by word
// (see ./magic-move.js).

import { tokenize } from "./magic-move.js";

export var MOVABLE_SELECTOR = ".slide-annotation, .slide-image";

// CSS can't read a data-* attribute, so data-x/data-y (percent of the
// 1280x720 slide, top-left corner) are applied here as left/top -- and,
// for a .slide-image, data-w (percent of slide width) as width and data-z
// as z-index. Runs unconditionally on load -- and after every create/drag/
// resize/restack -- regardless of edit mode, so the deck renders correctly
// when presenting, not just while editing. Annotations carry neither
// data-w nor data-z, so those branches are simply no-ops for them.
export function applyAnnotationPosition(el) {
  var x = parseFloat(el.getAttribute("data-x"));
  var y = parseFloat(el.getAttribute("data-y"));
  if (!isNaN(x)) el.style.left = x + "%";
  if (!isNaN(y)) el.style.top = y + "%";
  if (el.hasAttribute("data-w")) {
    var w = parseFloat(el.getAttribute("data-w"));
    if (!isNaN(w)) el.style.width = w + "%";
  }
  if (el.hasAttribute("data-z")) {
    var z = parseInt(el.getAttribute("data-z"), 10);
    if (!isNaN(z)) el.style.zIndex = String(z);
  }
  if (el.classList.contains("slide-image")) applyImageCrop(el);
}

export function applyAllAnnotationPositions(root) {
  var els = root.querySelectorAll(MOVABLE_SELECTOR);
  for (var i = 0; i < els.length; i++) applyAnnotationPosition(els[i]);
}

// ---------------------------------------------------------------------
// Non-destructive image crop: data-crop="l,t,w,h" on a .slide-image
// figure, four percentages of the SOURCE image's own natural size (left
// offset, top offset, kept width, kept height), one decimal place each.
// The file on disk is never touched -- cropping only ever writes this one
// attribute (plus data-x/y/w, to keep the kept region where the user put
// it -- see the crop-mode block in editor/edit-mode.js). Absent means
// uncropped.
//
// Rendered with clip-path on the <img> itself, not overflow:hidden on the
// figure: the four corner resize handles (ensureImageHandles) are children
// of the figure, and overflow:hidden would clip them along with the
// image. clip-path's inset() resolves against the element it's applied
// to, so putting it on the (full-size, absolutely positioned) <img>
// clips the picture while leaving the figure -- and its handle children
// -- alone. The figure's own box (which the handles anchor to, and which
// data-x/data-y/data-w position) is given the CROPPED region's aspect
// ratio via the CSS aspect-ratio property; since data-w is always the
// cropped width, that's what makes the figure's box hug the visible
// picture instead of the full source image's shape.
// ---------------------------------------------------------------------

export function parseCrop(el) {
  var raw = el.getAttribute("data-crop");
  if (!raw) return null;
  var parts = raw.split(",");
  if (parts.length !== 4) return null;
  var l = parseFloat(parts[0]);
  var t = parseFloat(parts[1]);
  var w = parseFloat(parts[2]);
  var h = parseFloat(parts[3]);
  if (isNaN(l) || isNaN(t) || isNaN(w) || isNaN(h) || w <= 0 || h <= 0) return null;
  return { l: l, t: t, w: w, h: h };
}

// aspect-ratio needs the image's natural pixel size, which is 0 until it
// decodes -- true both for a crop just drawn in this session (the <img>
// is already loaded by then, since you can't crop what isn't showing)
// and, more importantly, for a cold page load of a section that already
// carries data-crop in its markup, where this runs before the browser has
// necessarily finished decoding the <img>. A one-shot load listener
// reapplies once it has.
export function applyImageCrop(fig) {
  var img = fig.querySelector("img");
  if (!img) return;
  var crop = parseCrop(fig);
  if (!crop) {
    // Uncropped (or a crop that failed to parse): clear anything a
    // previous crop set, so the image renders exactly as an ordinary
    // .slide-image <img> (width:100%; height:auto; from style.css).
    fig.style.aspectRatio = "";
    img.style.position = "";
    img.style.width = "";
    img.style.height = "";
    img.style.left = "";
    img.style.top = "";
    img.style.clipPath = "";
    return;
  }
  if (img.naturalWidth === 0) {
    img.addEventListener("load", function onLoad() {
      img.removeEventListener("load", onLoad);
      applyImageCrop(fig);
    });
    return;
  }
  var natW = img.naturalWidth;
  var natH = img.naturalHeight;
  fig.style.aspectRatio = String((crop.w * natW) / (crop.h * natH));
  img.style.position = "absolute";
  img.style.width = 10000 / crop.w + "%";
  img.style.height = "auto";
  img.style.left = -((crop.l / crop.w) * 100) + "%";
  img.style.top = -((crop.t / crop.h) * 100) + "%";
  img.style.clipPath =
    "inset(" +
    crop.t +
    "% " +
    (100 - crop.l - crop.w) +
    "% " +
    (100 - crop.t - crop.h) +
    "% " +
    crop.l +
    "%)";
}

// The title slide's own <h1>: its data-w (percent of the slide) becomes
// --title-h1-w on the h1 itself, which style.css's .title-slide h1 reads for
// max-width, falling back to its 980px default until a drag ever sets
// data-w.
export function applyTitleHeadingWidth(h1) {
  var w = parseFloat(h1.getAttribute("data-w"));
  if (!isNaN(w)) h1.style.setProperty("--title-h1-w", w + "%");
}

export function applyAllTitleHeadingWidths(root) {
  var h1s = root.querySelectorAll(".title-slide h1");
  for (var i = 0; i < h1s.length; i++) applyTitleHeadingWidth(h1s[i]);
}

// Positions and sizes everything above. Called once by startDeck(), before
// Reveal starts.
export function layoutSlides(root) {
  applyAllAnnotationPositions(root);
  applyAllTitleHeadingWidths(root);
}

// ---------------------------------------------------------------------
// data-char-marks: comma-separated "line:startCol-endCol" entries, 1-based,
// BOTH ENDS INCLUSIVE, columns counted over the rendered line's plain
// textContent. `|` separates per-BUILD-STEP entries, mirroring
// data-line-numbers' own `|` step separator: step i's spec applies to the
// i-th <code> clone reveal's highlight plugin creates for a stepped block. A
// value with no `|` is one spec applied to every clone.
//
// Column offsets are counted over the line cell's plain textContent, which
// hljs fragments across syntax spans -- so applying a mark means walking
// that cell's text nodes and wrapping the covered slice(s), splitting text
// nodes with Node.splitText rather than Range.surroundContents (which
// throws when a range's boundary falls inside more than one element).
//
// Marks need reveal's hljs-ln table, i.e. the block must carry a
// data-line-numbers attribute (bare is fine).
// ---------------------------------------------------------------------

export function parseCharMarks(str) {
  var marks = [];
  (str || "")
    .replace(/\s+/g, "")
    .split(",")
    .forEach(function (tok) {
      if (!tok) return;
      var m = /^(\d+):(\d+)-(\d+)$/.exec(tok);
      if (!m) return;
      marks.push({ line: Number(m[1]), start: Number(m[2]), end: Number(m[3]) });
    });
  return marks;
}

export function collectTextNodes(root) {
  var nodes = [];
  var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  var n;
  while ((n = walker.nextNode())) nodes.push(n);
  return nodes;
}

// Wraps the text of `td` in [charStart, charEnd) (0-based, half-open) in
// spans made by makeSpan(), one per text node the range touches. Returns the
// spans in text order. Used by data-char-marks and data-code-regions.
function wrapTextRange(td, charStart, charEnd, makeSpan) {
  var nodes = collectTextNodes(td);
  var spans = [];
  var offset = 0;
  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i];
    var len = node.nodeValue.length;
    var nodeStart = offset;
    var nodeEnd = offset + len;
    offset = nodeEnd;

    var overlapStart = Math.max(charStart, nodeStart);
    var overlapEnd = Math.min(charEnd, nodeEnd);
    if (overlapStart >= overlapEnd) continue;

    var localStart = overlapStart - nodeStart;
    var localEnd = overlapEnd - nodeStart;
    var target = node;
    if (localEnd < len) target.splitText(localEnd);
    if (localStart > 0) target = target.splitText(localStart);

    var span = makeSpan();
    target.parentNode.insertBefore(span, target);
    span.appendChild(target);
    spans.push(span);
  }
  return spans;
}

// charStart/charEnd are 0-based, half-open [charStart, charEnd).
// A mark that crosses syntax colors or magic-move tokens is several spans;
// the first and last get classes so style.css draws them as one box.
function wrapCharRange(td, charStart, charEnd, markKey) {
  var spans = wrapTextRange(td, charStart, charEnd, function () {
    var span = document.createElement("span");
    span.className = "char-mark";
    span.setAttribute("data-mark-key", markKey);
    return span;
  });
  if (spans.length) {
    spans[0].classList.add("char-mark-first");
    spans[spans.length - 1].classList.add("char-mark-last");
  }
}

function stripCharMarks(codeEl) {
  var spans = codeEl.querySelectorAll("span.char-mark");
  for (var i = 0; i < spans.length; i++) {
    var span = spans[i];
    var parent = span.parentNode;
    if (!parent) continue;
    while (span.firstChild) parent.insertBefore(span.firstChild, span);
    parent.removeChild(span);
    parent.normalize();
  }
}

function applyCharMarksToElement(codeEl, marks) {
  stripCharMarks(codeEl);
  var table = codeEl.querySelector("table.hljs-ln");
  if (!table) return; // no per-line structure to anchor to (see note above)
  marks.forEach(function (mark) {
    var row = table.querySelector("tbody > tr:nth-child(" + mark.line + "), tr:nth-child(" + mark.line + ")");
    var td = row && row.querySelector("td.hljs-ln-code");
    if (!td) return;
    var key = mark.line + ":" + mark.start + "-" + mark.end;
    wrapCharRange(td, mark.start - 1, mark.end, key);
  });
}

// Splits a data-char-marks value on its (optional) `|` step separator.
// With no `|`, returns { steps: null, flat: <parsed marks> } -- the same
// list applies to every clone. With `|`, returns { steps: [<parsed marks
// per step>], flat: null }.
function parseCharMarksSteps(marksString) {
  var raw = marksString || "";
  if (raw.indexOf("|") === -1) {
    return { steps: null, flat: parseCharMarks(raw) };
  }
  return { steps: raw.split("|").map(parseCharMarks), flat: null };
}

export function applyCharMarksAll(pre, marksString) {
  var parsed = parseCharMarksSteps(marksString);
  var codes = Array.prototype.filter.call(pre.children, function (c) {
    return c.tagName === "CODE";
  });
  codes.forEach(function (c, i) {
    var marks;
    if (parsed.steps) {
      // Clone i corresponds to step i (both 0-based here); clamp against
      // the end in case a mismatch ever leaves fewer/more steps than
      // clones, rather than throwing.
      var idx = Math.min(i, parsed.steps.length - 1);
      marks = idx >= 0 ? parsed.steps[idx] : [];
    } else {
      marks = parsed.flat;
    }
    applyCharMarksToElement(c, marks);
  });
}

// Reads every block's data-char-marks now, before reveal's highlight plugin
// rewrites the blocks, and wraps the marks once reveal is ready (the
// plugin builds the per-line table the marks anchor to). Called once by
// startDeck(), before Reveal starts.
export function renderCharMarksWhenReady(deck, root) {
  var blocks = Array.prototype.map.call(root.querySelectorAll("code[data-char-marks]"), function (code) {
    return { code: code, marks: code.getAttribute("data-char-marks") };
  });
  if (!blocks.length) return;
  deck.on("ready", function () {
    blocks.forEach(function (b) {
      var pre = b.code.closest("pre");
      if (pre) applyCharMarksAll(pre, b.marks);
    });
  });
}

// ---------------------------------------------------------------------
// data-code-regions: colored regions that tie the corresponding parts of two
// code blocks together, the way a paper figure pairs two specs (e.g., the
// GUGOG paper's comparison figures). The value is comma-separated
// "ROLE L1:C1-L2:C2" entries: ROLE is a short name such as "A" (style.css
// colors A to F), and the region runs from line L1, column C1 through line
// L2, column C2, 1-based and both ends inclusive, with columns counted over
// each line's plain text as for data-char-marks.
//
// A region is filled with a light tint of its role's color, behind the
// code's usual syntax colors (style.css). A region that continues past the
// end of a line fills that line to the block's edge, so a multi-line region
// reads as one block. A line where a role begins shows the role's name in
// the line-number gutter, so the pairing doesn't rely on color alone.
//
// Like data-char-marks, regions need reveal's hljs-ln table, i.e. a
// data-line-numbers attribute on the block. Not for stepped blocks.
// ---------------------------------------------------------------------

export function parseCodeRegions(str) {
  var regions = [];
  (str || "").split(",").forEach(function (tok) {
    var m = /^\s*([A-Za-z0-9_-]+)\s+(\d+):(\d+)-(\d+):(\d+)\s*$/.exec(tok);
    if (!m) return;
    regions.push({
      role: m[1],
      l1: Number(m[2]),
      c1: Number(m[3]),
      l2: Number(m[4]),
      c2: Number(m[5]),
    });
  });
  return regions;
}

function applyCodeRegionsToElement(codeEl, regions) {
  var table = codeEl.querySelector("table.hljs-ln");
  if (!table) return;
  codeEl.classList.add("has-code-regions");
  var rows = table.querySelectorAll("tr");
  var previousRoles = [];
  for (var i = 0; i < rows.length; i++) {
    var line = i + 1;
    var td = rows[i].querySelector("td.hljs-ln-code");
    var gutter = rows[i].querySelector("td.hljs-ln-numbers");
    if (!td) continue;
    var lineLength = td.textContent.length;
    var roles = [];
    regions.forEach(function (r) {
      if (line < r.l1 || line > r.l2) return;
      var start = line === r.l1 ? r.c1 - 1 : 0;
      var end = line === r.l2 ? r.c2 : lineLength;
      var spans = wrapTextRange(td, start, end, function () {
        var span = document.createElement("span");
        span.className = "code-region";
        span.setAttribute("data-role", r.role);
        return span;
      });
      if (line < r.l2 && spans.length) {
        spans[spans.length - 1].classList.add("code-region-open");
      }
      if (roles.indexOf(r.role) === -1) roles.push(r.role);
    });
    if (gutter) {
      roles.forEach(function (role) {
        if (previousRoles.indexOf(role) !== -1) return;
        var badge = document.createElement("span");
        badge.className = "code-region-badge";
        badge.setAttribute("data-role", role);
        badge.textContent = role;
        gutter.appendChild(badge);
      });
    }
    previousRoles = roles;
  }
}

// Reads every block's data-code-regions and applies them once reveal's
// highlight plugin has built the per-line tables. Called once by
// startDeck(), before Reveal starts.
export function renderCodeRegionsWhenReady(deck, root) {
  var blocks = Array.prototype.map.call(root.querySelectorAll("code[data-code-regions]"), function (code) {
    return { code: code, regions: parseCodeRegions(code.getAttribute("data-code-regions")) };
  });
  if (!blocks.length) return;
  deck.on("ready", function () {
    blocks.forEach(function (b) {
      applyCodeRegionsToElement(b.code, b.regions);
    });
  });
}

// ---------------------------------------------------------------------
// data-magic-ids: one id per token of a <pre data-magic-move> block, put
// there at build time by ./magic-move.js. Each token's text is wrapped in a
// span.mm-token carrying its id as data-id, so Reveal's auto-animate pairs
// the tokens up across slides and moves them (style.css makes them
// inline-block, since transforms do not apply to inline boxes).
//
// This runs after reveal's highlight plugin, which rebuilds the block from
// its plain text, and before data-char-marks and data-code-regions, so
// those wrap text inside the token spans and move with them. Tokens are
// counted over each line's plain textContent with the same tokenize() the
// build used, so the n-th token gets the n-th id.
// ---------------------------------------------------------------------

export function wrapMagicMoveTokens(codeEl) {
  var ids = (codeEl.getAttribute("data-magic-ids") || "").split(" ").filter(Boolean);
  if (!ids.length || codeEl.querySelector(".mm-token")) return;
  var cells = codeEl.querySelectorAll("td.hljs-ln-code");
  var lines = cells.length ? Array.prototype.slice.call(cells) : [codeEl];
  var perLine = lines.map(function (line) {
    return tokenize(line.textContent);
  });
  var count = perLine.reduce(function (n, t) {
    return n + t.length;
  }, 0);
  if (count !== ids.length) {
    console.warn("[magic-move] " + count + " tokens but " + ids.length + " ids; not animating this block by token", codeEl);
    return;
  }
  var next = 0;
  lines.forEach(function (line, i) {
    perLine[i].forEach(function (token) {
      var id = ids[next++];
      wrapTextRange(line, token.start, token.end, function () {
        var span = document.createElement("span");
        span.className = "mm-token";
        span.setAttribute("data-id", id);
        return span;
      });
    });
  });
}

// data-magic-ghosts: [id, line, column, text] for each token of the
// previous or next state that this state does not have (./magic-move.js).
// Each becomes an empty span.mm-ghost with that id at the start of the
// first line, moved to the token's old line and column with margins in lh
// and ch. style.css takes it out of the flow, makes it invisible, and draws
// data-text with ::before. When Reveal arrives here from the state that
// had the token, it pairs the token with its ghost and fades it out in
// place. The ghost takes the token's color from the token itself, found
// by its id (all blocks' tokens are wrapped before any ghosts are added).
export function addMagicMoveGhosts(codeEl) {
  var ghosts;
  try {
    ghosts = JSON.parse(codeEl.getAttribute("data-magic-ghosts") || "[]");
  } catch (e) {
    return;
  }
  var anchor = codeEl.querySelector("td.hljs-ln-code") || codeEl;
  var old = codeEl.querySelectorAll(".mm-ghost");
  for (var i = 0; i < old.length; i++) old[i].remove();
  ghosts.forEach(function (g) {
    var span = document.createElement("span");
    span.className = "mm-ghost";
    span.setAttribute("data-id", g[0]);
    span.setAttribute("data-text", g[3]);
    span.setAttribute("aria-hidden", "true");
    span.style.marginTop = g[1] + "lh";
    span.style.marginLeft = g[2] + "ch";
    var token = document.querySelector('.mm-token[data-id="' + g[0] + '"]');
    if (token) span.style.color = getComputedStyle(token).color;
    anchor.insertBefore(span, anchor.firstChild);
  });
}

// Wraps every block's tokens, then adds the ghosts, once reveal is ready.
// Called once by startDeck(), before Reveal starts, and before the char
// marks and regions are set up, so that their ready handlers run after
// this one.
export function renderMagicMoveWhenReady(deck, root) {
  deck.on("ready", function () {
    var codes = root.querySelectorAll("pre[data-magic-move] code[data-magic-ids]");
    Array.prototype.forEach.call(codes, wrapMagicMoveTokens);
    Array.prototype.forEach.call(codes, addMagicMoveGhosts);
  });
}
