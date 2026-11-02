// Entry point for the in-browser slide editor. startDeck() imports this only
// under `pnpm dev` (import.meta.env.DEV), so the built site never contains
// it. Both installers must run before deck.initialize(): edit-mode.js marks
// the editable elements, and highlight-edit.js captures each code block
// before reveal's highlight plugin rewrites it.
import "./editor.css";
import { installEditMode } from "./edit-mode.js";
import { installHighlightEdit } from "./highlight-edit.js";

export function installEditor(deck) {
  installEditMode();
  installHighlightEdit(deck);
}
