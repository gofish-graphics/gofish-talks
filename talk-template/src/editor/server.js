// Save endpoints for the in-browser slide editor, mounted on the Vite dev
// server by the gofishTalk() plugin (../vite.ts). Ported from the thesis
// defense deck's edit-server.mjs; the request handlers, the string surgery
// on the section files and the auto-commit are unchanged. What changed is
// what Vite now does instead of that file's own server:
//
//   - Serving the deck and its files is Vite's job, so the static file
//     server, the redirect from / and the port setting are gone.
//   - Live reload: the original watched presentation/ and pushed a reload
//     to every open tab over a /watch server-sent-events stream, skipping
//     files it had just written itself so a save didn't reload the page out
//     from under the person editing. Vite's own watcher and HMR socket now
//     do the watching and reloading; the plugin asks isSelfWrite() below
//     before reloading for a section file, which keeps the original's
//     skip-own-writes rule. /watch is gone.
//   - Which files may be written: the original accepted any
//     presentation/sections/*.html. Here 'file' must be one of the section
//     files the talk lists in gofishTalk({ sections }), named by its path
//     relative to the talk folder (e.g. "sections/03-verbs.html") -- the
//     same string the plugin stamps on each slide as data-src-file.
//   - Uploaded images go into <talk>/images/inserted/.
//
// Every save also auto-commits, a few seconds after edits go quiet, so hand
// edits made through the deck land in git history instead of sitting as
// accumulating uncommitted state. Set AUTOCOMMIT=0 to turn that off; it also
// turns itself off if the talk isn't inside a git repo. Only the files the
// editor itself wrote are staged and committed, and only if they are inside
// the talk's own folder.
//
// Endpoints (all POST, JSON in, { ok, error? } out):
//   /save            replace the inner HTML of one text element
//   /save-attr       set one data-* attribute (position, size, crop,
//                    stacking order, code highlights)
//   /add-element     add an annotation <p> or image <figure> to a slide
//   /remove-element  remove one of those, by id
//   /remove-text     remove an ordinary text element
//   /upload-image    write an image file, returns its src

import fs from "node:fs/promises";
import fsSync from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFile as execFileCb } from "node:child_process";
import { promisify } from "node:util";

const execFile = promisify(execFileCb);

class SaveError extends Error {}

// ---------------------------------------------------------------------------
// Entity decode / encode
// ---------------------------------------------------------------------------

const NAMED_ENTITIES = {
  ldquo: "“",
  rdquo: "”",
  lsquo: "‘",
  rsquo: "’",
  hellip: "…",
  mdash: "—",
  ndash: "–",
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  times: "×",
  rarr: "→",
  larr: "←",
  darr: "↓",
  uarr: "↑",
};

function decodeEntities(str) {
  return str.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (whole, ent) => {
    if (ent[0] === "#") {
      const codePoint =
        ent[1] === "x" || ent[1] === "X"
          ? parseInt(ent.slice(2), 16)
          : parseInt(ent.slice(1), 10);
      if (!Number.isNaN(codePoint)) return String.fromCodePoint(codePoint);
      return whole;
    }
    if (Object.prototype.hasOwnProperty.call(NAMED_ENTITIES, ent)) {
      return NAMED_ENTITIES[ent];
    }
    return whole;
  });
}

function stripTags(str) {
  return str.replace(/<[^>]*>/g, "");
}

function normalizeText(str) {
  return str.replace(/\s+/g, " ").trim();
}

function normalizedInnerText(sourceFragment) {
  return normalizeText(decodeEntities(stripTags(sourceFragment)));
}

// Reverse direction: typographic characters -> named entities, matching the
// style already used in the section files. Leaves &amp;/&lt;/&gt;/&quot;
// escaping alone (DOM serialization already produces the right thing there).
function reencodeTypography(str) {
  return str
    .replace(/“/g, "&ldquo;")
    .replace(/”/g, "&rdquo;")
    .replace(/‘/g, "&lsquo;")
    .replace(/’/g, "&rsquo;")
    .replace(/…/g, "&hellip;")
    .replace(/—/g, "&mdash;")
    .replace(/–/g, "&ndash;")
    .replace(/ /g, "&nbsp;");
}

// Cache, per file, whether the file already contains raw non-ASCII bytes
// outside of what we're about to write. If so, we leave any other non-ASCII
// characters in the replacement as raw UTF-8 instead of numeric-entity-izing
// them, to match the file's existing convention.
function fileUsesRawNonAscii(fileText) {
  // Strip out the entities we already understand, then check what's left.
  return /[^\x00-\x7f]/.test(fileText);
}

function reencodeReplacement(newInnerHTML, fileText) {
  let out = reencodeTypography(newInnerHTML);
  if (!fileUsesRawNonAscii(fileText)) {
    out = out.replace(/[^\x00-\x7f]/g, (ch) => `&#${ch.codePointAt(0)};`);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Section / tag span scanning (string surgery, no HTML parser)
// ---------------------------------------------------------------------------

// Finds all depth-0 <section ...>...</section> spans in `text`.
// Returns array of {start, end, openEnd, closeStart} where:
//   text.slice(start, end) is the whole section incl. tags
//   text.slice(openEnd, closeStart) is the inner content
export function findTopLevelSections(text) {
  const tagRe = /<section\b[^>]*>|<\/section>/g;
  const spans = [];
  let depth = 0;
  let openStart = -1;
  let openEnd = -1;
  let m;
  while ((m = tagRe.exec(text)) !== null) {
    const isClose = m[0] === "</section>";
    if (!isClose) {
      if (depth === 0) {
        openStart = m.index;
        openEnd = m.index + m[0].length;
      }
      depth++;
    } else {
      depth--;
      if (depth === 0) {
        spans.push({
          start: openStart,
          end: m.index + m[0].length,
          openEnd,
          closeStart: m.index,
        });
      } else if (depth < 0) {
        // Unbalanced markup; bail out rather than produce garbage.
        return null;
      }
    }
  }
  if (depth !== 0) return null;
  return spans;
}

// Finds all depth-0 <tag ...>...</tag> spans within `text` (a substring,
// e.g. the inner content of a section). Void/self-closing elements are not
// a concern for the editable tag set we use (h1-h4, p, li, figcaption,
// blockquote, td, th).
function findTagSpans(text, tag) {
  const openRe = new RegExp(`<${tag}\\b[^>]*>`, "gi");
  const closeRe = new RegExp(`</${tag}>`, "gi");
  const tokenRe = new RegExp(`<${tag}\\b[^>]*>|</${tag}>`, "gi");
  const spans = [];
  let depth = 0;
  let openStart = -1;
  let openEnd = -1;
  let m;
  while ((m = tokenRe.exec(text)) !== null) {
    const isClose = /^<\//.test(m[0]);
    if (!isClose) {
      if (depth === 0) {
        openStart = m.index;
        openEnd = m.index + m[0].length;
      }
      depth++;
    } else {
      depth--;
      if (depth === 0) {
        spans.push({
          start: openStart,
          end: m.index + m[0].length,
          openEnd,
          closeStart: m.index,
          openTag: text.slice(openStart, openEnd),
        });
      }
    }
  }
  return spans;
}

// ---------------------------------------------------------------------------
// Per-file write queue -- every mutating handler below (/save, /save-attr,
// /add-element, /remove-element) does its own read-file -> splice ->
// write-file cycle with no other coordination. Two requests that land for
// the same file (e.g. a drag's data-x and data-y /save-attr calls, fired
// back to back) would otherwise both read the pre-change file and the
// later write would silently clobber the earlier one. Keyed by absolute
// path, so unrelated files never wait on each other.
// ---------------------------------------------------------------------------

const fileQueues = new Map();

// Runs `fn` only after every previously queued job for `key` has settled,
// so a file's read-modify-write cycles run strictly one at a time. The
// promise stored in the map always resolves (its rejection is swallowed)
// so that one job throwing doesn't wedge the queue for the next caller;
// the promise returned to *this* caller is `fn`'s own, unswallowed, so the
// existing try/catch -> SaveError -> HTTP response handling is unaffected.
function withFileQueue(key, fn) {
  const prev = fileQueues.get(key) || Promise.resolve();
  const run = prev.then(fn);
  fileQueues.set(
    key,
    run.then(
      () => {},
      () => {},
    ),
  );
  return run;
}

// ---------------------------------------------------------------------------
// Source stamps -- dev only, used by the gofishTalk() plugin when it inlines
// the section files. The thesis deck's loader stamped each top-level
// <section> of each file with data-src-file/data-src-index in the browser;
// the plugin does it here, on the file text, with the same comment-masked
// findTopLevelSections the save handlers use to find the slide again, so
// the index the browser reports always names the section the server edits.
// ---------------------------------------------------------------------------

export function stampSourceAttributes(fileText, relFile) {
  const maskedText = fileText.replace(/<!--[\s\S]*?-->/g, (m) =>
    " ".repeat(m.length),
  );
  const spans = findTopLevelSections(maskedText);
  // Unbalanced markup: leave the file unstamped, so its slides are simply
  // not editable (the save handlers would refuse the file anyway).
  if (!spans) return fileText;
  let out = fileText;
  for (let i = spans.length - 1; i >= 0; i--) {
    const at = spans[i].start + "<section".length;
    out =
      out.slice(0, at) +
      ` data-src-file="${relFile}" data-src-index="${i}"` +
      out.slice(at);
  }
  return out;
}

// ---------------------------------------------------------------------------
// HTTP server
// ---------------------------------------------------------------------------

function sendJSON(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store",
  });
  res.end(body);
}

function readBody(req, maxBytes = 5 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > maxBytes) {
        reject(new Error("body too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

// ---------------------------------------------------------------------------
// The edit server for one talk. `root` is the talk folder (Vite's root),
// `sectionFiles` maps each allowed data-src-file value to its absolute path,
// and `log` is { info, error }.
// ---------------------------------------------------------------------------

export function createEditServer({ root, sectionFiles, log }) {
  const ROOT = root;

  function resolveSectionFile(file) {
    if (typeof file !== "string" || !sectionFiles.has(file)) {
      throw new SaveError("invalid or missing 'file' (not one of this talk's section files)");
    }
    const abs = sectionFiles.get(file);
    if (!fsSync.existsSync(abs)) {
      throw new SaveError(`file does not exist: ${file}`);
    }
    return abs;
  }

  // ---------------------------------------------------------------------------
  // Own writes
  // ---------------------------------------------------------------------------
  // The server both writes the section files (the edit-mode save paths) and
  // Vite watches them, so an inline edit would otherwise reload the tab out
  // from under the person typing. Every save marks its target path just
  // before the rename, and the plugin skips the reload for a marked path
  // within the grace window.

  const SELF_WRITE_GRACE_MS = 2000;
  const selfWrites = new Map(); // absolute path -> expiry timestamp

  // Publishes a file the server itself just wrote, so the watcher ignores the
  // event it is about to see. Every save path renames through here.
  async function renameIntoPlace(tmp, abs) {
    selfWrites.set(abs, Date.now() + SELF_WRITE_GRACE_MS);
    await fs.rename(tmp, abs);
    scheduleAutoCommit(abs);
  }

  function isSelfWrite(abs) {
    const until = selfWrites.get(abs);
    if (until === undefined) return false;
    if (Date.now() > until) {
      selfWrites.delete(abs);
      return false;
    }
    return true;
  }

  // ---------------------------------------------------------------------------
  // Auto-commit
  // ---------------------------------------------------------------------------
  // Every save is a hand edit made through the deck, so it's worth
  // capturing in git history rather than letting it sit as accumulating
  // uncommitted state in the checkout. renameIntoPlace above is the one place
  // every mutating handler's write passes through, so it's the one place this
  // hooks in -- the handlers themselves know nothing about git.
  //
  // A single gesture fires several saves back to back (a drag's data-x then
  // data-y, or a paragraph's intermediate blurs while editing), so commits are
  // debounced: the path just written joins a pending set, and a timer keeps
  // getting pushed back until AUTOCOMMIT_DEBOUNCE_MS passes with no further
  // write, at which point everything pending becomes one commit. git itself
  // only ever runs one command at a time, chained onto `gitQueue`, so a commit
  // still in flight when the timer fires again doesn't race it.

  const AUTOCOMMIT_DEBOUNCE_MS = 4000;

  // Found asynchronously on startup (the original did this with a top-level
  // await before listening); a save that lands before it resolves waits on
  // it in the git queue below.
  let REPO_ROOT = null;
  let autocommitEnabled = process.env.AUTOCOMMIT !== "0";
  const repoReady = !autocommitEnabled
    ? Promise.resolve()
    : execFile("git", ["rev-parse", "--show-toplevel"], { cwd: ROOT }).then(
        ({ stdout }) => {
          REPO_ROOT = stdout.trim();
          log.info(
            "slide editor: auto-commit on; saves land as git commits a few seconds after edits go quiet (AUTOCOMMIT=0 turns this off)",
          );
        },
        (err) => {
          autocommitEnabled = false;
          log.error(
            `slide editor: the talk isn't in a git repo, auto-commit is off: ${err.message}`,
          );
        },
      );

  const pendingCommitPaths = new Set();
  let commitTimer = null;
  let gitQueue = repoReady;

  // Called from renameIntoPlace after every successful write. Only records the
  // path and (re)arms the debounce timer; the actual git work happens once
  // things go quiet.
  function scheduleAutoCommit(abs) {
    if (!autocommitEnabled) return;
    // Only ever commit inside the talk's own folder. Every path the handlers
    // write already is (a listed section file or images/inserted/), so this
    // is a guard, not a filter that is expected to drop anything.
    if (!abs.startsWith(path.resolve(ROOT) + path.sep)) {
      log.error(`slide editor: not auto-committing ${abs}, it is outside the talk folder`);
      return;
    }
    pendingCommitPaths.add(abs);
    if (commitTimer) clearTimeout(commitTimer);
    commitTimer = setTimeout(() => {
      commitTimer = null;
      const paths = [...pendingCommitPaths];
      pendingCommitPaths.clear();
      gitQueue = gitQueue.then(() => runAutoCommit(paths));
    }, AUTOCOMMIT_DEBOUNCE_MS);
  }

  // Stages exactly the paths that were written -- never anything else that
  // might be dirty in the checkout -- commits only if that staging actually
  // changed something (a no-op save must not create an empty commit), and
  // swallows any error. This runs fire-and-forget well after the HTTP response
  // for the save that triggered it has already gone out, so there's no request
  // left to fail; a failure here just means the next scheduled commit (or a
  // manual one) picks up the same paths later.
  async function runAutoCommit(absPaths) {
    if (!autocommitEnabled || !REPO_ROOT) return;
    const relPaths = absPaths.map((p) => path.relative(REPO_ROOT, p));
    try {
      await execFile("git", ["add", "--", ...relPaths], { cwd: REPO_ROOT });
      try {
        await execFile("git", ["diff", "--cached", "--quiet", "--", ...relPaths], {
          cwd: REPO_ROOT,
        });
        return; // exit 0: nothing staged for these paths, nothing to commit
      } catch (diffErr) {
        // exit 1 is "there are staged changes", which is the expected case
        // that sends us on to commit; anything else is a real git failure.
        if (diffErr.code !== 1) throw diffErr;
      }
      const message =
        relPaths.length === 1
          ? `Edit mode: update ${relPaths[0]}`
          : `Edit mode: update ${relPaths.length} files`;
      await execFile("git", ["commit", "-m", message, "--", ...relPaths], {
        cwd: REPO_ROOT,
      });
    } catch (err) {
      log.error(`slide editor: auto-commit failed: ${err.message}`);
    }
  }

  // ---------------------------------------------------------------------------
  // /save handling
  // ---------------------------------------------------------------------------


  // Shared locator for /save and /remove-text: both address an element by
  // tag + originalText + occurrence (edit-mode.js's saveIfChanged and
  // computeRemoveTextPayload build the same payload shape), so both need to
  // resolve that triple to the same matched <tag> span within
  // sectionInnerMasked. `file`/`sectionIndex` are used only to phrase the
  // error if nothing matches.
  function locateTagOccurrence(sectionInnerMasked, tag, originalText, occurrence, file, sectionIndex) {
    const candidates = findTagSpans(sectionInnerMasked, tag);
    const normalizedOriginal = normalizeText(originalText);

    const matches = candidates.filter(
      (c) =>
        normalizedInnerText(sectionInnerMasked.slice(c.openEnd, c.closeStart)) ===
        normalizedOriginal,
    );

    if (occurrence >= matches.length) {
      throw new SaveError(
        `could not locate element <${tag}> matching originalText (occurrence ${occurrence} of ${matches.length} matches) in ${file} section ${sectionIndex} -- the source may have changed, or this is generated content`,
      );
    }

    return matches[occurrence];
  }

  async function handleSave(body) {
    const { file, sectionIndex, tag, originalText, occurrence, newInnerHTML } =
      body;

    const abs = resolveSectionFile(file);
    if (
      typeof sectionIndex !== "number" ||
      !Number.isInteger(sectionIndex) ||
      sectionIndex < 0
    ) {
      throw new SaveError("invalid or missing 'sectionIndex'");
    }
    if (typeof tag !== "string" || !/^[a-zA-Z0-9]+$/.test(tag)) {
      throw new SaveError("invalid or missing 'tag'");
    }
    if (typeof originalText !== "string") {
      throw new SaveError("missing 'originalText'");
    }
    if (
      typeof occurrence !== "number" ||
      !Number.isInteger(occurrence) ||
      occurrence < 0
    ) {
      throw new SaveError("invalid or missing 'occurrence'");
    }
    if (typeof newInnerHTML !== "string") {
      throw new SaveError("missing 'newInnerHTML'");
    }

    await withFileQueue(abs, async () => {
      const fileText = await fs.readFile(abs, "utf8");

      // Scan on a copy with HTML comments blanked out (same length, so all
      // offsets remain valid in the real text). The browser never parses
      // comment content, so commented-out slides must not count as sections
      // or match as candidates -- but splicing still happens on fileText.
      const maskedText = fileText.replace(/<!--[\s\S]*?-->/g, (m) =>
        " ".repeat(m.length),
      );

      const sectionSpans = findTopLevelSections(maskedText);
      if (!sectionSpans) {
        throw new SaveError(`could not parse top-level sections in ${file}`);
      }
      if (sectionIndex >= sectionSpans.length) {
        throw new SaveError(
          `sectionIndex ${sectionIndex} out of range (file has ${sectionSpans.length} top-level sections)`,
        );
      }
      const section = sectionSpans[sectionIndex];
      const sectionInner = fileText.slice(section.openEnd, section.closeStart);
      const sectionInnerMasked = maskedText.slice(
        section.openEnd,
        section.closeStart,
      );

      const target = locateTagOccurrence(
        sectionInnerMasked,
        tag,
        originalText,
        occurrence,
        file,
        sectionIndex,
      );
      const replacementInner = reencodeReplacement(newInnerHTML, fileText);

      const newSectionInner =
        sectionInner.slice(0, target.openEnd) +
        replacementInner +
        sectionInner.slice(target.closeStart);

      const newFileText =
        fileText.slice(0, section.openEnd) +
        newSectionInner +
        fileText.slice(section.closeStart);

      // Atomic write: temp file in same dir, then rename.
      const dir = path.dirname(abs);
      const tmp = path.join(
        dir,
        `.${path.basename(abs)}.tmp-${process.pid}-${Date.now()}`,
      );
      await fs.writeFile(tmp, newFileText, "utf8");
      await renameIntoPlace(tmp, abs);
    });
  }

  // ---------------------------------------------------------------------------
  // /save-attr handling -- the direct-manipulation save path (see
  // edit-mode.js and highlight-edit.js). Same file/sectionIndex
  // validation as /save. The target element is addressed EITHER by
  // `id="..."` within the section (annotations, images, the title h1) OR by `codeOccurrence` (0-based index of the <code>
  // element within the section's source order, comments masked --
  // highlight-edit.js's shape, since code blocks in this deck don't carry a
  // real id attribute). Exactly one attribute's value is replaced.
  // ---------------------------------------------------------------------------

  const ATTR_NAME_RE = /^data-[a-zA-Z0-9-]+$/;
  const SMALL_NONNEG_INT_RE = /^\d{1,4}$/; // up to 9999; plenty for a spacing value

  // Per-attribute value validators. Anything not listed falls back to
  // SMALL_NONNEG_INT_RE (the original single-purpose behavior, still exactly
  // right for data-spacing).
  const ATTR_VALUE_VALIDATORS = {
    "data-line-numbers": /^[0-9,|\- ]{0,200}$/,
    "data-char-marks": /^[0-9:,\- ]{0,500}$/,
    // Annotation position, percent of the 1280x720 slide box, one decimal
    // place (see edit-mode.js's drag-to-move path). Allowed slightly outside
    // 0-100 (a two/three-digit integer part covers that) since a drag can
    // overshoot the slide edge before the pointer clamps it back.
    "data-x": /^-?\d{1,3}(\.\d)?$/,
    "data-y": /^-?\d{1,3}(\.\d)?$/,
    // Inserted-image width, percent of the slide width, one decimal place --
    // the only size an image element stores (see the .slide-image shape in
    // edit-mode.js). Always positive; the client clamps to [2, 100] but the
    // server only needs to keep the shape sane.
    "data-w": /^\d{1,3}(\.\d)?$/,
    // Inserted-image stacking order, written as an absolute z-index (see the
    // restack path in edit-mode.js, which renumbers a slide's images from
    // .slide-image's own base z-index upward). Small non-negative integer --
    // the same shape the fallback validator would give it, spelled out here
    // because this one is a real attribute of the image shape below, not a
    // catch-all case.
    "data-z": /^\d{1,4}$/,
    // Non-destructive image crop: "l,t,w,h", four percentages of the SOURCE
    // image's own natural size (left offset, top offset, width, height), one
    // decimal place each -- see the crop math in edit-mode.js's
    // applyAnnotationPosition. Always within [0,100] (unlike data-x/data-y,
    // which allow slight overshoot for a drag in progress): a crop rect is
    // computed and clamped to the source bounds before it is ever persisted,
    // never dragged past them. The leading `|^$` alternative admits the empty
    // value too -- validation runs before the ATTR_EMPTY_MEANS_REMOVE check
    // below, so without it a reset-crop request (which sends "" on purpose)
    // would be rejected here before ever reaching that removal path.
    "data-crop": /^$|^\d{1,3}(?:\.\d)?(?:,\d{1,3}(?:\.\d)?){3}$/,
  };

  // Attributes whose empty value means "remove the attribute entirely"
  // rather than "write it bare". data-line-numbers is deliberately NOT in
  // this set: an empty data-line-numbers is meaningful (gutter with no
  // highlighted lines), removing it would change rendering (no gutter at
  // all).
  const ATTR_EMPTY_MEANS_REMOVE = new Set(["data-char-marks", "data-crop"]);

  // Locates the open-tag text + start offset for the element this request
  // addresses, within `sectionInner`/`sectionInnerMasked` (same offsets,
  // masked text used only for matching). Returns {openTag, openTagStart} or
  // throws a SaveError.
  function locateTargetOpenTag(body, file, sectionIndex, sectionInner, sectionInnerMasked) {
    const { id, codeOccurrence } = body;
    const hasId = typeof id === "string";
    const hasOccurrence = typeof codeOccurrence === "number";
    if (hasId === hasOccurrence) {
      throw new SaveError("provide exactly one of 'id' or 'codeOccurrence'");
    }

    if (hasId) {
      if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(id)) {
        throw new SaveError("invalid 'id'");
      }
      const idRe = new RegExp(`<[a-zA-Z][a-zA-Z0-9-]*\\b[^>]*\\bid="${id}"[^>]*>`, "g");
      const idMatches = [...sectionInnerMasked.matchAll(idRe)];
      if (idMatches.length !== 1) {
        throw new SaveError(
          `expected exactly one element with id="${id}" in ${file} section ${sectionIndex}, found ${idMatches.length}`,
        );
      }
      return { openTag: idMatches[0][0], openTagStart: idMatches[0].index };
    }

    if (!Number.isInteger(codeOccurrence) || codeOccurrence < 0) {
      throw new SaveError("invalid 'codeOccurrence'");
    }
    const codeSpans = findTagSpans(sectionInnerMasked, "code");
    if (codeOccurrence >= codeSpans.length) {
      throw new SaveError(
        `codeOccurrence ${codeOccurrence} out of range (section has ${codeSpans.length} <code> elements) in ${file} section ${sectionIndex}`,
      );
    }
    const span = codeSpans[codeOccurrence];
    return { openTag: span.openTag, openTagStart: span.start };
  }

  // Computes the splice (absolute offsets into sectionInner) needed to set
  // `attr` to `newValue` on the element whose open tag is `openTag` /
  // `openTagStart`. Handles three existing states: attr="value" (quoted),
  // bare attr (present, no value), and attr absent entirely.
  function computeAttrSplice(openTag, openTagStart, attr, newValue) {
    const quotedRe = new RegExp(`\\b${attr}="([^"]*)"`);
    const quoted = quotedRe.exec(openTag);
    const bareRe = new RegExp(`\\b${attr}\\b(?!=)`);
    const bare = quoted ? null : bareRe.exec(openTag);

    if (quoted && bare) {
      // Can't happen from a single regex pass over one tag, but guard anyway.
      throw new SaveError(`ambiguous ${attr} on target element`);
    }

    const emptyMeansRemove = ATTR_EMPTY_MEANS_REMOVE.has(attr);

    if (quoted) {
      if (newValue === "" && attr === "data-line-numbers") {
        // Rewrite `data-line-numbers="..."` -> bare `data-line-numbers`.
        const start = openTagStart + quoted.index;
        const end = start + quoted[0].length;
        return { start, end, replacement: attr };
      }
      if (newValue === "" && emptyMeansRemove) {
        // Remove the attribute (and one preceding space, if present).
        let start = openTagStart + quoted.index;
        const end = start + quoted[0].length;
        if (start > 0 && /\s/.test(openTag[quoted.index - 1])) start -= 1;
        return { start, end, replacement: "" };
      }
      const valueStart = openTagStart + quoted.index + attr.length + 2; // past `attr="`
      const valueEnd = valueStart + quoted[1].length;
      return { start: valueStart, end: valueEnd, replacement: newValue };
    }

    if (bare) {
      if (newValue === "") {
        // Already bare and staying empty -- no-op.
        const start = openTagStart + bare.index;
        const end = start + attr.length;
        return { start, end, replacement: attr };
      }
      const start = openTagStart + bare.index;
      const end = start + attr.length;
      return { start, end, replacement: `${attr}="${newValue}"` };
    }

    // Attribute entirely absent.
    if (newValue === "") {
      // Nothing to insert and nothing to remove -- no-op splice.
      const pos = openTagStart + openTag.length;
      return { start: pos, end: pos, replacement: "" };
    }
    // Insert right before the closing '>' of the opening tag.
    const gtPos = openTagStart + openTag.length - 1;
    return { start: gtPos, end: gtPos, replacement: ` ${attr}="${newValue}"` };
  }

  async function handleSaveAttr(body) {
    const { file, sectionIndex, attr, value } = body;

    const abs = resolveSectionFile(file);
    if (
      typeof sectionIndex !== "number" ||
      !Number.isInteger(sectionIndex) ||
      sectionIndex < 0
    ) {
      throw new SaveError("invalid or missing 'sectionIndex'");
    }
    if (typeof attr !== "string" || !ATTR_NAME_RE.test(attr)) {
      throw new SaveError("invalid or missing 'attr'");
    }
    const validator = ATTR_VALUE_VALIDATORS[attr] || SMALL_NONNEG_INT_RE;
    const valueStr = typeof value === "number" ? String(value) : value;
    if (typeof valueStr !== "string" || !validator.test(valueStr)) {
      throw new SaveError(`'value' is not valid for ${attr}`);
    }

    await withFileQueue(abs, async () => {
      const fileText = await fs.readFile(abs, "utf8");
      const maskedText = fileText.replace(/<!--[\s\S]*?-->/g, (m) =>
        " ".repeat(m.length),
      );

      const sectionSpans = findTopLevelSections(maskedText);
      if (!sectionSpans) {
        throw new SaveError(`could not parse top-level sections in ${file}`);
      }
      if (sectionIndex >= sectionSpans.length) {
        throw new SaveError(
          `sectionIndex ${sectionIndex} out of range (file has ${sectionSpans.length} top-level sections)`,
        );
      }
      const section = sectionSpans[sectionIndex];
      const sectionInner = fileText.slice(section.openEnd, section.closeStart);
      const sectionInnerMasked = maskedText.slice(section.openEnd, section.closeStart);

      const { openTag, openTagStart } = locateTargetOpenTag(
        body,
        file,
        sectionIndex,
        sectionInner,
        sectionInnerMasked,
      );

      const splice = computeAttrSplice(openTag, openTagStart, attr, valueStr);

      const newSectionInner =
        sectionInner.slice(0, splice.start) +
        splice.replacement +
        sectionInner.slice(splice.end);

      const newFileText =
        fileText.slice(0, section.openEnd) +
        newSectionInner +
        fileText.slice(section.closeStart);

      const dir = path.dirname(abs);
      const tmp = path.join(
        dir,
        `.${path.basename(abs)}.tmp-${process.pid}-${Date.now()}`,
      );
      await fs.writeFile(tmp, newFileText, "utf8");
      await renameIntoPlace(tmp, abs);
    });
  }

  // ---------------------------------------------------------------------------
  // /add-element / /remove-element handling -- the text-tool's create/delete
  // path (see edit-mode.js's tool shelf). Narrow by design: the only element
  // shape either endpoint will write is a single slide-annotation <p>, never
  // arbitrary HTML, so this stays string surgery rather than an HTML-injection
  // sink. Both share /save's and /save-attr's file/sectionIndex validation and
  // section-locating helpers.
  // ---------------------------------------------------------------------------

  const ANNOTATION_ID_RE = /^ann-[a-z0-9]+$/;
  // A single well-formed slide-annotation <p>: fixed attribute order (as
  // produced by edit-mode.js's createElement + setAttribute sequence), a
  // numeric one-decimal data-x/data-y, and a text body with no nested tags --
  // entities (e.g. &amp;, &#8217;) are fine, raw '<'/'>' are not.
  const ANNOTATION_HTML_RE =
    /^<p class="slide-annotation" id="(ann-[a-z0-9]+)" data-x="(-?\d{1,3}(?:\.\d)?)" data-y="(-?\d{1,3}(?:\.\d)?)">([^<>]*)<\/p>$/;

  // A single well-formed inserted image <figure>, mirroring ANNOTATION_HTML_RE's
  // strictness for the image-tool's create/delete path (see edit-mode.js's
  // insertImage). Fixed attribute order, a numeric one-decimal data-x/data-y/
  // data-w, an integer data-z (the stacking order -- see the restack path in
  // edit-mode.js), and exactly one <img> child whose src is anchored under
  // images/inserted/ -- checked again below by SLIDE_IMAGE_SRC_RE so a crafted
  // request can't point the <img> at an arbitrary path. Height is deliberately
  // never part of this shape: only data-w is stored, the <img> has no size
  // attributes of its own, and style.css leaves the <img> at width:100%;
  // height:auto, so the aspect ratio cannot drift because there is nowhere to
  // store a conflicting height.
  const SLIDE_IMAGE_ID_RE = /^img-\d+-[a-z0-9]+$/;
  const SLIDE_IMAGE_HTML_RE =
    /^<figure class="slide-image" id="(img-\d+-[a-z0-9]+)" data-x="(-?\d{1,3}(?:\.\d)?)" data-y="(-?\d{1,3}(?:\.\d)?)" data-w="(\d{1,3}(?:\.\d)?)" data-z="(\d{1,4})">\s*\n\s*<img src="([^"<>]*)" alt="" \/>\s*\n\s*<\/figure>$/;
  const SLIDE_IMAGE_SRC_RE =
    /^\.\/images\/inserted\/[a-zA-Z0-9._-]+\.(?:png|jpg|jpeg|gif|webp|svg)$/;

  // Element id -> the tag name that shape uses, so /remove-element can locate
  // the right span without being told the element's kind separately.
  function tagForElementId(id) {
    if (ANNOTATION_ID_RE.test(id)) return "p";
    if (SLIDE_IMAGE_ID_RE.test(id)) return "figure";
    return null;
  }

  function validateFileAndSectionIndex(body) {
    const { file, sectionIndex } = body;
    const abs = resolveSectionFile(file);
    if (
      typeof sectionIndex !== "number" ||
      !Number.isInteger(sectionIndex) ||
      sectionIndex < 0
    ) {
      throw new SaveError("invalid or missing 'sectionIndex'");
    }
    return abs;
  }

  // Loads `abs`, masks comments, and locates the sectionIndex-th top-level
  // section. Returns { fileText, section, sectionInner, sectionInnerMasked }.
  async function locateSection(abs, file, sectionIndex) {
    const fileText = await fs.readFile(abs, "utf8");
    const maskedText = fileText.replace(/<!--[\s\S]*?-->/g, (m) =>
      " ".repeat(m.length),
    );
    const sectionSpans = findTopLevelSections(maskedText);
    if (!sectionSpans) {
      throw new SaveError(`could not parse top-level sections in ${file}`);
    }
    if (sectionIndex >= sectionSpans.length) {
      throw new SaveError(
        `sectionIndex ${sectionIndex} out of range (file has ${sectionSpans.length} top-level sections)`,
      );
    }
    const section = sectionSpans[sectionIndex];
    const sectionInner = fileText.slice(section.openEnd, section.closeStart);
    const sectionInnerMasked = maskedText.slice(
      section.openEnd,
      section.closeStart,
    );
    return { fileText, section, sectionInner, sectionInnerMasked };
  }

  async function writeSectionInner(abs, fileText, section, newSectionInner) {
    const newFileText =
      fileText.slice(0, section.openEnd) +
      newSectionInner +
      fileText.slice(section.closeStart);
    const dir = path.dirname(abs);
    const tmp = path.join(
      dir,
      `.${path.basename(abs)}.tmp-${process.pid}-${Date.now()}`,
    );
    await fs.writeFile(tmp, newFileText, "utf8");
    await renameIntoPlace(tmp, abs);
  }

  // Finds where a new child element should be spliced in (just before the
  // trailing whitespace run that precedes the section's closing tag) and what
  // indentation it should carry (matching the section's existing content --
  // the last non-blank line's indentation -- not the closing tag's own
  // indentation, which sits one level out).
  function computeInsertionPoint(sectionInner) {
    const trailing = /\n([ \t]*)$/.exec(sectionInner);
    const insertAt = trailing ? trailing.index : sectionInner.length;
    const lines = sectionInner.slice(0, insertAt).split("\n");
    let indent = "  ";
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].trim() === "") continue;
      indent = /^[ \t]*/.exec(lines[i])[0];
      break;
    }
    return { insertAt, indent };
  }

  async function handleAddElement(body) {
    const abs = validateFileAndSectionIndex(body);
    const { file, sectionIndex, html } = body;
    if (typeof html !== "string") {
      throw new SaveError("missing 'html'");
    }
    const trimmed = html.trim();
    const annMatch = ANNOTATION_HTML_RE.exec(trimmed);
    const imgMatch = annMatch ? null : SLIDE_IMAGE_HTML_RE.exec(trimmed);
    if (!annMatch && !imgMatch) {
      throw new SaveError(
        "'html' must be a single well-formed <p class=\"slide-annotation\" id=\"ann-...\" data-x=\"..\" data-y=\"..\">text</p> " +
          "or <figure class=\"slide-image\" id=\"img-...\" data-x=\"..\" data-y=\"..\" data-w=\"..\" data-z=\"..\"><img src=\"..\" alt=\"\" /></figure> element",
      );
    }
    if (imgMatch && !SLIDE_IMAGE_SRC_RE.test(imgMatch[6])) {
      throw new SaveError("'html' image src must be './images/inserted/<filename>'");
    }
    const id = (annMatch || imgMatch)[1];

    await withFileQueue(abs, async () => {
      const { fileText, section, sectionInner, sectionInnerMasked } =
        await locateSection(abs, file, sectionIndex);

      const idRe = new RegExp(`\\bid="${id}"`);
      if (idRe.test(sectionInnerMasked)) {
        throw new SaveError(
          `id "${id}" already exists in ${file} section ${sectionIndex}`,
        );
      }

      const { insertAt, indent } = computeInsertionPoint(sectionInner);
      // The image shape spans several lines, so every line after the first
      // gets the surrounding indentation too -- these files are hand-edited,
      // and an <img> flush against column 0 reads as a mistake.
      const indented = html.trim().split("\n").join("\n" + indent);
      const newSectionInner =
        sectionInner.slice(0, insertAt) +
        "\n" +
        indent +
        indented +
        sectionInner.slice(insertAt);

      await writeSectionInner(abs, fileText, section, newSectionInner);
    });
  }

  async function handleRemoveElement(body) {
    const abs = validateFileAndSectionIndex(body);
    const { file, sectionIndex, id } = body;
    const tag = typeof id === "string" ? tagForElementId(id) : null;
    if (!tag) {
      throw new SaveError("invalid or missing 'id'");
    }

    await withFileQueue(abs, async () => {
      const { fileText, section, sectionInner, sectionInnerMasked } =
        await locateSection(abs, file, sectionIndex);

      const spans = findTagSpans(sectionInnerMasked, tag);
      const idRe = new RegExp(`\\bid="${id}"`);
      const target = spans.find((s) =>
        idRe.test(sectionInnerMasked.slice(s.start, s.openEnd)),
      );
      if (!target) {
        throw new SaveError(
          `element with id="${id}" not found in ${file} section ${sectionIndex}`,
        );
      }

      // Remove the whole element plus its own leading indentation and the one
      // newline that precedes it -- i.e. undo exactly what /add-element's
      // splice inserted -- leaving whatever came after untouched, so removing
      // the only annotation on a slide restores the section byte-for-byte.
      let start = target.start;
      while (start > 0 && (sectionInner[start - 1] === " " || sectionInner[start - 1] === "\t")) {
        start--;
      }
      if (start > 0 && sectionInner[start - 1] === "\n") {
        start--;
      }
      const end = target.end;

      const newSectionInner = sectionInner.slice(0, start) + sectionInner.slice(end);

      await writeSectionInner(abs, fileText, section, newSectionInner);
    });
  }

  // ---------------------------------------------------------------------------
  // /remove-text handling -- the Select tool's Backspace/Delete path for
  // ordinary slide prose (see edit-mode.js's removeTextElement), as opposed to
  // /remove-element above which handles free-floating annotations/images. The
  // element is addressed the same way /save addresses it for editing --
  // tag + originalText + occurrence, via locateTagOccurrence -- rather than by
  // id, since prose elements carry no id. td/th are refused here too (not just
  // client-side in onDeleteKeydown) so the rule holds even if a request is
  // sent directly.
  // ---------------------------------------------------------------------------

  async function handleRemoveText(body) {
    const { file, sectionIndex, tag, originalText, occurrence } = body;

    const abs = resolveSectionFile(file);
    if (
      typeof sectionIndex !== "number" ||
      !Number.isInteger(sectionIndex) ||
      sectionIndex < 0
    ) {
      throw new SaveError("invalid or missing 'sectionIndex'");
    }
    if (typeof tag !== "string" || !/^[a-zA-Z0-9]+$/.test(tag)) {
      throw new SaveError("invalid or missing 'tag'");
    }
    const tagLower = tag.toLowerCase();
    if (tagLower === "td" || tagLower === "th") {
      throw new SaveError(
        "cannot remove a table cell -- it would break the table's row structure",
      );
    }
    if (typeof originalText !== "string") {
      throw new SaveError("missing 'originalText'");
    }
    if (
      typeof occurrence !== "number" ||
      !Number.isInteger(occurrence) ||
      occurrence < 0
    ) {
      throw new SaveError("invalid or missing 'occurrence'");
    }

    await withFileQueue(abs, async () => {
      const { fileText, section, sectionInner, sectionInnerMasked } =
        await locateSection(abs, file, sectionIndex);

      const target = locateTagOccurrence(
        sectionInnerMasked,
        tag,
        originalText,
        occurrence,
        file,
        sectionIndex,
      );

      // Remove the whole element plus its own leading indentation and the one
      // newline that precedes it -- same trim-back as handleRemoveElement, so
      // deleting the only paragraph on a line restores the section
      // byte-for-byte rather than leaving a blank line behind.
      let start = target.start;
      while (start > 0 && (sectionInner[start - 1] === " " || sectionInner[start - 1] === "\t")) {
        start--;
      }
      if (start > 0 && sectionInner[start - 1] === "\n") {
        start--;
      }
      const end = target.end;

      const newSectionInner = sectionInner.slice(0, start) + sectionInner.slice(end);

      await writeSectionInner(abs, fileText, section, newSectionInner);
    });
  }

  // ---------------------------------------------------------------------------
  // /upload-image handling -- the image-tool's "get a file onto disk" step
  // (see edit-mode.js's insertImage). Writes into <talk>/images/inserted/
  // and hands back the './images/...' src that the figure element will carry;
  // /add-element (above) is what actually puts the <figure> into a section
  // once the caller has this src. Body cap is raised well past readBody's
  // default 5MB (photos are the whole point) but only for this route.
  // ---------------------------------------------------------------------------

  const UPLOAD_MAX_BYTES = 25 * 1024 * 1024;
  const INSERTED_IMAGES_DIR = path.resolve(ROOT, "images", "inserted");
  // The '<talk>/images/inserted/' folder sits next to index.html, which is
  // where the sections are inlined, so the './images/inserted/...' src below
  // resolves the same in dev and in the build, and Vite bundles the file
  // like any other image a section uses.
  const IMAGE_EXT_RE = /\.(png|jpg|jpeg|gif|webp|svg|heic|heif)$/i;

  // Magic-byte sniff for the raster formats; catches a mislabeled/renamed file
  // (e.g. an .exe renamed to .png) that a filename check alone would miss. SVG
  // is text, not binary-signed, so it's checked separately below.
  function sniffImageBytes(buf, ext) {
    if (ext === ".png") {
      return (
        buf.length >= 8 &&
        buf[0] === 0x89 &&
        buf[1] === 0x50 &&
        buf[2] === 0x4e &&
        buf[3] === 0x47
      );
    }
    if (ext === ".jpg" || ext === ".jpeg") {
      return buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
    }
    if (ext === ".gif") {
      if (buf.length < 6) return false;
      const sig = buf.slice(0, 6).toString("ascii");
      return sig === "GIF87a" || sig === "GIF89a";
    }
    if (ext === ".webp") {
      return (
        buf.length >= 12 &&
        buf.slice(0, 4).toString("ascii") === "RIFF" &&
        buf.slice(8, 12).toString("ascii") === "WEBP"
      );
    }
    if (ext === ".svg") {
      // Text format: require it decodes as UTF-8 text that starts (after
      // whitespace/XML prolog/comments) with an '<', i.e. it's plausibly XML.
      const text = buf.toString("utf8").trimStart();
      return text.startsWith("<");
    }
    if (ext === ".heic" || ext === ".heif") {
      // ISO-BMFF ("ftyp" box): bytes 4-8 are the literal ASCII "ftyp", and the
      // 4-byte major brand right after it names the encoding family. Apple's
      // HEIC photos use "heic"/"heix"; the rest cover other real-world HEIF
      // variants (HEVC-coded images/sequences, and the plain-MIAF/MIF1 forms).
      if (buf.length < 12) return false;
      if (buf.slice(4, 8).toString("ascii") !== "ftyp") return false;
      const brand = buf.slice(8, 12).toString("ascii");
      return [
        "heic",
        "heix",
        "hevc",
        "hevx",
        "heim",
        "heis",
        "hevm",
        "hevs",
        "mif1",
        "msf1",
        "heif",
      ].includes(brand);
    }
    return false;
  }

  async function handleUploadImage(body) {
    const { filename, dataBase64 } = body;
    if (typeof filename !== "string" || filename.length === 0) {
      throw new SaveError("missing 'filename'");
    }
    if (typeof dataBase64 !== "string" || dataBase64.length === 0) {
      throw new SaveError("missing 'dataBase64'");
    }

    // Basename only, hard-sanitized: no path separators, no '..', no leading
    // dot, only the character set a safe cross-platform filename needs.
    const base = path.basename(filename);
    if (base !== filename || base.includes("/") || base.includes("\\")) {
      throw new SaveError("'filename' must not contain path separators");
    }
    if (base.startsWith(".") || base === "..") {
      throw new SaveError("'filename' must not start with a dot");
    }
    const ext = (base.match(IMAGE_EXT_RE) || [])[0]?.toLowerCase();
    if (!ext) {
      throw new SaveError(
        "'filename' must end in .png, .jpg, .jpeg, .gif, .webp, .svg, .heic, or .heif",
      );
    }

    let buf;
    try {
      buf = Buffer.from(dataBase64, "base64");
    } catch {
      throw new SaveError("'dataBase64' is not valid base64");
    }
    if (buf.length === 0) {
      throw new SaveError("decoded image data is empty");
    }
    if (!sniffImageBytes(buf, ext)) {
      throw new SaveError(`decoded bytes do not look like a ${ext} file`);
    }

    await fs.mkdir(INSERTED_IMAGES_DIR, { recursive: true });

    // Chrome can't render HEIC/HEIF (iPhone's native photo format), so those
    // get converted to JPEG right here and only the .jpg ever reaches disk;
    // everything downstream (the <img> tag, SLIDE_IMAGE_SRC_RE) only ever sees
    // a format it already knows how to handle. The stored name's extension is
    // also lowercased unconditionally (IMG_2184.JPG -> IMG_2184.jpg): the
    // filename check above accepts any case, but SLIDE_IMAGE_SRC_RE that
    // /add-element checks against is case-sensitive lowercase-only, so an
    // uppercase extension would upload fine here and then get orphaned on
    // disk when /add-element rejects it.
    const isHeic = ext === ".heic" || ext === ".heif";
    const storedExt = isHeic ? ".jpg" : ext;

    // A raw filename can carry spaces, unicode, or other punctuation that a
    // camera app or OS happily allows (e.g. "Screen Shot 2026-07-29 at
    // 1.02.33 PM.png"), and none of that is worth rejecting the upload over --
    // the client only ever uses the src this function hands back and never
    // assumes it matches what the user picked. So the stem is sanitized
    // rather than validated: every run of characters outside
    // [a-zA-Z0-9._-] collapses to a single "-", with leading "-"/"." and
    // trailing "-" from that collapse trimmed off, so "Screen Shot  2026-07-29"
    // becomes "Screen-Shot-2026-07-29". Leading dots go too, so that a name the
    // dotfile guard above let through (" .x.png" starts with a space, not a
    // dot) can't sanitize down into an invisible dotfile. A stem that was
    // nothing but disallowed characters falls back to a fixed name. finalName
    // ends up built entirely from storedExt's fixed extension list plus a stem
    // drawn from exactly the charset SLIDE_IMAGE_SRC_RE requires, so it can
    // never fail that check downstream in /add-element.
    const rawStem = base.slice(0, base.length - ext.length);
    const stem =
      rawStem.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^[-.]+|-+$/g, "") ||
      "image";
    let finalName = `${stem}${storedExt}`;
    let n = 2;
    while (fsSync.existsSync(path.join(INSERTED_IMAGES_DIR, finalName))) {
      finalName = `${stem}-${n}${storedExt}`;
      n++;
    }

    const abs = path.resolve(INSERTED_IMAGES_DIR, finalName);
    if (!abs.startsWith(INSERTED_IMAGES_DIR + path.sep)) {
      throw new SaveError("resolved path escapes the inserted-images directory");
    }

    const dir = path.dirname(abs);
    const tmp = path.join(dir, `.${finalName}.tmp-${process.pid}-${Date.now()}`);

    if (isHeic) {
      // sips can't read HEIC bytes from stdin, so they have to land on disk
      // first; os.tmpdir() rather than images/inserted/ so a failed
      // conversion never leaves a stray non-JPEG file sitting in the deck's
      // image directory.
      const heicTmp = path.join(
        os.tmpdir(),
        `upload-${process.pid}-${Date.now()}${ext}`,
      );
      await fs.writeFile(heicTmp, buf);
      try {
        await execFile("sips", ["-s", "format", "jpeg", heicTmp, "--out", tmp]);
      } catch {
        await fs.unlink(tmp).catch(() => {});
        throw new SaveError("could not convert HEIC image to JPEG");
      } finally {
        await fs.unlink(heicTmp).catch(() => {});
      }
    } else {
      await fs.writeFile(tmp, buf);
    }
    await renameIntoPlace(tmp, abs);

    return `./images/inserted/${finalName}`;
  }

  // ---------------------------------------------------------------------------
  // Connect middleware for Vite's dev server. Every route answers the way the
  // original http server did; anything else goes on to Vite.
  // ---------------------------------------------------------------------------

  const ROUTES = {
    "/save": { handle: handleSave },
    "/save-attr": { handle: handleSaveAttr },
    "/add-element": { handle: handleAddElement },
    "/remove-element": { handle: handleRemoveElement },
    "/remove-text": { handle: handleRemoveText },
    "/upload-image": {
      handle: async (body) => ({ src: await handleUploadImage(body) }),
      maxBytes: UPLOAD_MAX_BYTES,
    },
  };

  async function middleware(req, res, next) {
    const pathname = new URL(req.url, "http://localhost").pathname;
    const route = req.method === "POST" ? ROUTES[pathname] : undefined;
    if (!route) {
      next();
      return;
    }
    try {
      const raw = await readBody(req, route.maxBytes);
      let body;
      try {
        body = JSON.parse(raw);
      } catch {
        sendJSON(res, 400, { ok: false, error: "invalid JSON body" });
        return;
      }
      const extra = await route.handle(body);
      sendJSON(res, 200, { ok: true, ...(extra || {}) });
    } catch (err) {
      if (err instanceof SaveError) {
        sendJSON(res, 409, { ok: false, error: err.message });
      } else {
        sendJSON(res, 409, { ok: false, error: String((err && err.message) || err) });
      }
    }
  }

  return { middleware, isSelfWrite };
}
