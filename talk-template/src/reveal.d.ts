// reveal.js ships no TypeScript types; these cover what deck.ts uses.
declare module "reveal.js" {
  interface RevealOptions {
    [key: string]: unknown;
  }

  class Reveal {
    constructor(options?: RevealOptions);
    initialize(options?: RevealOptions): Promise<void>;
    on(event: string, handler: () => void): void;
    off(event: string, handler: () => void): void;
    getCurrentSlide(): HTMLElement | null;
    slide(h: number, v?: number, f?: number): void;
    next(): void;
    prev(): void;
  }

  export default Reveal;
}

declare module "reveal.js/plugin/highlight/highlight" {
  const RevealHighlight: unknown;
  export default RevealHighlight;
}

declare module "reveal.js/plugin/notes/notes" {
  const RevealNotes: unknown;
  export default RevealNotes;
}
