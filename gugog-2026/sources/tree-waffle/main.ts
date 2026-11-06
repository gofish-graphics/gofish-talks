// The tree of bottle waffles for the gugog-2026 talk: a gofish-gotree tree
// (GoTree) whose leaves are waffle charts (Atom) of bottle glyphs made with
// atop (PiCCL). Remade on 2026-11-06 from the GUGOG paper's Figure 6 source
// (gugog-2026-camera-ready-v3/sources/gofish-tree-waffle/main.ts), with
// gofish-graphics 0.1.0-nightly.20261106 (paint is now atop) and
// gofish-gotree from GoFish origin/main. Changes from the paper: each waffle
// has ten bottles, five across and two high, and a leaf's share fills them
// in order, so one bottle can be partly full. One waffle is empty, one is
// full, and two are partly filled. Each waffle sits on a white card, because
// gofish-gotree's links no longer take anchors and run to the node's center.
// The waffle places bottles by row and column fields, because a spread with
// no "by" over chunked rows did not split the rows on this nightly.
//
// The deck does not build this file, and it is not drawn live:
// gofish-gotree is not published to npm. To remake
// ../../images/tradeoffs/gofish-tree-waffle-tenths.png, copy this folder and
// wilsonblanco.png (../../images/comparisons/) to a scratch folder, add
// packages/gofish-gotree/src from GoFish origin/main (git archive), install
// vite and d3-hierarchy, alias "gofish-graphics" to the deck's nightly
// 20261106 and "gofish-gotree" to that src/index.ts, serve it, and take a
// 4x screenshot of the svg.
import { chart, spread, image, rect, atop, circle, enclose, Filter, Curve, Shape } from "gofish-graphics";
import { tree, combine } from "gofish-gotree";
import bottlePng from "./wilsonblanco.png"; // ../../images/comparisons/wilsonblanco.png

const hierarchy = { name: "root", children: [
  { name: "north", children: [
    { name: "A", share: 0 },
    { name: "B", share: 0.45 },
  ] },
  { name: "south", children: [
    { name: "C", share: 1 },
    { name: "D", share: 0.72 },
  ] },
] };

const CELLS = 10;
const ACROSS = 5;
const BOTTLE_H = 50;

// Bottle i of a waffle holds the part of the share that falls in its tenth.
const cells = (share: number) =>
  Array.from({ length: CELLS }, (_, i) => ({
    row: Math.floor(i / ACROSS),
    col: i % ACROSS,
    amount: 100 * Math.min(1, Math.max(0, share * CELLS - i)),
  }));

const bottleUnit = (data: any) => {
  const amount = data[0]?.amount ?? data.amount;
  return atop({ blendMode: "color" }, [
    image({ href: bottlePng, h: BOTTLE_H, filter: Filter.grayscale } as any),
    rect({ y: BOTTLE_H - (amount / 100) * BOTTLE_H, h: (amount / 100) * BOTTLE_H, w: 40, fill: "lime" }),
  ])(data);
};

const waffle = (d: any) => chart(cells(d.data.share), { axes: false })
  .flow(
    spread({ by: "row", dir: "y", spacing: 4, reverse: true } as any),
    spread({ by: "col", dir: "x", spacing: 4 } as any),
  )
  .mark(bottleUnit as any);

tree({
  // Each waffle sits on a white card, so the links stop at its top edge.
  node: (d: any) => d.height
    ? circle({ r: 7, fill: "#28516d" })
    : enclose({ padding: 8, fill: "white", stroke: "#c9c2b5", strokeWidth: 1.5, shape: Shape.box({ rx: 6 }) } as any, [waffle(d)]),
  link: { curve: Curve.linear(), stroke: "#66717a", strokeWidth: 1.5 },
  parentChild: combine({
    x: { kind: "align", alignment: "middle" },
    y: { kind: "distribute", spacing: 55 },
  }),
  sibling: combine({
    x: { kind: "distribute", spacing: 30 },
    y: { kind: "align", alignment: "start" },
  }),
} as any, hierarchy)
  .render(document.body, { w: 1100, h: 600 });

const fitSvg = () => {
  const svg = document.querySelector("svg");
  if (!svg) { setTimeout(fitSvg, 50); return; }
  const b = svg.getBBox();
  const pad = 10;
  svg.setAttribute("viewBox", `${b.x - pad} ${b.y - pad} ${b.width + 2 * pad} ${b.height + 2 * pad}`);
  svg.setAttribute("width", String(b.width + 2 * pad));
  svg.setAttribute("height", String(b.height + 2 * pad));
  document.body.dataset.ready = "1";
};
setTimeout(fitSvg, 300);
