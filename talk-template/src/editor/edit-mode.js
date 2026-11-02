// Click-to-edit dev mode for GoFish talks, ported from the thesis defense
// deck (phd-thesis-20260618/presentation/edit-mode.js). startDeck() loads it
// only under `pnpm dev` (see ../deck.ts), but it starts disabled -- press "e"
// at any time to toggle it on or off (?edit in the URL starts it on). While
// on, double-click a text element on a slide to edit it in place; blur or
// Cmd/Ctrl+Enter saves back to the matching sections/*.html file via POST
// /save; Esc cancels. The endpoints are served by ./server.ts, which the
// gofishTalk() Vite plugin mounts on the dev server, and every top-level
// slide <section> carries data-src-file/data-src-index (stamped by the same
// plugin in dev only) naming the file and the slide's index within it.
//
// Also while on, a tool shelf in the left margin offers a Select tool
// (default), a Text tool ("t" to toggle, Esc to return to Select), and an
// Image button: click the slide with the Text tool active to drop a new
// free-floating `.slide-annotation` label (POST /add-element), or click the
// Image button (or drag a file from Finder onto a slide) to insert a
// `.slide-image` photo the same way (POST /upload-image then /add-element).
// With the Select tool, drag either kind to reposition it (POST /save-attr),
// drag an image's corner handle to resize it (data-w only -- see
// onResizeMove; holding option resizes about the centre instead of
// pinning the opposite corner), right-click an image for a menu of the four
// stacking-order moves (data-z, also POST /save-attr -- see the restack
// section below), or select + Backspace/Delete to remove it (POST
// /remove-element). See ../style.css for both elements' base appearance and
// positioning contract (data-x/data-y, percent of the 1280x720 slide, plus
// data-w and data-z for images, applied as left/top/width/z-index on every
// load, edit mode or not, by ../slide-layout.js). An annotation can also
// carry data-link="<slug>" to share its position with every other
// annotation bearing the same slug, even across slides -- see linkedPeers/
// syncLinkedPeerPositions/persistAnnotationPosition below.
import {
  MOVABLE_SELECTOR,
  applyAnnotationPosition,
  applyTitleHeadingWidth,
  parseCrop,
} from "../slide-layout.js";

export function installEditMode() {
  "use strict";

  var EDITABLE_TAGS = ["h1", "h2", "h3", "h4", "p", "li", "figcaption", "blockquote", "td", "th"];
  var EDITABLE_SELECTOR = EDITABLE_TAGS.join(",");

  // MOVABLE_SELECTOR (imported): the two kinds of free-floating, drag/
  // select/delete-able element a slide can carry: text annotations (Text
  // tool) and inserted images (Image tool). Select/drag/delete all route
  // through this one selector rather than duplicating the annotation drag
  // implementation per element kind; the annotation-only data-link peer
  // syncing is still gated separately below, since images don't carry
  // data-link.

  function injectStyle() {
    var style = document.createElement("style");
    style.textContent =
      "body.slide-edit-on [data-edit-qualified]:hover {" +
      "  outline: 1px dashed rgba(120,160,255,.7);" +
      "  outline-offset: 2px;" +
      "  cursor: text;" +
      "}" +
      "[data-edit-active] {" +
      "  outline: 2px solid rgba(80,130,255,.9) !important;" +
      "  outline-offset: 2px;" +
      "}" +
      "#edit-mode-badge {" +
      "  position: fixed; top: 8px; right: 8px; z-index: 100000;" +
      "  font: bold 12px/1 -apple-system, sans-serif;" +
      "  background: #2255dd; color: #fff; padding: 6px 10px;" +
      "  border-radius: 4px; letter-spacing: .04em;" +
      "  box-shadow: 0 2px 6px rgba(0,0,0,.25);" +
      "  pointer-events: none;" +
      "}" +
      "#edit-mode-toast {" +
      "  position: fixed; bottom: 16px; left: 50%; transform: translateX(-50%);" +
      "  z-index: 100000; font: 13px/1.4 -apple-system, sans-serif;" +
      "  padding: 8px 14px; border-radius: 5px; color: #fff;" +
      "  box-shadow: 0 2px 8px rgba(0,0,0,.3);" +
      "  opacity: 0; transition: opacity .2s ease;" +
      "  pointer-events: none; max-width: 60vw;" +
      "}" +
      "#edit-mode-toast.visible { opacity: 1; }" +
      "#edit-mode-toast.ok { background: #1a8a3c; }" +
      "#edit-mode-toast.err { background: #c62828; }" +
      // Reveal's slide box sits at roughly a 4% left margin, which at
      // typical window widths is only a few dozen px -- the shelf has to
      // fit inside that or it grazes the slide's left edge. Sized (and
      // pinned close to the viewport edge) to fit a 1440px-wide window's
      // margin; on a narrower or differently-shaped window where reveal's
      // margin ends up smaller than this, the shelf can still overlap the
      // slide by a few px. The translucent background is the mitigation
      // for that case, not a fix.
      "#edit-tool-shelf {" +
      "  position: fixed; top: 50%; left: 4px; transform: translateY(-50%);" +
      "  z-index: 100000; display: flex; flex-direction: column; gap: 4px;" +
      "  padding: 4px; width: 36px; box-sizing: border-box;" +
      "  background: rgba(250, 248, 242, .82); border: 1px solid rgba(30,30,30,.15);" +
      "  border-radius: 7px; box-shadow: 0 2px 10px rgba(0,0,0,.18);" +
      "}" +
      "#edit-tool-shelf button {" +
      "  width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;" +
      "  border: 1px solid transparent; border-radius: 4px; background: transparent;" +
      "  color: #1e1e1e; font: bold 13px/1 -apple-system, sans-serif; cursor: pointer; padding: 0;" +
      "}" +
      "#edit-tool-shelf button:hover { background: rgba(30,30,30,.08); }" +
      "#edit-tool-shelf button.active { background: #2255dd; color: #fff; border-color: #2255dd; }" +
      "#edit-tool-shelf svg { display: block; }" +
      // Right-click menu for an image's stacking order (see showStackMenu).
      // Same panel treatment as the shelf, one step above it in z so it can
      // open over the shelf when a photo sits at the slide's left edge.
      "#edit-context-menu {" +
      "  position: fixed; z-index: 100001; min-width: 148px; padding: 4px;" +
      "  background: rgba(250, 248, 242, .97); border: 1px solid rgba(30,30,30,.15);" +
      "  border-radius: 7px; box-shadow: 0 3px 14px rgba(0,0,0,.22);" +
      "}" +
      "#edit-context-menu button {" +
      "  display: block; width: 100%; text-align: left; padding: 6px 10px;" +
      "  border: 0; border-radius: 4px; background: transparent; color: #1e1e1e;" +
      "  font: 13px/1.2 -apple-system, sans-serif; cursor: pointer;" +
      "}" +
      "#edit-context-menu button:hover:not(:disabled) { background: #2255dd; color: #fff; }" +
      "#edit-context-menu button:disabled { opacity: .35; cursor: default; }" +
      // Selected annotation, image, ordinary slide prose, or the title h1
      // (selectable for its width handle only) all get the same visible
      // outline (distinct color from the qualify-hover/edit-active outlines
      // above) so Backspace/Delete has an obvious target.
      ".slide-annotation[data-edit-selected]," +
      ".slide-image[data-edit-selected]," +
      ".title-slide h1[data-edit-selected]," +
      "[data-edit-qualified][data-edit-selected] {" +
      "  outline: 2px dashed #b24a3b; outline-offset: 3px;" +
      "}" +
      "body.slide-edit-on[data-edit-tool='select'] .slide-annotation:hover," +
      "body.slide-edit-on[data-edit-tool='select'] .slide-image:hover {" +
      "  cursor: move;" +
      "}" +
      // Text tool: crosshair over the whole slide, including elements that
      // would otherwise show the qualify-hover "cursor: text" above.
      "body.slide-edit-on[data-edit-tool='text'] .reveal .slides section," +
      "body.slide-edit-on[data-edit-tool='text'] [data-edit-qualified]:hover {" +
      "  cursor: crosshair;" +
      "}";
    document.head.appendChild(style);
  }

  function injectBadge() {
    var badge = document.createElement("div");
    badge.id = "edit-mode-badge";
    badge.textContent = "EDIT MODE";
    document.body.appendChild(badge);
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

  function normalize(str) {
    return (str || "").replace(/\s+/g, " ").trim();
  }

  function clamp(n, lo, hi) {
    return Math.max(lo, Math.min(hi, n));
  }

  // Shared POST-JSON helper for /save, /save-attr, /add-element, and
  // /remove-element -- they all speak the same { ok, error } response shape.
  function postJSON(url, payload) {
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(function (res) {
      return res.json().then(function (data) {
        return { status: res.status, data: data };
      });
    });
  }

  function findSourceSection(el) {
    var node = el;
    while (node) {
      if (
        node.nodeType === 1 &&
        node.tagName === "SECTION" &&
        node.hasAttribute("data-src-file")
      ) {
        return node;
      }
      node = node.parentElement;
    }
    return null;
  }

  function isQualified(el) {
    if (!el || el.nodeType !== 1) return false;
    var tag = el.tagName.toLowerCase();
    if (EDITABLE_TAGS.indexOf(tag) === -1) return false;
    if (el.closest("aside.notes")) return false;
    var section = findSourceSection(el);
    if (!section) return false;
    return true;
  }

  function markQualified(root) {
    var els = root.querySelectorAll(EDITABLE_SELECTOR);
    for (var i = 0; i < els.length; i++) {
      if (isQualified(els[i])) {
        els[i].setAttribute("data-edit-qualified", "");
      }
    }
  }

  // applyAnnotationPosition, applyImageCrop/parseCrop and
  // applyTitleHeadingWidth live in ../slide-layout.js, since the published
  // deck needs them too and this file only loads in dev. startDeck() runs
  // them over every slide on load; the editor reapplies them after each
  // create/drag/resize/restack/crop.

  function generateAnnotationId() {
    var id;
    do {
      id = "ann-" + Math.random().toString(16).slice(2, 8);
    } while (document.getElementById(id));
    return id;
  }

  // Matches the server's SLIDE_IMAGE_ID_RE (img-<ms-timestamp>-<random>).
  function generateImageId() {
    var id;
    do {
      id = "img-" + Date.now() + "-" + Math.random().toString(16).slice(2, 6);
    } while (document.getElementById(id));
    return id;
  }

  // Adds the four corner resize handles to a .slide-image if it doesn't
  // already have them. Handles are runtime-only DOM (like the left/top/
  // width inline styles applyAnnotationPosition sets): imageSourceHTML below
  // builds the persisted markup from data-x/y/w and the <img>'s own
  // src/alt, never from this element's outerHTML, so the handles never leak
  // into the section file. CSS (see .dm-image-handle in editor.css) keeps
  // them invisible except on the selected image while edit mode is on.
  var IMAGE_CORNERS = ["nw", "ne", "sw", "se"];
  function ensureImageHandles(fig) {
    if (fig.querySelector(".dm-image-handle")) return;
    for (var i = 0; i < IMAGE_CORNERS.length; i++) {
      var handle = document.createElement("div");
      handle.className = "dm-image-handle";
      handle.setAttribute("data-corner", IMAGE_CORNERS[i]);
      fig.appendChild(handle);
    }
  }

  function ensureAllImageHandles(root) {
    var figs = root.querySelectorAll(".slide-image");
    for (var i = 0; i < figs.length; i++) ensureImageHandles(figs[i]);
  }

  // Finds the top-level slide section reveal currently has visible, by
  // walking up from every element reveal has marked .present (there can be
  // more than one in a vertical stack) to its nearest data-src-file
  // ancestor. Used by the Image tool's shelf button, which -- unlike the
  // Text tool's click-to-place -- has no click point on the slide to derive
  // a section from.
  function currentSection() {
    var present = document.querySelectorAll(".reveal .slides section.present");
    for (var i = 0; i < present.length; i++) {
      var section = findSourceSection(present[i]);
      if (section) return section;
    }
    return null;
  }

  var activeEl = null;
  var originalText = "";
  var originalInnerHTML = "";
  var originalStyleAttr = null;
  // Set while `activeEl` is a brand-new annotation the Text tool just
  // created and dropped straight into beginEdit (see onSlideClick below):
  // its commit path is /add-element, not /save, and an empty commit means
  // "discard", not "save the empty string".
  var creatingAnnotation = null;

  function stopNavKeys(e) {
    // Let Esc and Cmd/Ctrl+Enter through to our own handlers below (those
    // are attached separately); everything else is stopped so reveal.js
    // doesn't treat typing as slide navigation.
    e.stopPropagation();
  }

  function beginEdit(el) {
    if (activeEl) return;
    // The element being edited might be the one currently selected (a
    // single click selects prose before a second click starts editing it,
    // and the two states shouldn't both show -- text being typed should
    // only wear the blue active outline, not the red selection one too.
    deselectAnnotation();
    activeEl = el;
    originalText = el.textContent;
    originalInnerHTML = el.innerHTML;

    try {
      el.setAttribute("contenteditable", "plaintext-only");
      if (el.contentEditable !== "true" && el.getAttribute("contenteditable") !== "plaintext-only") {
        throw new Error("unsupported");
      }
    } catch (err) {
      el.setAttribute("contenteditable", "true");
    }
    el.setAttribute("data-edit-active", "");

    // WebKit's plaintext-only editing mode can drop the element's
    // inherited typography while active; pin the computed values as
    // inline styles for the duration of the edit.
    originalStyleAttr = el.getAttribute("style");
    var cs = getComputedStyle(el);
    [
      "font-family",
      "font-size",
      "font-weight",
      "font-style",
      "line-height",
      "letter-spacing",
      "color",
      "text-transform",
      "text-align",
    ].forEach(function (prop) {
      el.style.setProperty(prop, cs.getPropertyValue(prop));
    });

    el.addEventListener("keydown", onKeydown, true);
    el.addEventListener("keyup", stopNavKeys, true);
    el.addEventListener("keypress", stopNavKeys, true);
    el.addEventListener("blur", onBlur);

    el.focus();
    // Place cursor at the end.
    var range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  function endEdit(el) {
    el.removeEventListener("keydown", onKeydown, true);
    el.removeEventListener("keyup", stopNavKeys, true);
    el.removeEventListener("keypress", stopNavKeys, true);
    el.removeEventListener("blur", onBlur);
    el.removeAttribute("contenteditable");
    el.removeAttribute("data-edit-active");
    if (originalStyleAttr === null) {
      el.removeAttribute("style");
    } else {
      el.setAttribute("style", originalStyleAttr);
    }
    originalStyleAttr = null;
    activeEl = null;
  }

  function onKeydown(e) {
    if (e.key === "Escape") {
      e.stopPropagation();
      e.preventDefault();
      var el = activeEl;
      var wasNew = el === creatingAnnotation;
      el.innerHTML = originalInnerHTML;
      endEdit(el);
      if (wasNew) finalizeNewAnnotation(el, true);
      return;
    }
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.stopPropagation();
      e.preventDefault();
      var el2 = activeEl;
      var wasNew2 = el2 === creatingAnnotation;
      endEdit(el2);
      if (wasNew2) {
        finalizeNewAnnotation(el2, false);
      } else {
        saveIfChanged(el2);
      }
      return;
    }
    e.stopPropagation();
  }

  function onBlur() {
    var el = activeEl;
    if (!el) return;
    var wasNew = el === creatingAnnotation;
    endEdit(el);
    if (wasNew) {
      finalizeNewAnnotation(el, false);
    } else {
      saveIfChanged(el);
    }
  }

  function computeOccurrence(section, el, tag, normalizedOriginal) {
    var els = section.querySelectorAll(tag);
    var idx = -1;
    var count = 0;
    for (var i = 0; i < els.length; i++) {
      // The edited element no longer holds its original text at save
      // time, so it must be matched by identity, not by content.
      if (els[i] === el) {
        idx = count;
        break;
      }
      if (normalize(els[i].textContent) === normalizedOriginal) {
        count++;
      }
    }
    return idx;
  }

  function saveIfChanged(el) {
    var newInnerHTML = el.innerHTML;
    if (newInnerHTML === originalInnerHTML) return;

    var section = findSourceSection(el);
    if (!section) {
      toast("Could not find source section for this element", "err");
      el.innerHTML = originalInnerHTML;
      return;
    }
    var file = section.getAttribute("data-src-file");
    var sectionIndex = Number(section.getAttribute("data-src-index"));
    var tag = el.tagName.toLowerCase();
    var normalizedOriginal = normalize(originalText);
    var occurrence = computeOccurrence(section, el, tag, normalizedOriginal);

    if (occurrence === -1) {
      toast("Could not compute occurrence index for save", "err");
      el.innerHTML = originalInnerHTML;
      return;
    }

    var payload = {
      file: file,
      sectionIndex: sectionIndex,
      tag: tag,
      originalText: originalText,
      occurrence: occurrence,
      newInnerHTML: newInnerHTML,
    };

    postJSON("/save", payload)
      .then(function (result) {
        if (result.status === 200 && result.data && result.data.ok) {
          toast("Saved to " + file, "ok");
        } else {
          var msg = (result.data && result.data.error) || "save failed";
          toast(msg, "err");
          el.innerHTML = originalInnerHTML;
        }
      })
      .catch(function (err) {
        toast("Network error: " + err.message, "err");
        el.innerHTML = originalInnerHTML;
      });
  }

  function onDblClick(e) {
    if (!enabled || cropState) return;
    var el = e.target.closest(EDITABLE_SELECTOR);
    if (!el || !el.hasAttribute("data-edit-qualified")) return;
    if (activeEl) return;
    e.preventDefault();
    e.stopPropagation();
    beginEdit(el);
  }

  // ---------------------------------------------------------------------
  // Text tool: create a new annotation, persisted via POST /add-element.
  // ---------------------------------------------------------------------

  // The markup to persist for a new annotation. Deliberately NOT el.outerHTML:
  // the live element also carries runtime-only cruft (data-edit-qualified, the
  // left/top inline styles applyAnnotationPosition sets, whatever beginEdit
  // pinned), none of which belongs in the source file -- and all of which the
  // server's strict single-<p> validator rejects. Building the string here
  // keeps the persisted shape and the runtime DOM independent.
  function annotationSourceHTML(el) {
    // Trim the edges but keep interior newlines: contenteditable turns Enter
    // into a real newline and .slide-annotation is white-space: pre-wrap, so a
    // multi-line label round-trips as typed.
    var text = el.textContent.replace(/\r/g, "").replace(/^\s+|\s+$/g, "");
    var escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return (
      '<p class="slide-annotation" id="' +
      el.id +
      '" data-x="' +
      el.getAttribute("data-x") +
      '" data-y="' +
      el.getAttribute("data-y") +
      '">' +
      escaped +
      "</p>"
    );
  }

  function finalizeNewAnnotation(el, cancelled) {
    creatingAnnotation = null;
    var text = normalize(el.textContent);
    if (cancelled || text === "") {
      if (el.parentNode) el.parentNode.removeChild(el);
      setTool("select");
      return;
    }
    var section = findSourceSection(el);
    if (!section) {
      toast("Could not find source section for this annotation", "err");
      if (el.parentNode) el.parentNode.removeChild(el);
      setTool("select");
      return;
    }
    var file = section.getAttribute("data-src-file");
    var sectionIndex = Number(section.getAttribute("data-src-index"));
    var payload = {
      file: file,
      sectionIndex: sectionIndex,
      html: annotationSourceHTML(el),
    };
    postJSON("/add-element", payload)
      .then(function (result) {
        if (result.status === 200 && result.data && result.data.ok) {
          toast("Saved to " + file, "ok");
        } else {
          var msg = (result.data && result.data.error) || "save failed";
          toast(msg, "err");
          if (el.parentNode) el.parentNode.removeChild(el);
        }
      })
      .catch(function (err) {
        toast("Network error: " + err.message, "err");
        if (el.parentNode) el.parentNode.removeChild(el);
      });
    setTool("select");
  }

  function onSlideClick(e) {
    if (!enabled || tool !== "text") return;
    if (activeEl || cropState) return;
    var section = findSourceSection(e.target);
    if (!section) return;
    e.preventDefault();
    e.stopPropagation();

    var rect = section.getBoundingClientRect();
    var xPct = clamp(((e.clientX - rect.left) / rect.width) * 100, 0, 100);
    var yPct = clamp(((e.clientY - rect.top) / rect.height) * 100, 0, 100);

    var el = document.createElement("p");
    el.className = "slide-annotation";
    el.id = generateAnnotationId();
    el.setAttribute("data-x", xPct.toFixed(1));
    el.setAttribute("data-y", yPct.toFixed(1));
    applyAnnotationPosition(el);
    el.setAttribute("data-edit-qualified", "");
    section.appendChild(el);

    creatingAnnotation = el;
    beginEdit(el);
  }

  // ---------------------------------------------------------------------
  // Image tool: insert a photo, persisted via POST /upload-image (writes
  // the file into <talk>/images/inserted/) followed by POST
  // /add-element (adds the <figure> to the section), mirroring how the
  // Text tool's finalizeNewAnnotation uses /add-element. Two entry points --
  // dropping a file from Finder onto the current slide, and the shelf's
  // Image button, which opens a hidden file input -- both end in
  // insertImage(file, xPct, yPct).
  // ---------------------------------------------------------------------

  // Mirrors annotationSourceHTML: the markup to persist, built from data-x/
  // data-y/data-w/data-z and the <img>'s own src/alt, never from el.outerHTML (the
  // live element also carries the resize handles and the left/top/width
  // inline styles applyAnnotationPosition sets, none of which belong in the
  // source file). Deliberately no height anywhere in this shape -- see the
  // comment on SLIDE_IMAGE_HTML_RE in server.ts.
  function imageSourceHTML(el) {
    var img = el.querySelector("img");
    return (
      '<figure class="slide-image" id="' +
      el.id +
      '" data-x="' +
      el.getAttribute("data-x") +
      '" data-y="' +
      el.getAttribute("data-y") +
      '" data-w="' +
      el.getAttribute("data-w") +
      '" data-z="' +
      el.getAttribute("data-z") +
      '">\n  <img src="' +
      img.getAttribute("src") +
      '" alt="" />\n</figure>'
    );
  }

  function readFileAsBase64(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        // reader.result is "data:<mime>;base64,<payload>" for readAsDataURL.
        var comma = reader.result.indexOf(",");
        resolve(comma === -1 ? reader.result : reader.result.slice(comma + 1));
      };
      reader.onerror = function () {
        reject(reader.error || new Error("could not read file"));
      };
      reader.readAsDataURL(file);
    });
  }

  var DEFAULT_IMAGE_WIDTH_PCT = 25;

  function insertImage(file, xPct, yPct) {
    if (!file) return;
    var section = currentSection();
    if (!section) {
      toast("Could not find current slide to insert image", "err");
      return;
    }

    readFileAsBase64(file)
      .then(function (dataBase64) {
        return postJSON("/upload-image", {
          filename: file.name,
          dataBase64: dataBase64,
        });
      })
      .then(function (result) {
        if (!(result.status === 200 && result.data && result.data.ok)) {
          var msg = (result.data && result.data.error) || "upload failed";
          toast(msg, "err");
          return;
        }
        var src = result.data.src;

        var fig = document.createElement("figure");
        fig.className = "slide-image";
        fig.id = generateImageId();
        fig.setAttribute("data-x", clamp(xPct, 0, 100).toFixed(1));
        fig.setAttribute("data-y", clamp(yPct, 0, 100).toFixed(1));
        fig.setAttribute("data-w", DEFAULT_IMAGE_WIDTH_PCT.toFixed(1));
        // One above whatever is already on this slide, so a photo just
        // dropped in lands on top -- which is where appending it to the
        // section would have put it anyway, before any of its neighbours
        // carried a data-z to outrank it. See the restack section below.
        fig.setAttribute("data-z", String(topStackZ(section) + 1));
        var img = document.createElement("img");
        img.src = src;
        img.alt = "";
        fig.appendChild(img);
        applyAnnotationPosition(fig);
        ensureImageHandles(fig);
        section.appendChild(fig);

        var file2 = section.getAttribute("data-src-file");
        var sectionIndex = Number(section.getAttribute("data-src-index"));
        return postJSON("/add-element", {
          file: file2,
          sectionIndex: sectionIndex,
          html: imageSourceHTML(fig),
        }).then(function (addResult) {
          if (addResult.status === 200 && addResult.data && addResult.data.ok) {
            toast("Saved to " + file2, "ok");
            setTool("select");
            selectAnnotation(fig);
          } else {
            var addMsg = (addResult.data && addResult.data.error) || "save failed";
            toast(addMsg, "err");
            if (fig.parentNode) fig.parentNode.removeChild(fig);
          }
        });
      })
      .catch(function (err) {
        toast("Network error: " + err.message, "err");
      });
  }

  var hiddenImageInput = null;
  function triggerImageFilePicker() {
    if (!hiddenImageInput) {
      hiddenImageInput = document.createElement("input");
      hiddenImageInput.type = "file";
      hiddenImageInput.accept = "image/*";
      hiddenImageInput.style.display = "none";
      hiddenImageInput.addEventListener("change", function () {
        var file = hiddenImageInput.files && hiddenImageInput.files[0];
        // Reset so choosing the same file again still fires 'change'.
        hiddenImageInput.value = "";
        if (file) insertImage(file, 37.5, 37.5);
      });
      document.body.appendChild(hiddenImageInput);
    }
    hiddenImageInput.click();
  }

  function onSlideDragOver(e) {
    if (!enabled) return;
    if (!e.dataTransfer || !e.dataTransfer.types || e.dataTransfer.types.indexOf("Files") === -1) {
      return;
    }
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }

  function onSlideDrop(e) {
    if (!enabled) return;
    var files = e.dataTransfer && e.dataTransfer.files;
    if (!files || files.length === 0) return;
    var section = findSourceSection(e.target);
    if (!section) return;
    e.preventDefault();
    e.stopPropagation();

    var rect = section.getBoundingClientRect();
    var xPct = clamp(((e.clientX - rect.left) / rect.width) * 100, 0, 100);
    var yPct = clamp(((e.clientY - rect.top) / rect.height) * 100, 0, 100);
    insertImage(files[0], xPct, yPct);
  }

  // ---------------------------------------------------------------------
  // Select tool: click to select (Backspace/Delete removes, via POST
  // /remove-element), drag to move (persisted via two POST /save-attr
  // calls, one per axis, on drop).
  // ---------------------------------------------------------------------

  var selectedAnnotation = null;
  var dragState = null;

  function selectAnnotation(el) {
    if (selectedAnnotation === el) return;
    deselectAnnotation();
    selectedAnnotation = el;
    el.setAttribute("data-edit-selected", "");
    if (widthResizeOwner(el)) positionWidthHandle(el);
  }

  function deselectAnnotation() {
    if (!selectedAnnotation) return;
    selectedAnnotation.removeAttribute("data-edit-selected");
    selectedAnnotation = null;
    hideWidthHandle();
  }

  function saveAnnotationAttr(file, sectionIndex, id, attr, value) {
    var payload = {
      file: file,
      sectionIndex: sectionIndex,
      id: id,
      attr: attr,
      value: value,
    };
    return postJSON("/save-attr", payload).then(function (result) {
      if (!(result.status === 200 && result.data && result.data.ok)) {
        var msg = (result.data && result.data.error) || "save failed";
        toast(msg, "err");
      }
    });
  }

  // Persists one annotation's current data-x/data-y to its own source
  // section. Factored out of persistAnnotationPosition so the same per-
  // element save can run for the dragged element and for each of its
  // linked peers (see below) without duplicating the /save-attr shape. A
  // single move is one logical change, so its two calls (one per axis) are
  // chained rather than fired concurrently -- await data-x before POSTing
  // data-y -- even though the server also now serializes same-file writes
  // on its end.
  function persistOneAnnotationPosition(el) {
    var section = findSourceSection(el);
    if (!section) return Promise.resolve();
    var file = section.getAttribute("data-src-file");
    var sectionIndex = Number(section.getAttribute("data-src-index"));
    var id = el.id;
    return saveAnnotationAttr(file, sectionIndex, id, "data-x", el.getAttribute("data-x")).then(
      function () {
        return saveAnnotationAttr(file, sectionIndex, id, "data-y", el.getAttribute("data-y"));
      }
    );
  }

  // Linked annotations: an annotation carrying data-link="<slug>" shares its
  // position with every other .slide-annotation[data-link="<slug>"] in the
  // document -- e.g. the same map label repeated on two slides that reuse
  // the same background art. Peers can live in a different section (even a
  // different file) than `el`; each is still an ordinary /save-attr target
  // addressed by its own file/sectionIndex/id, so no server change is
  // needed.
  function linkedPeers(el) {
    var link = el.getAttribute("data-link");
    if (!link) return [];
    var all = document.querySelectorAll(
      '.slide-annotation[data-link="' + link.replace(/"/g, '\\"') + '"]'
    );
    var peers = [];
    for (var i = 0; i < all.length; i++) {
      if (all[i] !== el) peers.push(all[i]);
    }
    return peers;
  }

  // Copies el's data-x/data-y onto every linked peer and reapplies their
  // on-screen position via the existing applyAnnotationPosition helper.
  // Purely visual -- no persistence -- so it is cheap enough to also call
  // from onDragMove for live feedback while dragging; returns the peer list
  // so callers that also need to persist (persistAnnotationPosition) don't
  // have to recompute it.
  function syncLinkedPeerPositions(el) {
    var peers = linkedPeers(el);
    for (var i = 0; i < peers.length; i++) {
      peers[i].setAttribute("data-x", el.getAttribute("data-x"));
      peers[i].setAttribute("data-y", el.getAttribute("data-y"));
      applyAnnotationPosition(peers[i]);
    }
    return peers;
  }

  function persistAnnotationPosition(el) {
    persistOneAnnotationPosition(el)
      .then(function () {
        var peers = syncLinkedPeerPositions(el);
        return Promise.all(peers.map(persistOneAnnotationPosition));
      })
      .catch(function (err) {
        toast("Network error: " + err.message, "err");
      });
  }

  // ---------------------------------------------------------------------
  // Image resize: dragging a corner handle changes data-w only. Height is
  // never computed -- the <img> is always width:100%; height:auto (see
  // ../style.css), so there is no second dimension for the aspect ratio to
  // drift against; it is locked by construction, not by any ratio-checking
  // logic here. `ratio` below (the rendered box's height/width in CSS
  // pixels at drag start) is used only to hold the rest of the box still
  // in screen space while the width changes -- the opposite corner by
  // default, or the centre while option is held -- and it never touches
  // data-w itself. Rendered-pixel ratios are safe to mix with percent-of-section
  // math here because Reveal's CSS-transform scale multiplies both the
  // image's rendered width and height by the same factor, so it cancels
  // out of the height/width ratio (raw client-rect pixels are normally NOT
  // safe to mix with unscaled style values, because of that same scale).
  //
  // `ratio` is measured off the FIGURE's rect, not the <img>'s. For an
  // uncropped image the two are identical (the figure is exactly the
  // picture -- see the .slide-image CSS comment). For a cropped image
  // they're not: clip-path doesn't change layout geometry, so the <img>'s
  // own rect is still the full, unclipped source image scaled up, while
  // the figure's rect (sized via data-w plus the aspect-ratio
  // applyImageCrop sets) is the visible, cropped box -- the one this drag
  // is actually resizing.
  // ---------------------------------------------------------------------

  var resizeState = null;

  function onImageHandleMouseDown(e, handle) {
    var fig = handle.closest(".slide-image");
    if (!fig) return;
    e.preventDefault();
    e.stopPropagation();
    var figRect = fig.getBoundingClientRect();
    resizeState = {
      el: fig,
      corner: handle.getAttribute("data-corner"),
      startClientX: e.clientX,
      startX: parseFloat(fig.getAttribute("data-x")) || 0,
      startY: parseFloat(fig.getAttribute("data-y")) || 0,
      startW: parseFloat(fig.getAttribute("data-w")) || DEFAULT_IMAGE_WIDTH_PCT,
      ratio: figRect.width > 0 ? figRect.height / figRect.width : 1,
      changed: false,
    };
    document.addEventListener("mousemove", onResizeMove);
    document.addEventListener("mouseup", onResizeUp);
  }

  function onResizeMove(e) {
    if (!resizeState) return;
    var section = findSourceSection(resizeState.el);
    if (!section) return;
    var rect = section.getBoundingClientRect();
    var dxPct = ((e.clientX - resizeState.startClientX) / rect.width) * 100;
    var isLeft = resizeState.corner === "nw" || resizeState.corner === "sw";
    var isTop = resizeState.corner === "nw" || resizeState.corner === "ne";

    // Holding option resizes about the centre instead of pinning the
    // opposite corner. Read live from the event rather than captured at
    // mousedown, so the key can be pressed or released part way through a
    // drag and the shape follows. The dragged corner tracks the pointer in
    // both modes, which is why the centre mode takes twice the delta: the
    // opposite corner is moving the same distance the other way.
    var fromCentre = e.altKey;
    var grow = isLeft ? -dxPct : dxPct;
    var newW = clamp(resizeState.startW + (fromCentre ? 2 * grow : grow), 2, 100);
    if (Math.abs(newW - resizeState.startW) > 0.05) resizeState.changed = true;

    // Percent-of-height-per-percent-of-width, so a width delta can be
    // converted to how far the (auto) height grows in the same
    // percent-of-section-rect units data-y uses.
    var k = resizeState.ratio * (rect.width / rect.height);

    var newX = resizeState.startX;
    var newY = resizeState.startY;
    if (fromCentre) {
      var centreX = resizeState.startX + resizeState.startW / 2;
      var centreY = resizeState.startY + (resizeState.startW * k) / 2;
      newX = centreX - newW / 2;
      newY = centreY - (newW * k) / 2;
    } else {
      if (isLeft) {
        var oldRight = resizeState.startX + resizeState.startW;
        newX = oldRight - newW;
      }
      if (isTop) {
        var oldBottom = resizeState.startY + resizeState.startW * k;
        newY = oldBottom - newW * k;
      }
    }

    resizeState.el.setAttribute("data-x", newX.toFixed(1));
    resizeState.el.setAttribute("data-y", newY.toFixed(1));
    resizeState.el.setAttribute("data-w", newW.toFixed(1));
    applyAnnotationPosition(resizeState.el);
  }

  function onResizeUp() {
    document.removeEventListener("mousemove", onResizeMove);
    document.removeEventListener("mouseup", onResizeUp);
    if (!resizeState) return;
    var el = resizeState.el;
    var changed = resizeState.changed;
    resizeState = null;
    if (changed) persistImageResize(el);
  }

  function persistImageResize(el) {
    var section = findSourceSection(el);
    if (!section) return;
    var file = section.getAttribute("data-src-file");
    var sectionIndex = Number(section.getAttribute("data-src-index"));
    var id = el.id;
    saveAnnotationAttr(file, sectionIndex, id, "data-x", el.getAttribute("data-x"))
      .then(function () {
        return saveAnnotationAttr(file, sectionIndex, id, "data-y", el.getAttribute("data-y"));
      })
      .then(function () {
        return saveAnnotationAttr(file, sectionIndex, id, "data-w", el.getAttribute("data-w"));
      })
      .catch(function (err) {
        toast("Network error: " + err.message, "err");
      });
  }

  // ---------------------------------------------------------------------
  // Crop mode: press "c" with a .slide-image selected (or the context
  // menu's Crop item) to enter. A full-size, unclipped overlay shows the
  // whole source image with the current crop window drawn over it (dimmed
  // outside); the four handles resize the window, dragging inside it moves
  // it. Enter/click-outside/"c" again commits, Escape cancels.
  //
  // The key move: while the session is open, the underlying full image
  // never moves on screen -- only the crop window moves within it. Its box
  // (fullX/fullY/fullWPct/fullHPct below) is derived once at entry from
  // whatever crop (or lack of one) is already showing, and held fixed.
  // Commit then re-derives data-x/data-y/data-w from that fixed box plus
  // wherever the window ended up, which is what keeps the kept region
  // visually anchored -- see the commit-message derivation for why this
  // particular formula is the one that cancels out regardless of the
  // window's start or end position.
  // ---------------------------------------------------------------------

  var CROP_MIN_PCT = 4; // minimum crop window size, percent of the source image, each axis
  var cropState = null;

  function currentCropOrFull(fig) {
    return parseCrop(fig) || { l: 0, t: 0, w: 100, h: 100 };
  }

  // Moves both the visible crop-rect (with its handles) and the dim mask's
  // punched-out hole to the current l/t/w/h -- two elements because they
  // live in different clipping contexts, see the DOM-shape comment in
  // enterCropMode.
  function positionCropRect() {
    var s = cropState;
    if (!s) return;
    s.rectEl.style.left = s.l + "%";
    s.rectEl.style.top = s.t + "%";
    s.rectEl.style.width = s.w + "%";
    s.rectEl.style.height = s.h + "%";
    s.dimRect.style.left = s.l + "%";
    s.dimRect.style.top = s.t + "%";
    s.dimRect.style.width = s.w + "%";
    s.dimRect.style.height = s.h + "%";
  }

  function onCropRectMouseDown(e) {
    if (!cropState || e.target.closest(".crop-rect-handle")) return;
    e.preventDefault();
    e.stopPropagation();
    cropState.drag = {
      mode: "move",
      startClientX: e.clientX,
      startClientY: e.clientY,
      startL: cropState.l,
      startT: cropState.t,
    };
    document.addEventListener("mousemove", onCropDragMove);
    document.addEventListener("mouseup", onCropDragUp);
  }

  function onCropHandleMouseDown(e, corner) {
    if (!cropState) return;
    e.preventDefault();
    e.stopPropagation();
    cropState.drag = {
      mode: "resize",
      corner: corner,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startL: cropState.l,
      startT: cropState.t,
      startW: cropState.w,
      startH: cropState.h,
    };
    document.addEventListener("mousemove", onCropDragMove);
    document.addEventListener("mouseup", onCropDragUp);
  }

  function onCropDragMove(e) {
    var s = cropState;
    if (!s || !s.drag) return;
    // The overlay's own rect IS the 0-100% source-image coordinate space
    // (that's exactly what fullWPct/fullHPct size it to be), so a pixel
    // delta over its width/height converts straight to source-percent --
    // no separate scale factor needed the way the slide-percent drags
    // elsewhere in this file need one.
    var rect = s.overlay.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    var dxPct = ((e.clientX - s.drag.startClientX) / rect.width) * 100;
    var dyPct = ((e.clientY - s.drag.startClientY) / rect.height) * 100;

    if (s.drag.mode === "move") {
      s.l = clamp(s.drag.startL + dxPct, 0, 100 - s.w);
      s.t = clamp(s.drag.startT + dyPct, 0, 100 - s.h);
    } else {
      var corner = s.drag.corner;
      var isLeft = corner === "nw" || corner === "sw";
      var isTop = corner === "nw" || corner === "ne";
      var right = s.drag.startL + s.drag.startW;
      var bottom = s.drag.startT + s.drag.startH;
      if (isLeft) {
        s.l = clamp(s.drag.startL + dxPct, 0, right - CROP_MIN_PCT);
        s.w = right - s.l;
      } else {
        s.w = clamp(s.drag.startW + dxPct, CROP_MIN_PCT, 100 - s.drag.startL);
      }
      if (isTop) {
        s.t = clamp(s.drag.startT + dyPct, 0, bottom - CROP_MIN_PCT);
        s.h = bottom - s.t;
      } else {
        s.h = clamp(s.drag.startH + dyPct, CROP_MIN_PCT, 100 - s.drag.startT);
      }
    }
    positionCropRect();
  }

  function onCropDragUp() {
    document.removeEventListener("mousemove", onCropDragMove);
    document.removeEventListener("mouseup", onCropDragUp);
    if (cropState) cropState.drag = null;
  }

  function enterCropMode(fig) {
    if (cropState || !fig) return;
    var img = fig.querySelector("img");
    if (!img) return;
    if (img.naturalWidth === 0) {
      toast("Image still loading -- try again in a moment", "err");
      return;
    }
    var section = findSourceSection(fig);
    if (!section) return;

    var crop = currentCropOrFull(fig);
    var dataX = parseFloat(fig.getAttribute("data-x")) || 0;
    var dataY = parseFloat(fig.getAttribute("data-y")) || 0;
    var dataW = parseFloat(fig.getAttribute("data-w")) || DEFAULT_IMAGE_WIDTH_PCT;

    // The full source image's box, in the same percent-of-slide units
    // data-x/data-y/data-w use, worked back from the CURRENTLY VISIBLE
    // crop window. Held fixed for the whole session -- see the block
    // comment above.
    var fullWPct = (dataW * 100) / crop.w;
    var fullHPct = fullWPct * (img.naturalHeight / img.naturalWidth) * (1280 / 720);
    var fullX = dataX - (crop.l / 100) * fullWPct;
    var fullY = dataY - (crop.t / 100) * fullHPct;

    // Three layers, all sized/positioned to the full source image's box
    // (fullX/fullY/fullWPct/fullHPct) and sharing one 0-100% coordinate
    // space that IS the source-image percent space data-crop's l/t/w/h
    // already use:
    //   overlay (this element) -- plain positioning, no clipping. Exists
    //     so its own getBoundingClientRect() gives onCropDragMove a stable
    //     reference for converting pointer deltas to source-percent.
    //   fullImg -- the whole, unclipped source picture, painted first.
    //   dimMask -- overflow:hidden, holding dimRect (the box-shadow trick
    //     that dims everything outside the crop window). The clipping has
    //     to live here, not on overlay itself, because...
    //   rectEl -- the crop window's visible border plus its four corner
    //     handles, painted last (on top). NOT inside dimMask: a handle at
    //     a corner touching the source image's edge (true for all four
    //     corners in the common full-frame default) would otherwise have
    //     half its hit area clipped away by dimMask's overflow:hidden,
    //     since a handle's box extends 5px past the crop window's own
    //     edge by design (see .crop-rect-handle's negative margin).
    var overlay = document.createElement("div");
    overlay.className = "crop-overlay";
    overlay.style.left = fullX + "%";
    overlay.style.top = fullY + "%";
    overlay.style.width = fullWPct + "%";
    overlay.style.height = fullHPct + "%";

    var fullImg = document.createElement("img");
    fullImg.className = "crop-overlay-img";
    fullImg.src = img.getAttribute("src");
    fullImg.alt = "";
    overlay.appendChild(fullImg);

    var dimMask = document.createElement("div");
    dimMask.className = "crop-dim-mask";
    var dimRect = document.createElement("div");
    dimRect.className = "crop-dim-rect";
    dimMask.appendChild(dimRect);
    overlay.appendChild(dimMask);

    var rectEl = document.createElement("div");
    rectEl.className = "crop-rect";
    rectEl.addEventListener("mousedown", onCropRectMouseDown);
    IMAGE_CORNERS.forEach(function (corner) {
      var h = document.createElement("div");
      h.className = "crop-rect-handle";
      h.setAttribute("data-corner", corner);
      h.addEventListener("mousedown", function (ev) {
        onCropHandleMouseDown(ev, corner);
      });
      rectEl.appendChild(h);
    });
    overlay.appendChild(rectEl);

    section.appendChild(overlay);
    fig.classList.add("crop-mode-hidden");

    cropState = {
      fig: fig,
      overlay: overlay,
      rectEl: rectEl,
      dimRect: dimRect,
      fullWPct: fullWPct,
      fullHPct: fullHPct,
      fullX: fullX,
      fullY: fullY,
      l: crop.l,
      t: crop.t,
      w: crop.w,
      h: crop.h,
      drag: null,
    };
    positionCropRect();
    toast("Cropping -- drag to move, handles to resize, Enter to commit, Esc to cancel", "ok");
  }

  function exitCropMode() {
    var s = cropState;
    if (!s) return;
    document.removeEventListener("mousemove", onCropDragMove);
    document.removeEventListener("mouseup", onCropDragUp);
    if (s.overlay.parentNode) s.overlay.parentNode.removeChild(s.overlay);
    s.fig.classList.remove("crop-mode-hidden");
    cropState = null;
  }

  function persistImageCrop(el) {
    var section = findSourceSection(el);
    if (!section) return;
    var file = section.getAttribute("data-src-file");
    var sectionIndex = Number(section.getAttribute("data-src-index"));
    var id = el.id;
    saveAnnotationAttr(file, sectionIndex, id, "data-x", el.getAttribute("data-x"))
      .then(function () {
        return saveAnnotationAttr(file, sectionIndex, id, "data-y", el.getAttribute("data-y"));
      })
      .then(function () {
        return saveAnnotationAttr(file, sectionIndex, id, "data-w", el.getAttribute("data-w"));
      })
      .then(function () {
        return saveAnnotationAttr(file, sectionIndex, id, "data-crop", el.getAttribute("data-crop"));
      })
      .catch(function (err) {
        toast("Network error: " + err.message, "err");
      });
  }

  function commitCropMode() {
    var s = cropState;
    if (!s) return;
    var fig = s.fig;
    var newW = s.fullWPct * (s.w / 100);
    var newX = s.fullX + (s.l / 100) * s.fullWPct;
    var newY = s.fullY + (s.t / 100) * s.fullHPct;
    var cropValue =
      s.l.toFixed(1) + "," + s.t.toFixed(1) + "," + s.w.toFixed(1) + "," + s.h.toFixed(1);

    exitCropMode();

    fig.setAttribute("data-x", newX.toFixed(1));
    fig.setAttribute("data-y", newY.toFixed(1));
    fig.setAttribute("data-w", newW.toFixed(1));
    fig.setAttribute("data-crop", cropValue);
    applyAnnotationPosition(fig);
    selectAnnotation(fig);
    persistImageCrop(fig);
  }

  function cancelCropMode() {
    if (!cropState) return;
    var fig = cropState.fig;
    exitCropMode();
    selectAnnotation(fig);
  }

  // Removes a crop entirely -- the image snaps back to showing its full
  // source frame within its current box. data-x/data-y/data-w are left
  // alone; only data-crop changes, sent empty so the server deletes the
  // attribute (see ATTR_EMPTY_MEANS_REMOVE in server.ts).
  function resetCrop(fig) {
    if (!fig.hasAttribute("data-crop")) return;
    fig.removeAttribute("data-crop");
    applyAnnotationPosition(fig);
    var section = findSourceSection(fig);
    if (!section) return;
    var file = section.getAttribute("data-src-file");
    var sectionIndex = Number(section.getAttribute("data-src-index"));
    saveAnnotationAttr(file, sectionIndex, fig.id, "data-crop", "").catch(function (err) {
      toast("Network error: " + err.message, "err");
    });
  }

  // Crop mode owns the keyboard while it's open: Escape cancels, Enter or
  // "c" again commits, and everything else is swallowed (stopPropagation,
  // same reasoning as stopNavKeys during text editing) so arrows/space
  // don't leak through to reveal's slide navigation and none of the other
  // keydown handlers below (tool shortcuts, delete, the "e" toggle) fire
  // while the overlay is up. Registered with capture:true so it runs
  // before those other document-level (bubble-phase) listeners.
  function onCropKeydown(e) {
    if (!cropState) return;
    e.stopPropagation();
    if (isTypingTarget(e.target)) return;
    if (e.key === "Escape") {
      e.preventDefault();
      cancelCropMode();
    } else if (e.key === "Enter" || e.key === "c" || e.key === "C") {
      e.preventDefault();
      commitCropMode();
    } else {
      e.preventDefault();
    }
  }

  function onCropEnterKeydown(e) {
    if (!enabled || tool !== "select" || activeEl || cropState) return;
    if (isTypingTarget(e.target)) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key !== "c" && e.key !== "C") return;
    if (!selectedAnnotation || !selectedAnnotation.classList.contains("slide-image")) return;
    e.preventDefault();
    enterCropMode(selectedAnnotation);
  }

  // A mousedown outside the overlay commits, same as pressing Enter --
  // the crop-rect's own mousedown handler stops propagation for anything
  // inside the overlay, so this only ever sees clicks that land elsewhere.
  function onCropOutsideMouseDown(e) {
    if (!cropState) return;
    if (cropState.overlay.contains(e.target)) return;
    e.preventDefault();
    e.stopPropagation();
    commitCropMode();
  }

  // ---------------------------------------------------------------------
  // Width handle: a resize handle shown at the right edge of the title
  // slide's <h1> when it is selected. Dragging it sets the h1's data-w
  // (percent of the slide), which ../slide-layout.js turns into the
  // --title-h1-w property that ../style.css reads for its max-width.
  // (The thesis deck also used this handle for its own .ann-project map
  // panels; the template has no such component, so that owner was left
  // out of the port. widthResizeOwner below is still the one place that
  // decides what a handle drag resizes.)
  //
  // Unlike the image corner handles, this can't be a child of the element
  // it resizes: the title h1 is one of EDITABLE_TAGS, and its double-click
  // text edit commits via el.innerHTML (see onBlur) -- a handle element
  // nested inside would get saved as part of the text. So this is one
  // shared element living in document.body, positioned in viewport pixels
  // straight from the selected element's getBoundingClientRect() (which
  // already reflects Reveal's CSS transform), never touching the section's
  // percent-of-slide coordinate space the way data-x/data-y do. The h1
  // needs an id="..." so /save-attr can address it.
  // ---------------------------------------------------------------------

  // Given the selected element, the element whose data-w a width-handle drag
  // actually reads/writes/persists -- the title h1 itself. Returns null when
  // the selection isn't width-resizable at all, which is how
  // selectAnnotation/onSlideMouseDown/the resize handler below decide
  // whether to show or move the handle.
  function widthResizeOwner(el) {
    if (!el) return null;
    if (el.matches(".title-slide h1")) return el;
    return null;
  }

  // Drag range and fallback (used only when data-w is absent, e.g. before
  // the first-ever drag). TITLE_H1_DEFAULT_WIDTH_PCT is 980/1280 -- the px
  // default style.css's .title-slide h1 falls back to, expressed as the same
  // percent-of-slide unit data-w uses everywhere else.
  var TITLE_H1_DEFAULT_WIDTH_PCT = 76.6;
  function widthResizeConfig() {
    return { min: 20, max: 100, defaultW: TITLE_H1_DEFAULT_WIDTH_PCT };
  }

  // Applies the owner's current data-w. Called after every width-handle
  // drag frame, alongside the load-time layoutSlides() call in startDeck().
  function applyWidthOwner(owner) {
    applyTitleHeadingWidth(owner);
  }

  var widthHandleEl = null;
  function ensureWidthHandleEl() {
    if (!widthHandleEl) {
      widthHandleEl = document.createElement("div");
      widthHandleEl.className = "ann-width-handle";
      document.body.appendChild(widthHandleEl);
    }
    return widthHandleEl;
  }

  function positionWidthHandle(panel) {
    var handle = ensureWidthHandleEl();
    var rect = panel.getBoundingClientRect();
    handle.style.left = rect.right + "px";
    handle.style.top = rect.top + "px";
    handle.style.height = rect.height + "px";
    handle.classList.add("ann-width-handle-visible");
  }

  function hideWidthHandle() {
    if (widthHandleEl) widthHandleEl.classList.remove("ann-width-handle-visible");
  }

  var widthResizeState = null;

  function onWidthHandleMouseDown(e) {
    var owner = widthResizeOwner(selectedAnnotation);
    if (!owner) return;
    e.preventDefault();
    e.stopPropagation();
    widthResizeState = {
      panel: selectedAnnotation,
      owner: owner,
      startClientX: e.clientX,
      startW: parseFloat(owner.getAttribute("data-w")) || widthResizeConfig(owner).defaultW,
      changed: false,
    };
    document.addEventListener("mousemove", onWidthResizeMove);
    document.addEventListener("mouseup", onWidthResizeUp);
  }

  function onWidthResizeMove(e) {
    if (!widthResizeState) return;
    var section = findSourceSection(widthResizeState.owner);
    if (!section) return;
    var rect = section.getBoundingClientRect();
    var dxPct = ((e.clientX - widthResizeState.startClientX) / rect.width) * 100;
    var cfg = widthResizeConfig(widthResizeState.owner);
    var newW = clamp(widthResizeState.startW + dxPct, cfg.min, cfg.max);
    if (Math.abs(newW - widthResizeState.startW) > 0.05) widthResizeState.changed = true;
    widthResizeState.owner.setAttribute("data-w", newW.toFixed(1));
    applyWidthOwner(widthResizeState.owner);
    positionWidthHandle(widthResizeState.panel);
  }

  function onWidthResizeUp() {
    document.removeEventListener("mousemove", onWidthResizeMove);
    document.removeEventListener("mouseup", onWidthResizeUp);
    if (!widthResizeState) return;
    var owner = widthResizeState.owner;
    var changed = widthResizeState.changed;
    widthResizeState = null;
    if (changed) persistWidthOwner(owner);
  }

  function persistWidthOwner(owner) {
    var section = findSourceSection(owner);
    if (!section) return;
    var file = section.getAttribute("data-src-file");
    var sectionIndex = Number(section.getAttribute("data-src-index"));
    saveAnnotationAttr(file, sectionIndex, owner.id, "data-w", owner.getAttribute("data-w")).catch(
      function (err) {
        toast("Network error: " + err.message, "err");
      }
    );
  }

  function onSlideMouseDown(e) {
    if (!enabled || tool !== "select" || activeEl || cropState) return;
    // A right- or middle-click belongs to onSlideContextMenu, which does
    // its own selecting -- starting a position drag from one would move
    // the image out from under the menu it just opened. A click inside the
    // menu isn't a slide click at all; letting it fall through would clear
    // the selection the menu is about to act on.
    if (e.button !== 0) return;
    if (contextMenu && contextMenu.contains(e.target)) return;
    var widthHandle = e.target.closest(".ann-width-handle");
    if (widthHandle) {
      onWidthHandleMouseDown(e);
      return;
    }
    var handle = e.target.closest(".dm-image-handle");
    if (handle) {
      onImageHandleMouseDown(e, handle);
      return;
    }
    // The title slide's <h1> is width-resizable (see widthResizeOwner) but
    // not in MOVABLE_SELECTOR -- it has no data-x/data-y of its own, sitting
    // in normal document flow rather than the free-floating coordinate
    // space .slide-annotation/.slide-image use. Select it so its width
    // handle appears, but don't start a position drag for it.
    var titleHeading = e.target.closest(".title-slide h1");
    if (titleHeading) {
      e.preventDefault();
      selectAnnotation(titleHeading);
      return;
    }
    var el = e.target.closest(MOVABLE_SELECTOR);
    if (!el) {
      // Ordinary slide prose (h1-h4, p, li, figcaption, blockquote, td, th)
      // is selectable too, so Backspace/Delete has something to act on --
      // but it's not draggable, so no dragState starts and (unlike the
      // MOVABLE_SELECTOR branch below) preventDefault is skipped: calling it
      // here would suppress the native dblclick that follows a fast second
      // click, which is how onDblClick starts text editing.
      var proseEl = e.target.closest("[data-edit-qualified]");
      if (proseEl) {
        selectAnnotation(proseEl);
        return;
      }
      deselectAnnotation();
      return;
    }
    e.preventDefault();
    selectAnnotation(el);
    dragState = {
      el: el,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startX: parseFloat(el.getAttribute("data-x")) || 0,
      startY: parseFloat(el.getAttribute("data-y")) || 0,
      moved: false,
    };
    document.addEventListener("mousemove", onDragMove);
    document.addEventListener("mouseup", onDragUp);
  }

  function onDragMove(e) {
    if (!dragState) return;
    var section = findSourceSection(dragState.el);
    if (!section) return;
    var rect = section.getBoundingClientRect();
    var dxPct = ((e.clientX - dragState.startClientX) / rect.width) * 100;
    var dyPct = ((e.clientY - dragState.startClientY) / rect.height) * 100;
    if (Math.abs(dxPct) > 0.1 || Math.abs(dyPct) > 0.1) dragState.moved = true;
    var newX = clamp(dragState.startX + dxPct, 0, 100);
    var newY = clamp(dragState.startY + dyPct, 0, 100);
    dragState.el.setAttribute("data-x", newX.toFixed(1));
    dragState.el.setAttribute("data-y", newY.toFixed(1));
    applyAnnotationPosition(dragState.el);
    if (dragState.el.classList.contains("slide-annotation")) {
      syncLinkedPeerPositions(dragState.el);
    }
  }

  function onDragUp() {
    document.removeEventListener("mousemove", onDragMove);
    document.removeEventListener("mouseup", onDragUp);
    if (!dragState) return;
    var el = dragState.el;
    var moved = dragState.moved;
    dragState = null;
    if (moved) persistAnnotationPosition(el);
  }

  // Builds the /remove-text payload for a selected prose element, using the
  // same tag + originalText + occurrence locator saveIfChanged uses for
  // /save (see computeOccurrence above) -- reused rather than reinvented so
  // the server has exactly one addressing scheme for prose elements to
  // support. Returns null if the occurrence can't be computed (should only
  // happen if the section's markup changed under us since load).
  function computeRemoveTextPayload(el) {
    var section = findSourceSection(el);
    if (!section) return null;
    var file = section.getAttribute("data-src-file");
    var sectionIndex = Number(section.getAttribute("data-src-index"));
    var tag = el.tagName.toLowerCase();
    var text = el.textContent;
    var occurrence = computeOccurrence(section, el, tag, normalize(text));
    if (occurrence === -1) return null;
    return {
      file: file,
      sectionIndex: sectionIndex,
      tag: tag,
      originalText: text,
      occurrence: occurrence,
    };
  }

  // Removes a selected [data-edit-qualified] prose element via POST
  // /remove-text: optimistic DOM removal, restored on failure. Unlike the
  // MOVABLE_SELECTOR annotation path's best-effort appendChild restore, this
  // captures the exact insertion point (parent + next sibling) beforehand so
  // a failed request leaves the element back in its original position, not
  // appended to the end of the section.
  function removeTextElement(el) {
    var payload = computeRemoveTextPayload(el);
    deselectAnnotation();
    if (!payload) {
      toast("Could not compute occurrence index for delete", "err");
      return;
    }
    var parent = el.parentNode;
    var nextSibling = el.nextSibling;
    if (parent) parent.removeChild(el);

    postJSON("/remove-text", payload)
      .then(function (result) {
        if (result.status === 200 && result.data && result.data.ok) {
          toast("Removed from " + payload.file, "ok");
        } else {
          var msg = (result.data && result.data.error) || "remove failed";
          toast(msg, "err");
          if (parent) parent.insertBefore(el, nextSibling);
        }
      })
      .catch(function (err) {
        toast("Network error: " + err.message, "err");
        if (parent) parent.insertBefore(el, nextSibling);
      });
  }

  function onDeleteKeydown(e) {
    if (!enabled || cropState) return;
    if (e.key !== "Backspace" && e.key !== "Delete") return;
    if (isTypingTarget(e.target)) return;
    if (!selectedAnnotation) return;

    if (selectedAnnotation.matches(MOVABLE_SELECTOR)) {
      e.preventDefault();

      var el = selectedAnnotation;
      var section = findSourceSection(el);
      deselectAnnotation();

      if (!section) {
        if (el.parentNode) el.parentNode.removeChild(el);
        return;
      }
      var file = section.getAttribute("data-src-file");
      var sectionIndex = Number(section.getAttribute("data-src-index"));
      var id = el.id;
      if (el.parentNode) el.parentNode.removeChild(el);

      postJSON("/remove-element", { file: file, sectionIndex: sectionIndex, id: id })
        .then(function (result) {
          if (result.status === 200 && result.data && result.data.ok) {
            toast("Removed from " + file, "ok");
          } else {
            var msg = (result.data && result.data.error) || "remove failed";
            toast(msg, "err");
            section.appendChild(el); // best-effort restore; exact sibling order not preserved
          }
        })
        .catch(function (err) {
          toast("Network error: " + err.message, "err");
          section.appendChild(el);
        });
      return;
    }

    // The title h1 is selectable for its width handle only (see
    // widthResizeOwner) and was never added via /add-element or as ordinary
    // prose content in the /remove-text sense -- deleting it makes no sense,
    // so leave it alone rather than trying to remove the slide's heading.
    if (selectedAnnotation.matches(".title-slide h1")) return;

    if (!selectedAnnotation.hasAttribute("data-edit-qualified")) return;

    var tag = selectedAnnotation.tagName.toLowerCase();
    if (tag === "td" || tag === "th") {
      e.preventDefault();
      toast("Can't delete a table cell -- it would break the table's row structure", "err");
      return;
    }

    e.preventDefault();
    removeTextElement(selectedAnnotation);
  }

  // ---------------------------------------------------------------------
  // Image stacking order: right-click a photo with the Select tool for a
  // menu of the four ordering moves. Order is stored per image as data-z,
  // an absolute z-index persisted through the same POST /save-attr path as
  // data-x/data-y/data-w and applied by applyAnnotationPosition.
  //
  // A restack renumbers every image on the slide from STACK_BASE_Z upward
  // rather than nudging the one value, so the stored numbers stay a dense
  // sequence that can't collide or drift out of range, and the menu's
  // "forward"/"backward" have an unambiguous neighbour to swap with even
  // before any image has a data-z. The first restack on a slide therefore
  // writes a data-z for most of its images; later ones rewrite only the
  // ones whose place actually moved, since restackImage persists only
  // changed values.
  // ---------------------------------------------------------------------

  // .slide-image's own z-index in ../style.css. Stored data-z values start
  // here so a restacked image keeps the same relationship to the rest of
  // the slide's content that every image has by default, instead of
  // sinking beneath it at 0.
  var STACK_BASE_Z = 5;

  function stackZ(el) {
    var z = parseInt(el.getAttribute("data-z"), 10);
    return isNaN(z) ? STACK_BASE_Z : z;
  }

  // The z of the section's frontmost image, or the base if it has none --
  // what insertImage adds one to so a new photo lands on top.
  function topStackZ(section) {
    var figs = section.querySelectorAll(".slide-image");
    var top = STACK_BASE_Z;
    for (var i = 0; i < figs.length; i++) top = Math.max(top, stackZ(figs[i]));
    return top;
  }

  // The section's images in painting order, back to front. querySelectorAll
  // returns document order, which is exactly how equal z-indexes break
  // ties, so a stable sort on data-z alone reproduces the on-screen order.
  function stackOrder(section) {
    var figs = Array.prototype.slice.call(section.querySelectorAll(".slide-image"));
    figs.sort(function (a, b) {
      return stackZ(a) - stackZ(b);
    });
    return figs;
  }

  var STACK_MOVES = {
    front: function (at, count) {
      return count - 1;
    },
    forward: function (at) {
      return at + 1;
    },
    backward: function (at) {
      return at - 1;
    },
    back: function () {
      return 0;
    },
  };

  // Where `move` puts the image currently at index `at`, clamped to the
  // stack. Equal to `at` when the move is a no-op (already frontmost,
  // already backmost) -- which is also what greys the menu item out.
  function stackDestination(move, at, count) {
    return clamp(STACK_MOVES[move](at, count), 0, count - 1);
  }

  function restackImage(fig, move) {
    var section = findSourceSection(fig);
    if (!section) return;
    var order = stackOrder(section);
    var at = order.indexOf(fig);
    if (at === -1) return;
    var to = stackDestination(move, at, order.length);
    if (to === at) return;
    order.splice(at, 1);
    order.splice(to, 0, fig);

    var changed = [];
    for (var i = 0; i < order.length; i++) {
      var z = String(STACK_BASE_Z + i);
      if (order[i].getAttribute("data-z") === z) continue;
      order[i].setAttribute("data-z", z);
      applyAnnotationPosition(order[i]);
      changed.push(order[i]);
    }
    persistStackOrder(section, changed);
  }

  // One /save-attr per image whose data-z moved, chained rather than fired
  // together for the same reason a drag chains its two axes: it is one
  // logical change, and each request rewrites the same section file.
  function persistStackOrder(section, changed) {
    if (!changed.length) return;
    var file = section.getAttribute("data-src-file");
    var sectionIndex = Number(section.getAttribute("data-src-index"));
    var chain = Promise.resolve();
    changed.forEach(function (el) {
      chain = chain.then(function () {
        return saveAnnotationAttr(file, sectionIndex, el.id, "data-z", el.getAttribute("data-z"));
      });
    });
    chain
      .then(function () {
        toast("Saved to " + file, "ok");
      })
      .catch(function (err) {
        toast("Network error: " + err.message, "err");
      });
  }

  var STACK_MENU_ITEMS = [
    { move: "front", label: "Bring to Front" },
    { move: "forward", label: "Bring Forward" },
    { move: "backward", label: "Send Backward" },
    { move: "back", label: "Send to Back" },
  ];

  var contextMenu = null;

  function hideContextMenu() {
    if (!contextMenu) return;
    if (contextMenu.parentNode) contextMenu.parentNode.removeChild(contextMenu);
    contextMenu = null;
  }

  function showStackMenu(fig, clientX, clientY) {
    hideContextMenu();
    var section = findSourceSection(fig);
    if (!section) return;
    var order = stackOrder(section);
    var at = order.indexOf(fig);

    var menu = document.createElement("div");
    menu.id = "edit-context-menu";
    STACK_MENU_ITEMS.forEach(function (item) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = item.label;
      btn.disabled = stackDestination(item.move, at, order.length) === at;
      btn.addEventListener("click", function () {
        hideContextMenu();
        restackImage(fig, item.move);
      });
      menu.appendChild(btn);
    });

    // Crop, and (only once a crop exists) Reset Crop -- the two entry
    // points into the crop-mode block above that don't require the "c"
    // shortcut.
    var cropBtn = document.createElement("button");
    cropBtn.type = "button";
    cropBtn.textContent = "Crop";
    cropBtn.addEventListener("click", function () {
      hideContextMenu();
      enterCropMode(fig);
    });
    menu.appendChild(cropBtn);

    if (fig.hasAttribute("data-crop")) {
      var resetBtn = document.createElement("button");
      resetBtn.type = "button";
      resetBtn.textContent = "Reset Crop";
      resetBtn.addEventListener("click", function () {
        hideContextMenu();
        resetCrop(fig);
      });
      menu.appendChild(resetBtn);
    }

    menu.style.left = clientX + "px";
    menu.style.top = clientY + "px";
    document.body.appendChild(menu);
    // Re-placed once it has a measured size, so a right-click near the
    // right or bottom edge doesn't push the menu off screen.
    var rect = menu.getBoundingClientRect();
    menu.style.left = Math.max(4, Math.min(clientX, window.innerWidth - rect.width - 4)) + "px";
    menu.style.top = Math.max(4, Math.min(clientY, window.innerHeight - rect.height - 4)) + "px";
    contextMenu = menu;
  }

  function onSlideContextMenu(e) {
    if (!enabled || tool !== "select" || activeEl || cropState) return;
    var fig = e.target.closest(".slide-image");
    if (!fig || !findSourceSection(fig)) return;
    e.preventDefault();
    e.stopPropagation();
    selectAnnotation(fig);
    showStackMenu(fig, e.clientX, e.clientY);
  }

  // A mousedown outside the menu closes it; so does any keystroke, since
  // the menu has no keyboard interaction of its own and every key that
  // does something here (slide nav, Delete, the tool shortcuts) means the
  // menu is stale.
  function onMouseDownDismissMenu(e) {
    if (!contextMenu) return;
    if (contextMenu.contains(e.target)) return;
    hideContextMenu();
  }

  // ---------------------------------------------------------------------
  // Tool shelf
  // ---------------------------------------------------------------------

  var tool = "select";

  // A plain arrow-cursor glyph (Feather-style "mouse-pointer" fill) for
  // Select, and a plain "T" glyph for Text -- no icon library, no CDN.
  var SELECT_ICON_SVG =
    '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">' +
    '<path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" fill="currentColor"/>' +
    "</svg>";

  // A plain "picture" glyph (Feather-style "image" icon: frame + sun +
  // mountain) for the Image tool -- same no-icon-library, no-CDN approach as
  // Select's arrow.
  var IMAGE_ICON_SVG =
    '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">' +
    '<rect x="3" y="4" width="18" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2"/>' +
    '<circle cx="8.5" cy="9.5" r="1.5" fill="currentColor"/>' +
    '<path d="M4 17l5-5 4 4 3-3 4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
    "</svg>";

  function setTool(next) {
    if (tool === next) return;
    tool = next;
    document.body.setAttribute("data-edit-tool", tool);
    if (tool !== "select") deselectAnnotation();
    updateShelfActive();
  }

  function updateShelfActive() {
    var shelf = document.getElementById("edit-tool-shelf");
    if (!shelf) return;
    var btns = shelf.querySelectorAll("button[data-tool]");
    for (var i = 0; i < btns.length; i++) {
      var isActive = btns[i].getAttribute("data-tool") === tool;
      btns[i].classList.toggle("active", isActive);
    }
  }

  function injectShelf() {
    if (document.getElementById("edit-tool-shelf")) return;
    var shelf = document.createElement("div");
    shelf.id = "edit-tool-shelf";
    shelf.innerHTML =
      '<button type="button" data-tool="select" title="Select tool (Esc)" aria-label="Select tool">' +
      SELECT_ICON_SVG +
      "</button>" +
      '<button type="button" data-tool="text" title="Text tool (T)" aria-label="Text tool">T</button>' +
      '<button type="button" data-tool="image" title="Insert image" aria-label="Insert image">' +
      IMAGE_ICON_SVG +
      "</button>";
    shelf.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-tool]");
      if (!btn) return;
      var toolName = btn.getAttribute("data-tool");
      if (toolName === "image") {
        triggerImageFilePicker();
        return;
      }
      setTool(toolName);
    });
    document.body.appendChild(shelf);
    updateShelfActive();
  }

  function removeShelf() {
    var shelf = document.getElementById("edit-tool-shelf");
    if (shelf && shelf.parentNode) shelf.parentNode.removeChild(shelf);
  }

  function onToolShortcutKeydown(e) {
    if (!enabled || cropState) return;
    if (isTypingTarget(e.target)) return;
    if (activeEl) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === "t" || e.key === "T") {
      e.preventDefault();
      setTool(tool === "text" ? "select" : "text");
    } else if (e.key === "Escape" && tool !== "select") {
      setTool("select");
    }
  }

  var enabled = false;

  function isTypingTarget(el) {
    if (!el || el.nodeType !== 1) return false;
    var tag = el.tagName.toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select") return true;
    if (el.isContentEditable) return true;
    return false;
  }

  function setEnabled(on) {
    if (on === enabled) return;
    if (!on && activeEl) {
      // Mid-edit: end the edit through the normal blur/save path rather
      // than silently discarding what was typed.
      activeEl.blur();
    }
    enabled = on;
    if (enabled) {
      injectBadge();
      injectShelf();
      tool = "select";
      document.body.setAttribute("data-edit-tool", tool);
      updateShelfActive();
      toast("edit mode on — double-click text to edit, click it and press delete to remove", "ok");
    } else {
      var badge = document.getElementById("edit-mode-badge");
      if (badge) badge.parentNode.removeChild(badge);
      removeShelf();
      hideContextMenu();
      deselectAnnotation();
      document.body.removeAttribute("data-edit-tool");
      toast("edit mode off", "ok");
    }
    document.body.classList.toggle("slide-edit-on", enabled);
    window.dispatchEvent(
      new CustomEvent("editmodechange", { detail: { enabled: enabled } })
    );
  }

  function onToggleKeydown(e) {
    if (e.key !== "e" && e.key !== "E") return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (isTypingTarget(e.target)) return;
    if (activeEl || cropState) return;
    setEnabled(!enabled);
  }

  function init() {
    injectStyle();
    var slidesRoot = document.querySelector(".reveal .slides");
    if (slidesRoot) {
      // Positions/sizes were already applied by startDeck()'s
      // layoutSlides() call (see ../slide-layout.js).
      markQualified(slidesRoot);
      ensureAllImageHandles(slidesRoot);
    }
    document.addEventListener("dblclick", onDblClick, true);
    document.addEventListener("keydown", onToggleKeydown);
    document.addEventListener("keydown", onToolShortcutKeydown);
    document.addEventListener("keydown", onDeleteKeydown);
    document.addEventListener("keydown", onCropEnterKeydown);
    document.addEventListener("keydown", onCropKeydown, true);
    document.addEventListener("mousedown", onSlideMouseDown, true);
    document.addEventListener("mousedown", onMouseDownDismissMenu, true);
    document.addEventListener("mousedown", onCropOutsideMouseDown, true);
    document.addEventListener("keydown", hideContextMenu, true);
    document.addEventListener("contextmenu", onSlideContextMenu, true);
    document.addEventListener("click", onSlideClick, true);
    document.addEventListener("dragover", onSlideDragOver);
    document.addEventListener("drop", onSlideDrop);
    window.addEventListener("resize", function () {
      hideContextMenu();
      if (widthResizeOwner(selectedAnnotation)) {
        positionWidthHandle(selectedAnnotation);
      }
    });
    if (new URLSearchParams(location.search).has("edit")) {
      setEnabled(true);
    }
  }

  // startDeck() calls installEditMode() from a module script, which runs
  // after the document has parsed and before Reveal starts.
  init();
}
