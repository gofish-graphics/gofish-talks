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

// charStart/charEnd are 0-based, half-open [charStart, charEnd).
function wrapCharRange(td, charStart, charEnd, markKey) {
  var nodes = collectTextNodes(td);
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

    var span = document.createElement("span");
    span.className = "char-mark";
    span.setAttribute("data-mark-key", markKey);
    target.parentNode.insertBefore(span, target);
    span.appendChild(target);
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
