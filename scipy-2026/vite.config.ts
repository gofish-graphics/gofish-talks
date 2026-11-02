import { defineConfig, type Plugin } from "vite";
import solidPlugin from "vite-plugin-solid";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

// Slides live in ./sections/*.html, in this order. They are inlined into
// index.html before Vite processes it, so the images and videos they reference
// are bundled and rewritten like any other asset in index.html.
const sections = [
  "01-opening.html",
  "02-walkthrough.html",
  "03-glyphs.html",
  "04-closing.html",
];

function includeSections(): Plugin {
  return {
    name: "include-sections",
    transformIndexHtml: {
      order: "pre",
      handler: (html) =>
        html.replace(
          "<!-- sections -->",
          sections
            .map((file) =>
              fs.readFileSync(path.resolve(__dirname, "sections", file), "utf8")
            )
            .join("\n")
        ),
    },
    // Section files are not modules, so reload the page when one changes.
    handleHotUpdate({ file, server }) {
      if (file.startsWith(path.resolve(__dirname, "sections"))) {
        server.ws.send({ type: "full-reload" });
      }
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [includeSections(), solidPlugin()],
  resolve: {
    alias: {
      "@gofish-data": path.resolve(
        __dirname,
        "vendor-gofish/src/data"
      ),
    },
  },
  server: {
    port: 4001,
  },
});
