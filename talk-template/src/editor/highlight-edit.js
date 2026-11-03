// Edit-mode authoring for code-block highlights, ported from the thesis
// defense deck (phd-thesis-20260618/presentation/highlight-edit.js). It sits
// on top of edit-mode.js's
// "slide-edit-on" body class / editmodechange event. Two gestures, both
// gated on the Alt/Option key so they never collide with normal clicks or
// with edit-mode.js's double-click-to-edit-prose flow:
//
//   1. Alt+click a gutter line number (td.hljs-ln-numbers, rendered by
//      reveal's highlight plugin for any <code data-line-numbers>) toggles
//      that line in/out of the block's data-line-numbers spec and
//      re-highlights the block in place. Refused (with a console.warn) on a
//      block that carries data-highlight-text, since highlight-text.js
//      recomputes and overwrites data-line-numbers from that attribute on
//      every load -- a gutter toggle there would silently vanish next load.
//   2. Alt+drag across characters within one rendered code line
//      (td.hljs-ln-code) adds a data-char-marks range; alt+click an
//      existing mark removes it.
//
// Both save to disk via POST /save-attr (./server.ts addresses a <code>
// element by its source-order occurrence within the section, not just by
// id="").
//
// The thesis deck also had highlight-text.js and highlight-markers.js,
// which compute data-line-numbers/data-char-marks from data-highlight-text
// or inline @[...]@ markers. The template has neither, so the refusals
// below for such blocks never fire here; they are kept so the gestures stay
// correct if those passes are ever ported too.
//
// data-char-marks format: comma-separated "line:startCol-endCol" entries,
// 1-based, BOTH ENDS INCLUSIVE, columns counted over the rendered line's
// plain textContent (post data-trim; the plugin's trim is deterministic so
// this stays stable across re-highlights). Multiple entries per line are
// allowed; canonical form is sorted by line then start column, with
// overlapping/touching entries on the same line merged.
//
// STEPPED data-char-marks: `|` separates per-BUILD-STEP entries, exactly
// mirroring data-line-numbers' own `|` step separator -- step i's spec
// applies to the i-th <code> clone reveal's highlight plugin creates for a
// stepped block (clones are appended in step order as later <pre> children;
// see originalCodeElOf below). A value with no `|` keeps its original,
// simpler meaning: one spec applied to every clone. Rendering (including on
// a normal load, outside edit mode) lives in ../slide-layout.js, since marks
// are presentation content, not an edit-mode-only overlay.
//
// Scope note (declared, not hidden): char-marks require the block to
// already render reveal's hljs-ln table, i.e. it must carry a
// data-line-numbers attribute (bare is fine -- "gutter only, no
// highlights" blocks still get the table). Blocks with no
// data-line-numbers attribute at all render as a flat <code> with no
// per-line <tr>/<td> structure to anchor a column offset to, so alt+drag
// is a no-op there, matching gutter-toggle's own "no gutter, nothing to
// click" scope limit.
import {
  addMagicMoveGhosts,
  applyCharMarksAll,
  collectTextNodes,
  parseCharMarks,
  wrapMagicMoveTokens,
} from "../slide-layout.js";

// `deck` is the Reveal instance startDeck() creates. This must be called
// before deck.initialize(), so the pristine state below is captured before
// reveal's highlight plugin rewrites the code blocks.
export function installHighlightEdit(deck) {
  "use strict";

  if (window.__highlightEditLoaded) return;
  window.__highlightEditLoaded = true;

  // ---------------------------------------------------------------------
  // Pristine-state capture. This runs when startDeck() calls
  // installHighlightEdit(), after the gofishTalk() Vite plugin has inlined
  // the raw section markup (stamped, in dev, with data-src-file/
  // data-src-index on each top-level <section>) -- but BEFORE
  // deck.initialize(), which is what actually runs the highlight plugin
  // over every code block. So every <code> element we see right now is exactly the
  // escaped source text from the section file, unprocessed. We cache that
  // (plus the pristine data-line-numbers/class) per element, since the
  // plugin mutates both heavily and re-highlighting a block means
  // restoring this pristine snapshot and letting the plugin process it
  // again from scratch.
  // ---------------------------------------------------------------------

  var codeState = new WeakMap(); // original <code> element -> state object
  var allOriginals = []; // for iteration (WeakMap has no keys())

  function captureState() {
    var sections = document.querySelectorAll("section[data-src-file]");
    for (var s = 0; s < sections.length; s++) {
      var section = sections[s];
      var file = section.getAttribute("data-src-file");
      var sectionIndex = Number(section.getAttribute("data-src-index"));
      var codeEls = section.querySelectorAll("code");
      for (var i = 0; i < codeEls.length; i++) {
        var codeEl = codeEls[i];
        if (codeState.has(codeEl)) continue; // sections don't overlap; defensive only
        var state = {
          file: file,
          sectionIndex: sectionIndex,
          codeOccurrence: i,
          pristineInnerHTML: codeEl.innerHTML,
          pristineClassName: codeEl.className,
          hasLineNumbers: codeEl.hasAttribute("data-line-numbers"),
          hasHighlightText: codeEl.hasAttribute("data-highlight-text"),
          // Stamped by highlight-markers.js (which runs before this file,
          // specifically so this flag is already present when we capture --
          // see that script's header comment) on any block whose
          // data-line-numbers/data-char-marks were computed from inline
          // `@[...]@` markers in the source text. Those values are
          // recomputed from the text on every load, so editing them via the
          // gutter/drag gestures below would silently vanish next load,
          // exactly like the data-highlight-text case just above.
          hasMarkers: codeEl.hasAttribute("data-highlight-markers"),
          currentLineNumbers: codeEl.getAttribute("data-line-numbers") || "",
          currentCharMarks: codeEl.getAttribute("data-char-marks") || "",
        };
        codeState.set(codeEl, state);
        allOriginals.push(codeEl);
      }
    }
  }

  captureState();

  // ---------------------------------------------------------------------
  // Small shared helpers.
  // ---------------------------------------------------------------------

  function editModeOn() {
    return document.body.classList.contains("slide-edit-on");
  }

  // Every <pre> in this deck's markup contains exactly one source-borne
  // <code>, which the highlight plugin always keeps as the first child --
  // pipe-step ("6|7|8") clones are appended as later siblings. So the
  // first child is always the element our pristine state was captured
  // from, regardless of which step (original or a clone) the user is
  // currently interacting with.
  function originalCodeElOf(pre) {
    return pre.children[0];
  }

  var toastTimer = null;
  function toast(message, kind) {
    var el = document.getElementById("edit-mode-toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "edit-mode-toast";
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.className = kind === "err" ? "err visible" : "ok visible";
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.classList.remove("visible");
    }, 2500);
  }

  function postSaveAttr(state, attr, value) {
    fetch("/save-attr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        file: state.file,
        sectionIndex: state.sectionIndex,
        codeOccurrence: state.codeOccurrence,
        attr: attr,
        value: value,
      }),
    })
      .then(function (res) {
        return res.json().then(function (data) {
          return { status: res.status, data: data };
        });
      })
      .then(function (result) {
        if (result.status === 200 && result.data && result.data.ok) {
          toast("Saved to " + state.file, "ok");
        } else {
          var msg = (result.data && result.data.error) || "save failed";
          toast(msg, "err");
        }
      })
      .catch(function (err) {
        toast("Network error: " + err.message, "err");
      });
  }


  // ---------------------------------------------------------------------
  // data-line-numbers spec parsing/toggling (comma list of N or A-B
  // tokens; canonical form sorts ascending and merges adjacent numbers
  // into ranges).
  // ---------------------------------------------------------------------

  function parseLineSpec(spec) {
    var set = {};
    (spec || "")
      .replace(/\s+/g, "")
      .split(",")
      .forEach(function (tok) {
        if (!tok) return;
        var parts = tok.split("-");
        var a = parseInt(parts[0], 10);
        var b = parts.length > 1 ? parseInt(parts[1], 10) : a;
        if (isNaN(a)) return;
        if (isNaN(b)) b = a;
        var lo = Math.min(a, b),
          hi = Math.max(a, b);
        for (var n = lo; n <= hi; n++) set[n] = true;
      });
    return set;
  }

  function serializeLineSpec(set) {
    var nums = Object.keys(set)
      .map(Number)
      .sort(function (a, b) {
        return a - b;
      });
    var ranges = [];
    var i = 0;
    while (i < nums.length) {
      var start = nums[i],
        end = start;
      while (i + 1 < nums.length && nums[i + 1] === end + 1) {
        end = nums[i + 1];
        i++;
      }
      ranges.push(start === end ? String(start) : start + "-" + end);
      i++;
    }
    return ranges.join(",");
  }

  function toggleLineInSpec(spec, lineNum) {
    var set = parseLineSpec(spec);
    if (set[lineNum]) delete set[lineNum];
    else set[lineNum] = true;
    return serializeLineSpec(set);
  }

  // ---------------------------------------------------------------------
  // data-char-marks parsing/canonicalizing.
  // ---------------------------------------------------------------------


  function serializeCharMarks(marks) {
    var byLine = {};
    marks.forEach(function (m) {
      (byLine[m.line] = byLine[m.line] || []).push(m);
    });
    var lines = Object.keys(byLine)
      .map(Number)
      .sort(function (a, b) {
        return a - b;
      });
    var out = [];
    lines.forEach(function (line) {
      var ranges = byLine[line].slice().sort(function (a, b) {
        return a.start - b.start;
      });
      var merged = [];
      ranges.forEach(function (r) {
        var last = merged[merged.length - 1];
        if (last && r.start <= last.end + 1) last.end = Math.max(last.end, r.end);
        else merged.push({ start: r.start, end: r.end });
      });
      merged.forEach(function (r) {
        out.push(line + ":" + r.start + "-" + r.end);
      });
    });
    return out.join(",");
  }

  // ---------------------------------------------------------------------
  // Re-highlighting a block in place. The plugin (deck.getPlugin
  // "highlight") refuses to re-process an element that already has
  // data-highlighted set (hljs's own re-entrancy guard), and for
  // pipe-step blocks it clones the original <code> into trailing <pre>
  // siblings on every call -- so a clean re-run means: drop our old
  // clones, restore the pristine escaped source + pristine class list
  // onto the original, set the new data-line-numbers, and let the plugin
  // rebuild from there.
  // ---------------------------------------------------------------------

  function reHighlightBlock(original, editedStepIndex) {
    var plugin = deck.getPlugin("highlight");
    if (!plugin) return;
    var state = codeState.get(original);
    if (!state) return;
    var pre = original.parentElement;

    Array.prototype.slice.call(pre.children).forEach(function (child) {
      if (child !== original && child.tagName === "CODE") pre.removeChild(child);
    });

    original.innerHTML = state.pristineInnerHTML;
    original.className = state.pristineClassName;
    original.removeAttribute("data-highlighted");
    original.removeAttribute("data-fragment-index");
    original.classList.remove("fragment", "visible", "current-fragment");
    original.setAttribute("data-line-numbers", state.currentLineNumbers);
    if (state.currentCharMarks) original.setAttribute("data-char-marks", state.currentCharMarks);
    else original.removeAttribute("data-char-marks");

    plugin.highlightBlock(original);
    // A data-magic-move block's token spans and ghosts were thrown away
    // with the old markup; add them again before the char marks, as on load.
    Array.prototype.forEach.call(pre.querySelectorAll("code[data-magic-ids]"), function (code) {
      wrapMagicMoveTokens(code);
      addMagicMoveGhosts(code);
    });
    applyCharMarksAll(pre, state.currentCharMarks);

    // Reassign fragment indices for the slide (the plugin's fresh clones
    // don't carry the old data-fragment-index values) and reset fragment
    // position back to "nothing revealed" -- the same state a presenter
    // sees on first arriving at the slide. This is a declared prototype
    // quirk (see the module comment / task notes): an edit made mid-step
    // does not try to preserve which step was showing, it resets to
    // step 0, but it never leaves duplicated/ghost fragments behind.
    var slide = original.closest("section.present") || deck.getCurrentSlide();
    if (slide) {
      deck.syncFragments(slide);
      var indices = deck.getIndices();
      deck.slide(indices.h, indices.v, -1);
    }
  }

  function toggleLineNumber(codeEl, lineNum) {
    var pre = codeEl.closest("pre");
    var original = originalCodeElOf(pre);
    var state = codeState.get(original);
    if (!state || !state.hasLineNumbers) return; // no gutter -> out of scope
    if (state.hasHighlightText) {
      // This block's highlights are computed from data-highlight-text at
      // load time (see highlight-text.js); toggling data-line-numbers here
      // would be silently overwritten on the next load, wasting the edit.
      console.warn(
        "[highlight-edit] " +
          state.file +
          ": this block's highlights are declared by content in data-highlight-text -- edit that attribute instead of alt+clicking the gutter.",
      );
      return;
    }
    if (state.hasMarkers) {
      // This block's highlights are computed from inline `@[...]@` markers
      // in the source text (see highlight-markers.js); toggling
      // data-line-numbers here would be silently overwritten on the next
      // load, wasting the edit.
      console.warn(
        "[highlight-edit] " +
          state.file +
          ": this block's highlights are declared by inline @[...]@ markers -- edit the marker text instead of alt+clicking the gutter.",
      );
      return;
    }

    var stepIndex = Array.prototype.indexOf.call(pre.children, codeEl);
    if (stepIndex < 0) stepIndex = 0;
    var steps = state.currentLineNumbers.split("|");
    if (stepIndex >= steps.length) stepIndex = 0;
    steps[stepIndex] = toggleLineInSpec(steps[stepIndex], lineNum);
    state.currentLineNumbers = steps.join("|");

    reHighlightBlock(original, stepIndex);
    postSaveAttr(state, "data-line-numbers", state.currentLineNumbers);
  }

  // Keeps the ORIGINAL element's own data-char-marks attribute in sync
  // with state.currentCharMarks. Not required for our own logic (which
  // always reads state, never the DOM attribute) but avoids a stale
  // attribute value confusing anyone inspecting the live DOM, and keeps
  // future cloneNode(true) pipe-step copies carrying the right value.
  // (The mark-wrapping itself -- applyCharMarksAll and its helpers --
  // lives in ../slide-layout.js.)
  function syncCharMarksAttr(original, state) {
    if (state.currentCharMarks) original.setAttribute("data-char-marks", state.currentCharMarks);
    else original.removeAttribute("data-char-marks");
  }

  function containingLineTd(node) {
    var el = node.nodeType === 1 ? node : node.parentElement;
    return el ? el.closest("td.hljs-ln-code") : null;
  }

  // Maps a DOM Range boundary (node, offset) -- which may land on a text
  // node or, at a span boundary, on an element -- to a 0-based character
  // offset within `td`'s plain textContent.
  function mapToCharOffset(td, node, offset) {
    var targetNode = node;
    var targetOffset = offset;
    if (node.nodeType !== 3) {
      // Element boundary: resolve to the text position it refers to.
      var child = node.childNodes[offset];
      if (child) {
        var walker = document.createTreeWalker(child, NodeFilter.SHOW_TEXT);
        var first = walker.nextNode();
        if (first) {
          targetNode = first;
          targetOffset = 0;
        } else {
          targetNode = null;
        }
      } else {
        // Offset points past the last child -- end of this element's text.
        var nodes = collectTextNodes(node);
        var last = nodes[nodes.length - 1];
        if (last) {
          targetNode = last;
          targetOffset = last.nodeValue.length;
        } else {
          targetNode = null;
        }
      }
    }
    var all = collectTextNodes(td);
    var sum = 0;
    for (var i = 0; i < all.length; i++) {
      if (all[i] === targetNode) return sum + targetOffset;
      sum += all[i].nodeValue.length;
    }
    return sum; // node not found under td (shouldn't happen given caller checks) -> end
  }

  function handleCharDrag(td, charStart, charEnd) {
    var codeEl = td.closest("code");
    var pre = codeEl.closest("pre");
    var original = originalCodeElOf(pre);
    var state = codeState.get(original);
    if (!state) return;
    if (state.hasMarkers) {
      // Same reasoning as the gutter-toggle refusal above: data-char-marks
      // here is recomputed from inline @[...]@ markers on every load, so an
      // alt+drag edit would silently vanish.
      console.warn(
        "[highlight-edit] " +
          state.file +
          ": this block's char marks are declared by inline @[...]@ markers -- edit the marker text instead of alt+dragging.",
      );
      return;
    }

    var lineNum = Number(td.getAttribute("data-line-number"));
    var start = charStart + 1; // 1-based inclusive
    var end = charEnd; // half-open end == inclusive end at 1-based

    var marks = parseCharMarks(state.currentCharMarks);
    var exactIdx = -1;
    for (var i = 0; i < marks.length; i++) {
      if (marks[i].line === lineNum && marks[i].start === start && marks[i].end === end) {
        exactIdx = i;
        break;
      }
    }
    if (exactIdx >= 0) marks.splice(exactIdx, 1); // drag exactly re-covers a mark -> remove it
    else marks.push({ line: lineNum, start: start, end: end }); // otherwise add/merge

    state.currentCharMarks = serializeCharMarks(marks);
    syncCharMarksAttr(original, state);
    applyCharMarksAll(pre, state.currentCharMarks);
    postSaveAttr(state, "data-char-marks", state.currentCharMarks);
  }

  function handleMarkRemove(markSpan) {
    var key = markSpan.getAttribute("data-mark-key") || "";
    var m = /^(\d+):(\d+)-(\d+)$/.exec(key);
    if (!m) return;
    var codeEl = markSpan.closest("code");
    var pre = codeEl.closest("pre");
    var original = originalCodeElOf(pre);
    var state = codeState.get(original);
    if (!state) return;
    if (state.hasMarkers) {
      console.warn(
        "[highlight-edit] " +
          state.file +
          ": this block's char marks are declared by inline @[...]@ markers -- edit the marker text instead of alt+clicking a mark.",
      );
      return;
    }

    var line = Number(m[1]),
      start = Number(m[2]),
      end = Number(m[3]);
    var marks = parseCharMarks(state.currentCharMarks).filter(function (mk) {
      return !(mk.line === line && mk.start === start && mk.end === end);
    });
    state.currentCharMarks = serializeCharMarks(marks);
    syncCharMarksAttr(original, state);
    applyCharMarksAll(pre, state.currentCharMarks);
    postSaveAttr(state, "data-char-marks", state.currentCharMarks);
  }

  function handleGutterClick(numCell) {
    var lineNum = Number(numCell.getAttribute("data-line-number"));
    if (!lineNum) return;
    var codeEl = numCell.closest("code");
    if (!codeEl) return;
    toggleLineNumber(codeEl, lineNum);
  }

  // ---------------------------------------------------------------------
  // Alt-key cursor hint (cosmetic only -- functional gating below always
  // checks the real event's altKey/e.getModifierState, not this).
  // ---------------------------------------------------------------------

  function setAltHint(on) {
    document.body.classList.toggle("hle-alt-down", on);
  }
  window.addEventListener("keydown", function (e) {
    if (e.key === "Alt") setAltHint(true);
  });
  window.addEventListener("keyup", function (e) {
    if (e.key === "Alt") setAltHint(false);
  });
  window.addEventListener("blur", function () {
    setAltHint(false);
  });

  // ---------------------------------------------------------------------
  // Gesture wiring: click (gutter toggle + mark-click-to-remove) and
  // pointerdown/pointerup (drag-to-mark, via the native selection).
  // ---------------------------------------------------------------------

  var suppressNextClick = false;
  var dragStartTd = null;

  document.addEventListener(
    "pointerdown",
    function (e) {
      if (!editModeOn() || !e.altKey) return;
      var td = e.target.closest("td.hljs-ln-code");
      dragStartTd = td || null;
    },
    true,
  );

  document.addEventListener(
    "pointerup",
    function (e) {
      var startTd = dragStartTd;
      dragStartTd = null;
      if (!startTd || !editModeOn()) return;

      var sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return; // plain click, no drag

      var anchorNode = sel.anchorNode,
        anchorOffset = sel.anchorOffset,
        focusNode = sel.focusNode,
        focusOffset = sel.focusOffset;
      var anchorTd = containingLineTd(anchorNode);
      var focusTd = containingLineTd(focusNode);
      sel.removeAllRanges(); // replace the native selection with our own styling

      if (!anchorTd || !focusTd || anchorTd !== focusTd || anchorTd !== startTd) return; // cross-line drag: out of scope

      var a = mapToCharOffset(startTd, anchorNode, anchorOffset);
      var b = mapToCharOffset(startTd, focusNode, focusOffset);
      var lo = Math.min(a, b),
        hi = Math.max(a, b);
      if (lo === hi) return; // zero-width

      suppressNextClick = true;
      handleCharDrag(startTd, lo, hi);
    },
    true,
  );

  document.addEventListener(
    "click",
    function (e) {
      if (suppressNextClick) {
        suppressNextClick = false;
        return;
      }
      if (!editModeOn() || !e.altKey) return;

      var numCell = e.target.closest("td.hljs-ln-numbers");
      if (numCell) {
        e.preventDefault();
        e.stopPropagation();
        handleGutterClick(numCell);
        return;
      }

      var markSpan = e.target.closest("span.char-mark");
      if (markSpan) {
        e.preventDefault();
        e.stopPropagation();
        handleMarkRemove(markSpan);
        return;
      }
    },
    true,
  );
}
