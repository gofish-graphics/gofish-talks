import { startDeck } from "@gofish-talks/template";
import "./style.css";
import { renderCharts } from "./charts";

renderCharts();
// Auto-animate steps take 0.3s, not Reveal's default 1s, the same as the
// thesis defense deck.
startDeck({ autoAnimateDuration: 0.3 });
