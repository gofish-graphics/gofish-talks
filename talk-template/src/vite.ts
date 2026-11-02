// Vite plugin shared by GoFish talks.
//
// A talk keeps its slides in sections/*.html. This plugin inlines them, in the
// order given, where index.html has the `<!-- sections -->` marker, before
// Vite processes the page. That way the images and videos the sections
// reference are bundled and rewritten like any other asset in index.html.
// It also adds the web fonts the theme uses and lets the dev server read the
// template's own files (fonts, CSS), which live outside the talk's folder.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { searchForWorkspaceRoot, type Plugin } from "vite";

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
  return {
    name: "gofish-talk",
    config: () => ({
      server: {
        fs: {
          allow: [searchForWorkspaceRoot(process.cwd()), templateDir],
        },
      },
    }),
    transformIndexHtml: {
      order: "pre",
      handler: (html) =>
        html
          .replace("</head>", `${FONT_LINKS}\n  </head>`)
          .replace(
            "<!-- sections -->",
            sections
              .map((file) => fs.readFileSync(path.join(sectionsDir, file), "utf8"))
              .join("\n")
          ),
    },
    // Section files are not modules, so reload the page when one changes.
    handleHotUpdate({ file, server }) {
      if (file.startsWith(sectionsDir + path.sep)) {
        server.ws.send({ type: "full-reload" });
      }
    },
  };
}
