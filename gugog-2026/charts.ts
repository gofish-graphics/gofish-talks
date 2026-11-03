// Live GoFish charts. A slide asks for one with an empty element, e.g.
// <div data-chart="usage-curve"></div>, and renderCharts() draws it there.
// data-w and data-h set its size in pixels.
//
// Part 1 ("compression is the yardstick"): the usage curve and the
// compression lines.
// Both are schematic. The numbers below only give the shapes; no axis shows
// them, and none of them was measured.
//
// Part 3 (the GoFish crash course): the planets and the seafood charts.
// These are the full specs; the slides print them with styling elided.
import {
  chart,
  layer,
  spread,
  stack,
  scatter,
  group,
  ribbon,
  line,
  rect,
  text,
  Color,
  field,
  enclose,
  circle,
  arrow,
  Constraint,
  Shape,
  Unit,
  Trait,
} from "gofish-graphics";
import seafood from "./data/seafood.json";

// The deck's look (talk-template/src/style.css).
const FONT = '"Shantell Sans Local", "Shantell Sans", sans-serif';
const INK = "#1e1e1e";
const MUTED = "#66615b";
const ACCENT = "#b24a3b";
const TAIL = "#ddd3c4";
const BLUE = "#5b8fa8";

const words = (s: string, fontSize: number, more: Record<string, unknown> = {}) =>
  text({ text: s, fontSize, fontFamily: FONT, fill: INK, ...more });

// ─── The usage curve ──────────────────────────────────────────────────────
// How often a kind of chart gets made, against how complex it is: a long
// tail, freq = 1 / (1 + 14x)^1.4 for x in [0, 1]. The head is filled in the
// accent color and the tail in a light neutral. The sample at the boundary
// belongs to both parts, so the two fills meet.
const SAMPLES = 80;
const HEAD_END = 12; // the head is x <= 0.15
const curve = Array.from({ length: SAMPLES + 1 }, (_, i) => ({
  i,
  x: i / SAMPLES,
  freq: 1 / (1 + (14 * i) / SAMPLES) ** 1.4,
}));
const curveParts = curve.flatMap((d) =>
  (d.i < HEAD_END ? ["head"] : d.i === HEAD_END ? ["head", "tail"] : ["tail"]).map(
    (part) => ({ ...d, part })
  )
);

// Labels in the plot's own coordinates. scatter places each label's center
// at (x, y).
const curveNotes = [
  { note: "bar, line, scatter", x: 0.22, y: 0.62, color: ACCENT },
  { note: "one-lab infographics, diagrams", x: 0.6, y: 0.19, color: MUTED },
];

// The two axis lines, each from the origin to a little past the curve, so
// the curve's stroke stays inside the plot. The x line's own end cap still
// reaches 1.3 px past the canvas, and GoFish prints a [gofish:layout] warning
// about it. That is harmless: GoFish does not count a line's cap in its box.
const axisLines = [
  { axis: "x", end: 0, x: 0, y: 0 },
  { axis: "x", end: 1, x: 1.01, y: 0 },
  { axis: "y", end: 0, x: 0, y: 0 },
  { axis: "y", end: 1, x: 0, y: 1.08 },
];

// The plot alone: the filled curve, its axes, and the labels. The usage
// curve slide draws it large with both labels. The compression slide draws
// it small as its left panel, with only the head's label, since the tail's
// label is too wide for that panel.
function usagePlot(notes: typeof curveNotes, fontSize: number) {
  return layer([
    chart(curveParts, {
      axes: false,
      color: Color.palette({ head: ACCENT, tail: TAIL }),
    })
      .flow(scatter({ by: "i", x: "x" }), group({ by: "part" }))
      .mark(ribbon({ h: "freq", fill: "part" })),
    chart(curve, { axes: false })
      .flow(scatter({ by: "i", x: "x", y: "freq" }))
      .mark(line({ stroke: INK, strokeWidth: 3 })),
    chart(axisLines, { axes: false })
      .flow(group({ by: "axis" }), scatter({ by: "end", x: "x", y: "y" }))
      .mark(line({ stroke: INK, strokeWidth: 2.5 })),
    chart(notes, { axes: false })
      .flow(scatter({ by: "note", x: "x", y: "y" }))
      .mark(text({ text: "note", fill: "color", fontSize, fontFamily: FONT })),
  ]);
}

function usageCurve(fontSize: number) {
  const plot = usagePlot(curveNotes, fontSize);

  // Axis titles in words. The axes have no numbers on purpose.
  return spread({ dir: "x", spacing: 12, alignment: "middle" }, [
    words("how often it gets made", fontSize * 0.9, { rotate: -90 }),
    spread({ dir: "y", spacing: 8, alignment: "end" }, [
      words("schematic, not measured", Math.max(16, fontSize * 0.7), {
        fill: MUTED,
        fontStyle: "italic",
      }),
      plot,
      words("how complex the chart is", fontSize * 0.9),
    ]),
  ]);
}

// ─── A good grammar is a good compression ─────────────────────────────────
// Three panels that share the usage curve's x axis, how complex the chart is.
// The left panel is the usage curve itself, small: how often each chart is
// made. The middle panel is the size of the language you need to reach
// charts up to that complexity. The right panel is the length of the spec
// for one chart of that complexity. The middle and right panels have a line
// for each of three designs:
//   - a chart typology (seaborn): the language grows with every tail chart,
//     but each spec stays short;
//   - a low-level toolkit (d3): a tiny language, but specs are long even for
//     the common charts and grow fast;
//   - a good grammar: a small core that soon stops growing, and specs that
//     grow slowly.
// The slide draws the chart twice, stacked: first without the good grammar,
// then with it as a fragment on top. Both use the same fixed axes, so the
// shared lines, and the whole usage panel, land in the same place.
const TYPOLOGY = BLUE;
const TOOLKIT = MUTED;
const GRAMMAR = ACCENT;

type Design = "typology" | "toolkit" | "grammar";
const designColor = { typology: TYPOLOGY, toolkit: TOOLKIT, grammar: GRAMMAR };

// Each design's two curves, for x in [0, 1].
const costCurves: Record<Design, { language: (x: number) => number; spec: (x: number) => number }> = {
  typology: { language: (x) => 0.2 + 0.78 * x ** 1.3, spec: () => 0.2 },
  toolkit: { language: () => 0.2, spec: (x) => 0.5 + 0.48 * x },
  grammar: {
    language: (x) => 0.22 + 0.2 * (1 - Math.exp(-7 * x)),
    spec: (x) => 0.24 + 0.28 * x ** 1.2,
  },
};

const COST_SAMPLES = 40;
const costLine = (design: Design, panel: "language" | "spec") =>
  Array.from({ length: COST_SAMPLES + 1 }, (_, i) => ({
    design,
    i,
    x: i / COST_SAMPLES,
    y: costCurves[design][panel](i / COST_SAMPLES),
  }));

// Direct labels, in each panel's own coordinates (scatter centers them).
// A flat line's label sits under it, between the line and the x axis.
const costNotes: Record<"language" | "spec", { design: Design; note: string; x: number; y: number }[]> = {
  language: [
    { design: "typology", note: "chart typology (seaborn)", x: 0.4, y: 0.8 },
    { design: "toolkit", note: "low-level toolkit (d3)", x: 0.7, y: 0.09 },
    { design: "grammar", note: "a good grammar", x: 0.76, y: 0.52 },
  ],
  spec: [
    { design: "typology", note: "chart typology (seaborn)", x: 0.66, y: 0.09 },
    { design: "toolkit", note: "low-level toolkit (d3)", x: 0.36, y: 0.9 },
    { design: "grammar", note: "a good grammar", x: 0.72, y: 0.58 },
  ],
};

// The usage panel's one label, moved right of where the big slide puts it
// so it stays inside the narrower panel.
const usagePanelNotes = [{ ...curveNotes[0], x: 0.36 }];

function usagePanel(fontSize: number) {
  return spread({ dir: "y", spacing: 10, alignment: "middle" }, [
    words("how often it gets made", fontSize),
    usagePlot(usagePanelNotes, fontSize * 0.8),
  ]);
}

function costPanel(
  panel: "language" | "spec",
  title: string,
  designs: Design[],
  fontSize: number
) {
  const lines = designs.flatMap((d) => costLine(d, panel));
  const notes = costNotes[panel].filter((n) => designs.includes(n.design));
  const plot = layer([
    chart(axisLines, { axes: false })
      .flow(group({ by: "axis" }), scatter({ by: "end", x: "x", y: "y" }))
      .mark(line({ stroke: INK, strokeWidth: 2.5 })),
    chart(lines, { axes: false, color: Color.palette(designColor) })
      .flow(group({ by: "design" }), scatter({ by: "i", x: "x", y: "y" }))
      .mark(line({ stroke: "design", strokeWidth: 5 })),
    chart(notes, { axes: false, color: Color.palette(designColor) })
      .flow(scatter({ by: "design", x: "x", y: "y" }))
      .mark(text({ text: "note", fill: "design", fontSize: fontSize * 0.8, fontFamily: FONT })),
  ]);
  return spread({ dir: "y", spacing: 10, alignment: "middle" }, [
    words(title, fontSize),
    plot,
  ]);
}

const compressionChart = (designs: Design[]) => (fontSize: number) =>
  spread({ dir: "y", spacing: 10, alignment: "middle" }, [
    spread({ dir: "x", spacing: fontSize * 2.5, alignment: "end" }, [
      usagePanel(fontSize),
      costPanel("language", "size of the language", designs, fontSize),
      costPanel("spec", "length of each spec", designs, fontSize),
    ]),
    words("how complex the chart is", fontSize * 0.9),
    words("schematic, not measured", Math.max(16, fontSize * 0.7), {
      fill: MUTED,
      fontStyle: "italic",
    }),
  ]);

// ─── Part 3: the GoFish crash course ──────────────────────────────────────
// The core level: the four inner planets on a dark background, from the
// GoFish repo's tutorial stories (origin/main 7b902ed38):
// packages/gofish-graphics/stories/tutorials/Basics.stories.tsx (no label)
// and Diagrams.stories.tsx (label and arrow). The marks, operators, options
// and relations are the stories' own. The code is restructured: the
// background group and the label are bound to consts, and the names
// Diagrams needs are there from the first state. That way the second state
// only adds lines after the first, so Reveal keeps the first state's lines
// in place. The slides show this with styling elided as "...".
const data = [
  { name: "mercury", r: 15, fill: "#F5E3C8", stroke: "#EFC9A2" },
  { name: "venus", r: 36, fill: "#D2913C", stroke: "#A96F26" },
  { name: "earth", r: 38, fill: "#3E8CCC", stroke: "#2F6FA6" },
  { name: "mars", r: 21, fill: "#F4BC80", stroke: "#E0954C" },
];

// A fresh copy per call: a slide may draw it more than once.
const makePlanets = () => {
  const planets = enclose(
    {
      padding: 20,
      fill: "#252150",
      stroke: "none",
      shape: Shape.box({ rx: 16 }),
    },
    [
      spread(
        { dir: "x", spacing: 50, alignment: "middle" },
        data.map((d) =>
          circle({
            r: d.r,
            fill: d.fill,
            stroke: d.stroke,
            strokeWidth: 3,
          }).name(d.name)
        )
      ),
    ]
  ).name("planets");
  return planets;
};

const planetsRow = () => makePlanets();

const planetsLabeled = () => {
  const planets = makePlanets();

  const label = text({ text: "Mercury", fill: "#E94560", fontSize: 14 }).name(
    "label"
  );

  return layer([planets, label]).relate(({ mercury, planets, label }) => [
    Constraint.align({ x: "middle" }, [mercury, label]),
    Constraint.distribute({ dir: "y", spacing: 20 }, [planets, label]),
    arrow({ stroke: "#E94560" }, [label, mercury]),
  ]);
};

// The chart level: the thesis deck's seafood walkthrough. The stacked bars
// are its "Spread the Lakes Apart" slide; the ribbon chart adds the
// .layer(ribbon(...)) step of its stage 3b figure (the GUGOG paper's
// Figure 2). data/seafood.json is the GoFish repo's seafood fixture with the
// thesis deck's lake names.
const seafoodStacked = () =>
  chart(seafood)
    .flow(
      spread({ by: "lake", dir: "x", spacing: 64 }),
      stack({ by: field("species").sort("count"), dir: "y" }),
    )
    .mark(rect({ h: "count", fill: "species" }));

const seafoodRibbon = () =>
  chart(seafood)
    .flow(
      spread({ by: "lake", dir: "x", spacing: 64 }),
      stack({ by: field("species").sort("count"), dir: "y" }),
    )
    .mark(rect({ h: "count", fill: "species" }))
    .layer(ribbon({ by: "species", opacity: 0.8 }));
// (The slides show both seafood specs with spacing and opacity elided.)

// ─── Part 4b: validity against freedom of arrangement (CanAdd) ────────────
// Two ordinary programs that differ only in the unit of "value". USD
// declares Trait.summable(), so stack can add the amounts. °C does not, so
// GoFish refuses to stack it; the slide shows the error it throws (see
// data-expect-error in renderCharts). The numbers are illustrative.
const sales = [
  { month: "Jan", city: "Boston", value: 120 },
  { month: "Jan", city: "Chicago", value: 95 },
  { month: "Feb", city: "Boston", value: 135 },
  { month: "Feb", city: "Chicago", value: 110 },
  { month: "Mar", city: "Boston", value: 150 },
  { month: "Mar", city: "Chicago", value: 128 },
];

const temps = [
  { month: "Jan", city: "Boston", value: -1 },
  { month: "Jan", city: "Chicago", value: -4 },
  { month: "Feb", city: "Boston", value: 0 },
  { month: "Feb", city: "Chicago", value: -2 },
  { month: "Mar", city: "Boston", value: 4 },
  { month: "Mar", city: "Chicago", value: 4 },
];

const salesStacked = () =>
  chart(sales, {
    schema: {
      value: Unit("USD", { traits: [Trait.summable()] }),
    },
  })
    .flow(
      spread({ by: "month", dir: "x" }),
      stack({ by: "city", dir: "y" }),
    )
    .mark(rect({ h: "value", fill: "city" }));

const tempsStacked = () =>
  chart(temps, {
    schema: {
      value: Unit("°C"),
    },
  })
    .flow(
      spread({ by: "month", dir: "x" }),
      stack({ by: "city", dir: "y" }),
    )
    .mark(rect({ h: "value", fill: "city" }));

type Renderable = {
  render: (el: HTMLElement, options: Record<string, unknown>) => unknown;
};

const charts: Record<string, (fontSize: number) => Renderable> = {
  "usage-curve": usageCurve,
  "compression-naive": compressionChart(["typology", "toolkit"]),
  compression: compressionChart(["typology", "toolkit", "grammar"]),
  planets: planetsRow,
  "planets-label": planetsLabeled,
  "seafood-stacked": seafoodStacked,
  "seafood-ribbon": seafoodRibbon,
  "sales-stacked": salesStacked,
  "temps-stacked": tempsStacked,
};

export function renderCharts(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>("[data-chart]").forEach((el) => {
    const make = charts[el.dataset.chart ?? ""];
    if (!make) {
      console.error(`No chart named "${el.dataset.chart}"`);
      return;
    }
    const w = Number(el.dataset.w);
    const h = Number(el.dataset.h);
    const fontSize = Number(el.dataset.fontSize ?? 26);
    // data-expect-error: the chart is meant to be refused. Show the message
    // GoFish throws, in place of the chart, instead of letting it escape.
    if (el.dataset.expectError !== undefined) {
      Promise.resolve()
        .then(() => make(fontSize).render(el, { w, h, legend: false }))
        .then(
          () => console.error(`Chart "${el.dataset.chart}" was expected to throw`),
          (err: unknown) => {
            el.replaceChildren();
            el.textContent = err instanceof Error ? err.message : String(err);
          }
        );
      return;
    }
    make(fontSize).render(el, { w, h, legend: false });
  });
}
