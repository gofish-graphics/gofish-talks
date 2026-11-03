// Word-level ("magic move") code animation for Reveal auto-animate.
//
// Reveal's auto-animate pairs up elements with the same data-id on two
// adjacent auto-animate slides, at any depth, moves each pair from its old
// place to its new one, and fades in elements that have no partner. So if a
// code block's tokens are wrapped in spans whose data-id stays the same
// from one state of the code to the next, Reveal moves every token that is
// still there and fades in only the new ones.
//
// The work is split in two:
//
//   - At build time (annotateMagicMove, called by the gofishTalk() Vite
//     plugin on the inlined sections, in dev and in builds alike), each
//     <pre data-magic-move> block is tokenized, and each state is diffed
//     against the same block on the previous slide of its auto-animate
//     chain. Tokens that match keep their id, new tokens get a new one. The
//     ids go on the <code> as data-magic-ids, one per token, in order.
//   - At runtime (wrapMagicMoveTokens in slide-layout.js), after Reveal's
//     highlight plugin has colored the block, each token's text is wrapped
//     in a span.mm-token with its id. This has to wait for the highlighter,
//     because the highlighter rebuilds the block from its plain text.
//
// Both sides run tokenize() below on the same text, so the n-th token at
// runtime is the n-th token the build gave an id to.
//
// Reveal hides the outgoing slide at once, so a token that is deleted would
// vanish instead of fading out. So each state also gets a "ghost" for every
// token of the previous and the next state that it does not have, listed in
// data-magic-ghosts as [id, line, column, text] (0-based line and column in
// that other state). At runtime each ghost is an empty, invisible span with
// the deleted token's id, placed at the token's old line and column (in ch
// and lh units, so this needs a monospace font) and drawing the token's
// text with CSS. Reveal pairs it with the deleted token and fades it from
// the token's opacity to the ghost's, 0, in place. A ghost has no text of
// its own, so the char marks, regions and line text do not see it.
//
// This file has no DOM code, so the Vite plugin can import it in Node.

// One token: a string literal (on one line), an identifier or number, "...",
// a multi-character operator, a line comment, or any other single
// non-space character. Whitespace is never a token: indentation changes
// show up as the tokens after it moving.
var TOKEN_RE =
  /"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\\n]|\\.)*`|\/\/[^\n]*|#[^\n]*|\.\.\.|[A-Za-z_$][\w$]*|\d[\d_]*(?:\.\d+)?|=>|===|!==|==|!=|<=|>=|&&|\|\||\?\?|\*\*|[^\s]/g;

// Returns [{ text, start, end }] for every token in `text`, with 0-based,
// half-open character offsets.
export function tokenize(text) {
  var tokens = [];
  TOKEN_RE.lastIndex = 0;
  var m;
  while ((m = TOKEN_RE.exec(text)) !== null) {
    tokens.push({ text: m[0], start: m.index, end: m.index + m[0].length });
  }
  return tokens;
}

// Matches the tokens of two states of a block: a longest common
// subsequence by token text, which among all such picks the one with the
// fewest runs (stretches of tokens matched next to each other). Without
// that tie-break, "chart(data)" becoming "chart(data, { ...Unit("°C")... })"
// could pair the old ")" with the one after "°C"; with it, the old ")"
// stays with the ".flow" that follows it. Returns, for each token of `b`,
// the index of its partner in `a`, or -1 if it is new. Blocks are a few
// hundred tokens, so the O(n*m) tables are fine.
export function matchTokens(a, b) {
  var n = a.length;
  var m = b.length;
  // score[s][i][j]: the best score for a[i:] and b[j:], where s is 1 if
  // a[i-1] and b[j-1] were matched (so matching a[i], b[j] extends a run).
  // A match is worth RUN_COST + 1 points, starting a new run costs 1.
  var BIG = n + m + 1;
  var score = [[], []];
  for (var s = 0; s < 2; s++) {
    for (var i = 0; i <= n; i++) score[s].push(new Float64Array(m + 1));
  }
  for (i = n - 1; i >= 0; i--) {
    for (var j = m - 1; j >= 0; j--) {
      var skip = Math.max(score[0][i + 1][j], score[0][i][j + 1]);
      for (s = 0; s < 2; s++) {
        var best = skip;
        if (a[i].text === b[j].text) {
          best = Math.max(best, BIG - (s ? 0 : 1) + score[1][i + 1][j + 1]);
        }
        score[s][i][j] = best;
      }
    }
  }
  var partner = new Array(m).fill(-1);
  i = 0;
  j = 0;
  s = 0;
  while (i < n && j < m) {
    var here = score[s][i][j];
    if (a[i].text === b[j].text && here === BIG - (s ? 0 : 1) + score[1][i + 1][j + 1]) {
      partner[j] = i;
      i++;
      j++;
      s = 1;
    } else if (here === score[0][i + 1][j]) {
      i++;
      s = 0;
    } else {
      j++;
      s = 0;
    }
  }
  return partner;
}

// ---------------------------------------------------------------------
// Build time: annotate the inlined sections' HTML.
// ---------------------------------------------------------------------

function decodeEntities(str) {
  return str
    .replace(/<[^>]*>/g, "")
    .replace(/&#x([0-9a-f]+);/gi, function (_, h) {
      return String.fromCodePoint(parseInt(h, 16));
    })
    .replace(/&#(\d+);/g, function (_, d) {
      return String.fromCodePoint(Number(d));
    })
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, "\u00a0")
    .replace(/&amp;/g, "&");
}

function hasAttr(attrs, name) {
  return new RegExp("(?:^|\\s)" + name + "(?=[\\s=/]|$)").test(attrs);
}

function attrValue(attrs, name) {
  var m = new RegExp("(?:^|\\s)" + name + "\\s*=\\s*(\"([^\"]*)\"|'([^']*)')").exec(attrs);
  return m ? (m[2] !== undefined ? m[2] : m[3]) : null;
}

// The slides Reveal navigates through, in order: every <section> with no
// <section> inside it. `masked` is the page with its comments blanked out.
function findLeafSections(masked) {
  var tagRe = /<section\b([^>]*)>|<\/section>/g;
  var stack = [];
  var leaves = [];
  var m;
  while ((m = tagRe.exec(masked)) !== null) {
    if (m[0] !== "</section>") {
      if (stack.length) stack[stack.length - 1].hasChild = true;
      stack.push({ attrs: m[1], innerStart: m.index + m[0].length, hasChild: false });
    } else {
      var open = stack.pop();
      if (!open) return [];
      if (!open.hasChild) {
        leaves.push({ attrs: open.attrs, innerStart: open.innerStart, innerEnd: m.index });
      }
    }
  }
  return leaves;
}

// The <pre data-magic-move><code ...>...</code></pre> blocks in a slide.
function findMagicBlocks(html, masked, slide) {
  var inner = masked.slice(slide.innerStart, slide.innerEnd);
  var re = /<pre\b([^>]*)>\s*<code\b([^>]*)>([\s\S]*?)<\/code>/g;
  var blocks = [];
  var m;
  while ((m = re.exec(inner)) !== null) {
    if (!hasAttr(m[1], "data-magic-move")) continue;
    var codeOpenEnd = slide.innerStart + m.index + m[0].indexOf(">", m[0].indexOf("<code")) + 1;
    var bodyStart = codeOpenEnd;
    var bodyEnd = bodyStart + m[3].length;
    var text = decodeEntities(html.slice(bodyStart, bodyEnd));
    blocks.push({
      preId: attrValue(m[1], "data-id"),
      insertAt: codeOpenEnd - 1, // just before the <code> tag's ">"
      text: text,
      tokens: tokenize(text),
      ids: null,
      ghosts: [],
    });
  }
  return blocks;
}

// Reveal auto-animates between two adjacent slides when both have
// data-auto-animate, their data-auto-animate-id values are equal (or both
// absent), and the later one has no data-auto-animate-restart.
function continuesChain(prev, next) {
  return (
    hasAttr(prev.attrs, "data-auto-animate") &&
    hasAttr(next.attrs, "data-auto-animate") &&
    attrValue(prev.attrs, "data-auto-animate-id") === attrValue(next.attrs, "data-auto-animate-id") &&
    !hasAttr(next.attrs, "data-auto-animate-restart")
  );
}

// The same block on the previous slide: the one with the same <pre>
// data-id, or, for blocks without one, the one in the same position.
export function partnerIndex(prevBlocks, block, index) {
  if (block.preId) {
    for (var i = 0; i < prevBlocks.length; i++) {
      if (prevBlocks[i].preId === block.preId) return i;
    }
    return -1;
  }
  return prevBlocks[index] && !prevBlocks[index].preId ? index : -1;
}

// Adds to `to` a ghost for each token of `from` that `to` does not have.
function addGhosts(to, from) {
  var kept = new Set(to.ids);
  from.tokens.forEach(function (token, i) {
    if (kept.has(from.ids[i])) return;
    var lineStart = from.text.lastIndexOf("\n", token.start - 1) + 1;
    var line = from.text.slice(0, lineStart).split("\n").length - 1;
    to.ghosts.push([from.ids[i], line, token.start - lineStart, token.text]);
  });
}

function escapeAttr(str) {
  return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

// Adds data-magic-ids (and data-magic-ghosts) to every <pre
// data-magic-move> block's <code> in `html` (the page after the sections
// are inlined) and returns the result.
export function annotateMagicMove(html) {
  var masked = html.replace(/<!--[\s\S]*?-->/g, function (c) {
    return " ".repeat(c.length);
  });
  var slides = findLeafSections(masked);
  var nextTrack = 0;
  var inserts = [];
  var prevSlide = null;
  var prevBlocks = [];
  var allBlocks = [];
  slides.forEach(function (slide) {
    var blocks = findMagicBlocks(html, masked, slide);
    var chained = prevSlide && continuesChain(prevSlide, slide);
    blocks.forEach(function (block, index) {
      var p = chained ? partnerIndex(prevBlocks, block, index) : -1;
      if (p >= 0) {
        var prev = prevBlocks[p];
        var partner = matchTokens(prev.tokens, block.tokens);
        block.track = prev.track;
        block.ids = partner.map(function (i) {
          return i >= 0 ? prev.ids[i] : "mm" + prev.track.n + "-" + prev.track.next++;
        });
        addGhosts(block, prev);
        addGhosts(prev, block);
      } else {
        block.track = { n: nextTrack++, next: 0 };
        block.ids = block.tokens.map(function () {
          return "mm" + block.track.n + "-" + block.track.next++;
        });
      }
    });
    prevSlide = slide;
    prevBlocks = blocks;
    allBlocks = allBlocks.concat(blocks);
  });
  allBlocks.forEach(function (block) {
    var attrs = ' data-magic-ids="' + block.ids.join(" ") + '"';
    if (block.ghosts.length) {
      attrs += ' data-magic-ghosts="' + escapeAttr(JSON.stringify(block.ghosts)) + '"';
    }
    inserts.push({ at: block.insertAt, text: attrs });
  });
  inserts.sort(function (x, y) {
    return y.at - x.at;
  });
  inserts.forEach(function (ins) {
    html = html.slice(0, ins.at) + ins.text + html.slice(ins.at);
  });
  return html;
}
