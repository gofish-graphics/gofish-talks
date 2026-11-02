import { defineConfig } from "vite";
import { gofishTalk } from "@gofish-talks/template/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  base: "./",
  plugins: [
    gofishTalk({
      sectionsDir: path.resolve(__dirname, "sections"),
      // Slide order.
      sections: [
        "01-opening.html",
        "02-splash.html",
        "03-verbs.html",
        "03b-gofish-intro.html",
        "03c-code-comparisons.html",
        "04-tradeoffs.html",
        "05-big-vs-small.html",
        "06-panel.html",
      ],
    }),
  ],
  server: {
    port: 4003,
  },
});
