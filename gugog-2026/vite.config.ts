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
        "00-title.html",
        "00b-splash.html",
        "01-islands.html",
        "01b-compression.html",
        "01c-compress-islands.html",
        "02-verbs.html",
        "03-gofish-intro.html",
        "03b-code-comparisons.html",
        "04a-domain-design.html",
        "04c-next-cliff.html",
        "05-panel.html",
        // Bonus slides, after the panel slide (since 2026-11-07): the
        // "Bonus slides" divider and semantic validity.
        "04b-validity.html",
      ],
    }),
  ],
  server: {
    port: 4003,
  },
});
