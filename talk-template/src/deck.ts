/// <reference types="vite/client" />
// Reveal setup and theme shared by GoFish talks. A talk's main.ts calls
// startDeck() once; the slides themselves come from the talk's sections/*.html,
// which the gofishTalk() Vite plugin (./vite.ts) inlines into index.html.
import Reveal from "reveal.js";
import RevealHighlight from "reveal.js/plugin/highlight/highlight";
import RevealNotes from "reveal.js/plugin/notes/notes";
import "reveal.js/dist/reveal.css";
import "reveal.js/dist/theme/white.css";
import "./hljs-github-light.css";
import "./style.css";
import {
  layoutSlides,
  renderCharMarksWhenReady,
  renderCodeRegionsWhenReady,
  renderMagicMoveWhenReady,
} from "./slide-layout.js";

// The same settings scipy-2026 uses: a fixed 1280x720 canvas, no transitions,
// top-anchored slides, and the code-highlight and speaker-notes plugins.
// A talk can pass more Reveal options, which override these.
export async function startDeck(
  options: Record<string, unknown> = {}
): Promise<Reveal> {
  const deck = new Reveal({
    hash: true,
    transition: "none",
    navigationMode: "linear",
    center: false,
    width: 1280,
    height: 720,
    margin: 0.06,
    slideNumber: true,
    plugins: [RevealHighlight, RevealNotes],
    highlight: {
      highlightOnLoad: true,
    },
    ...options,
  });

  // The in-browser slide editor (press "e"), only under `pnpm dev`. In a
  // build this branch is dropped, so dist has no editor code. It has to be
  // installed before deck.initialize(); see ./editor/client.js.
  if (import.meta.env.DEV) {
    const { installEditor } = await import("./editor/client.js");
    installEditor(deck);
  }

  // Positions the annotations and images the editor places, and the code
  // character marks it draws, and colors code regions (data-code-regions).
  // It also wraps the tokens of data-magic-move code blocks, before the
  // marks and regions, which then wrap text inside the tokens. The
  // published slides need these too.
  const slides = document.querySelector<HTMLElement>(".reveal .slides");
  if (slides) {
    layoutSlides(slides);
    renderMagicMoveWhenReady(deck, slides);
    renderCharMarksWhenReady(deck, slides);
    renderCodeRegionsWhenReady(deck, slides);
  }

  await deck.initialize();
  return deck;
}
