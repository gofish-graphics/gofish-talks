// Vite plugin shared by GoFish talks.
//
// A talk keeps its slides in sections/*.html. This plugin inlines them, in the
// order given, where index.html has the `<!-- sections -->` marker, before
// Vite processes the page. That way the images and videos the sections
// reference are bundled and rewritten like any other asset in index.html.
// It also adds the web fonts the theme uses and lets the dev server read the
// template's own files (fonts, CSS), which live outside the talk's folder.
// It then gives the tokens of <pre data-magic-move> code blocks the ids that
// let Reveal's auto-animate move them word by word (./magic-move.js).
//
// Under `pnpm dev` it also runs the in-browser slide editor's save endpoints
// (./editor/server.js) and stamps every top-level slide <section> with
// data-src-file/data-src-index, so the editor can tell the server which
// section file, and which slide in it, an edit belongs to. Neither happens in
// a build.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { searchForWorkspaceRoot, type Plugin } from "vite";
import { createEditServer, stampSourceAttributes } from "./editor/server.js";
import { annotateMagicMove } from "./magic-move.js";

const templateDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);

const FONT_LINKS = `
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,300..700;1,300..700&family=Fira+Code:wght@300..500&family=Shantell+Sans:wght@400;600;700&display=swap"
    />`;

export interface GofishTalkOptions {
  /** Absolute path of the talk's sections folder. */
  sectionsDir: string;
  /** Section file names inside sectionsDir, in slide order. */
  sections: string[];
}

export function gofishTalk({ sectionsDir, sections }: GofishTalkOptions): Plugin {
  let dev = false;
  let root = process.cwd();
  // Each section file's path relative to the talk folder (the data-src-file
  // value, e.g. "sections/03-verbs.html"), mapped to its absolute path.
  const sectionFiles = new Map<string, string>();
  let isSelfWrite: (abs: string) => boolean = () => false;
  const relToRoot = (abs: string) =>
    path.relative(root, abs).split(path.sep).join("/");

  return {
    name: "gofish-talk",
    config: () => ({
      server: {
        fs: {
          allow: [searchForWorkspaceRoot(process.cwd()), templateDir],
        },
      },
    }),
    configResolved(config) {
      dev = config.command === "serve";
      root = config.root;
      for (const file of sections) {
        const abs = path.join(sectionsDir, file);
        sectionFiles.set(relToRoot(abs), abs);
      }
    },
    configureServer(server) {
      const editServer = createEditServer({
        root,
        sectionFiles,
        log: {
          info: (msg: string) => server.config.logger.info(msg),
          error: (msg: string) => server.config.logger.error(msg),
        },
      });
      isSelfWrite = editServer.isSelfWrite;
      server.middlewares.use(editServer.middleware);
    },
    transformIndexHtml: {
      order: "pre",
      // After the sections are inlined, code blocks marked
      // data-magic-move get their token ids (./magic-move.js). This needs
      // the whole page, since the ids carry over from one slide to the next.
      handler: (html) =>
        annotateMagicMove(
          html
            .replace("</head>", `${FONT_LINKS}\n  </head>`)
            .replace(
              "<!-- sections -->",
              sections
                .map((file) => {
                  const abs = path.join(sectionsDir, file);
                  const text = fs.readFileSync(abs, "utf8");
                  return dev ? stampSourceAttributes(text, relToRoot(abs)) : text;
                })
                .join("\n")
            )
        ),
    },
    // Section files are not modules, so reload the page when one changes.
    // Two kinds of change are skipped, as the thesis deck's edit server
    // skipped them: the editor's own saves (the page already shows the edit,
    // and reloading would throw away the editor's state mid-gesture), and
    // the hidden .<name>.tmp-* files a save writes before renaming them
    // into place.
    handleHotUpdate({ file, server }) {
      if (!file.startsWith(sectionsDir + path.sep)) return;
      if (path.basename(file).startsWith(".")) return;
      if (isSelfWrite(path.normalize(file))) return;
      server.ws.send({ type: "full-reload" });
    },
  };
}
