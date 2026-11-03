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
// label is too wide for that panel. `extra` adds more marks in the plot's
// coordinates (the compression slide's expressivity cliff).
function usagePlot(notes: typeof curveNotes, fontSize: number, extra: any[] = []) {
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
    ...extra,
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

// ─── A grammar is a compression ───────────────────────────────────────────
// Three panels that share the usage curve's x axis, how complex the chart is.
// The left panel is the usage curve itself, small: how often each chart is
// made. The middle panel is the size of the language you need to reach
// charts up to that complexity. The right panel is the length of the spec
// for one chart of that complexity. The middle and right panels have a line
// for each of four designs:
//   - a chart typology (seaborn): the language grows with every tail chart,
//     but each spec stays short;
//   - a low-level toolkit (d3): a tiny language, but specs are long even for
//     the common charts and grow fast;
//   - the grammar of graphics: low in both panels for the common charts.
//     Past the expressivity cliff it drifts toward one extreme or the other:
//     ggplot2 tends to add chart types (the language grows toward seaborn's),
//     and Vega-Lite tends to compute layout with explicit transforms (specs
//     grow toward d3's). The drift is gradual, and the line is dashed there;
//   - the sweet spot: low in both panels across the whole range.
// The slide builds the chart in five stacked copies, one design more each
// time (see compressionSteps). All use the same fixed axes, so the shared
// lines, and the whole usage panel, land in the same place.
const TYPOLOGY = BLUE;
const TOOLKIT = MUTED;
const GOG = "#7e68a6";
const GOAL = ACCENT;

type Design = "typology" | "toolkit" | "gog" | "goal";
const designColor = { typology: TYPOLOGY, toolkit: TOOLKIT, gog: GOG, goal: GOAL };

// Where the grammar of graphics starts to drift: past the head of the usage
// curve (x <= 0.15), out in the tail.
const CLIFF = 0.3;
// A smooth bend: zero with zero slope at the cliff, then close to a straight
// climb.
const bend = (x: number) => {
  const t = Math.max(0, x - CLIFF);
  return (t * t) / (t + 0.18);
};
const core = (x: number) => 1 - Math.exp(-6 * x);

// Each design's two curves, for x in [0, 1].
const costCurves: Record<Design, { language: (x: number) => number; spec: (x: number) => number }> = {
  typology: { language: (x) => 0.12 + 0.86 * x, spec: () => 0.12 },
  toolkit: { language: () => 0.12, spec: (x) => 0.5 + 0.48 * x },
  gog: {
    language: (x) => 0.26 + 0.08 * core(x) + 0.78 * bend(x),
    spec: (x) => 0.26 + 0.06 * x + 0.85 * bend(x),
  },
  goal: {
    language: (x) => 0.2 + 0.08 * core(x),
    spec: (x) => 0.2 + 0.06 * x,
  },
};

// The grammar of graphics is drawn solid up to the cliff and dashed past it.
// The sample at the cliff belongs to both parts, so they meet.
const COST_SAMPLES = 40;
const CLIFF_SAMPLE = Math.round(CLIFF * COST_SAMPLES);
const costLine = (design: Design, panel: "language" | "spec") =>
  Array.from({ length: COST_SAMPLES + 1 }, (_, i) => ({
    design,
    i,
    x: i / COST_SAMPLES,
    y: costCurves[design][panel](i / COST_SAMPLES),
  }));

// The expressivity cliff: a light dotted line in every panel, labeled once,
// in the usage panel, where the audience can see it falls past the head.
const cliffLine = [
  { end: 0, x: CLIFF, y: 0 },
  { end: 1, x: CLIFF, y: 0.5 },
];
const cliffNote = [{ note: "expressivity cliff", x: CLIFF, y: 0.56 }];

function cliffMarks(fontSize: number, labeled: boolean) {
  const marks = [
    chart(cliffLine, { axes: false })
      .flow(scatter({ by: "end", x: "x", y: "y" }))
      .mark(line({ stroke: MUTED, strokeWidth: 2, strokeDasharray: "2 6", opacity: 0.8 })),
  ];
  if (labeled)
    marks.push(
      chart(cliffNote, { axes: false })
        .flow(scatter({ by: "note", x: "x", y: "y" }))
        .mark(text({ text: "note", fill: MUTED, fontSize, fontFamily: FONT, fontStyle: "italic" }))
    );
  return marks;
}

// Direct labels, in each panel's own coordinates (scatter centers them).
// A two-line label is two entries, one per line.
type Note = { design: Design; key: string; note: string; x: number; y: number };
const costNotes: Record<"language" | "spec", Note[]> = {
  language: [
    { design: "typology", key: "t", note: "chart typology (seaborn)", x: 0.36, y: 0.9 },
    { design: "toolkit", key: "k", note: "low-level toolkit (d3)", x: 0.7, y: 0.055 },
    { design: "gog", key: "g1", note: "ggplot2:", x: 0.78, y: 0.41 },
    { design: "gog", key: "g2", note: "new chart types", x: 0.78, y: 0.345 },
    { design: "goal", key: "s", note: "the sweet spot", x: 0.78, y: 0.2 },
  ],
  spec: [
    { design: "typology", key: "t", note: "chart typology (seaborn)", x: 0.66, y: 0.055 },
    { design: "toolkit", key: "k", note: "low-level toolkit (d3)", x: 0.36, y: 0.9 },
    { design: "gog", key: "g1", note: "Vega-Lite:", x: 0.76, y: 0.385 },
    { design: "gog", key: "g2", note: "explicit calculations", x: 0.76, y: 0.32 },
    { design: "goal", key: "s", note: "the sweet spot", x: 0.78, y: 0.178 },
  ],
};

// The usage panel's one label, moved right of where the big slide puts it
// so it stays inside the narrower panel, and up, so it clears the cliff's
// label.
const usagePanelNotes = [{ ...curveNotes[0], x: 0.36, y: 0.78 }];

function usagePanel(fontSize: number, cliff: boolean) {
  const extra = cliff ? cliffMarks(fontSize * 0.7, true) : [];
  return spread({ dir: "y", spacing: 10, alignment: "middle" }, [
    words("how often it gets made", fontSize),
    usagePlot(usagePanelNotes, fontSize * 0.8, extra),
  ]);
}

function costPanel(
  panel: "language" | "spec",
  title: string,
  designs: Design[],
  fontSize: number
) {
  const lines = designs.flatMap((d) => costLine(d, panel));
  const solid = lines.filter((p) => p.design !== "gog" || p.i <= CLIFF_SAMPLE);
  const drift = lines.filter((p) => p.design === "gog" && p.i >= CLIFF_SAMPLE);
  const notes = costNotes[panel].filter((n) => designs.includes(n.design));
  const cliff = designs.includes("gog");
  const plot = layer([
    chart(axisLines, { axes: false })
      .flow(group({ by: "axis" }), scatter({ by: "end", x: "x", y: "y" }))
      .mark(line({ stroke: INK, strokeWidth: 2.5 })),
    ...(cliff ? cliffMarks(fontSize * 0.7, false) : []),
    ...(drift.length
      ? [
          chart(drift, { axes: false, color: Color.palette(designColor) })
            .flow(group({ by: "design" }), scatter({ by: "i", x: "x", y: "y" }))
            .mark(line({ stroke: "design", strokeWidth: 5, strokeDasharray: "12 8" })),
        ]
      : []),
    ...(solid.length
      ? [
          chart(solid, { axes: false, color: Color.palette(designColor) })
            .flow(group({ by: "design" }), scatter({ by: "i", x: "x", y: "y" }))
            .mark(line({ stroke: "design", strokeWidth: 5 })),
        ]
      : []),
    ...(notes.length
      ? [
          chart(notes, { axes: false, color: Color.palette(designColor) })
            .flow(scatter({ by: "key", x: "x", y: "y" }))
            .mark(text({ text: "note", fill: "design", fontSize: fontSize * 0.75, fontFamily: FONT })),
        ]
      : []),
  ]);
  return spread({ dir: "y", spacing: 10, alignment: "middle" }, [
    words(title, fontSize),
    plot,
  ]);
}

const compressionChart = (designs: Design[]) => (fontSize: number) =>
  spread({ dir: "y", spacing: 10, alignment: "middle" }, [
    spread({ dir: "x", spacing: fontSize * 2.5, alignment: "end" }, [
      usagePanel(fontSize, designs.includes("gog")),
      costPanel("language", "size of the language", designs, fontSize),
      costPanel("spec", "length of each spec", designs, fontSize),
    ]),
    words("how complex the chart is", fontSize * 0.9),
    words("schematic, not measured", Math.max(16, fontSize * 0.7), {
      fill: MUTED,
      fontStyle: "italic",
    }),
  ]);

// The slide's five steps, one stacked chart each.
const compressionSteps = {
  "compression-usage": compressionChart([]),
  "compression-typology": compressionChart(["typology"]),
  "compression-toolkit": compressionChart(["typology", "toolkit"]),
  "compression-gog": compressionChart(["typology", "toolkit", "gog"]),
  "compression-goal": compressionChart(["typology", "toolkit", "gog", "goal"]),
};

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
// One dataset with a temperature column and a USD column, and three steps of
// one spec. With no schema, GoFish checks nothing and stacks the
// temperatures. With a schema, °C has no CanAdd, so GoFish refuses to stack
// "temp"; the slide shows the error it throws (see data-expect-error in
// renderCharts). USD declares Trait.summable(), so stacking "usd" passes.
// The numbers are illustrative.
const cities = [
  { month: "Jun", city: "Boston", temp: 21, usd: 120 },
  { month: "Jun", city: "Chicago", temp: 22, usd: 95 },
  { month: "Jul", city: "Boston", temp: 24, usd: 135 },
  { month: "Jul", city: "Chicago", temp: 25, usd: 110 },
  { month: "Aug", city: "Boston", temp: 23, usd: 150 },
  { month: "Aug", city: "Chicago", temp: 24, usd: 128 },
];

const citiesSchema = {
  temp: Unit("°C"),
  usd: Unit("USD", { traits: [Trait.summable()] }),
};

const citiesStacked = (h: "temp" | "usd", schema?: typeof citiesSchema) => () =>
  chart(cities, schema === undefined ? undefined : { schema })
    .flow(
      spread({ by: "month", dir: "x" }),
      stack({ by: "city", dir: "y" }),
    )
    .mark(rect({ h, fill: "city" }));

type Renderable = {
  render: (el: HTMLElement, options: Record<string, unknown>) => unknown;
};

const charts: Record<string, (fontSize: number) => Renderable> = {
  "usage-curve": usageCurve,
  ...compressionSteps,
  planets: planetsRow,
  "planets-label": planetsLabeled,
  "seafood-stacked": seafoodStacked,
  "seafood-ribbon": seafoodRibbon,
  "canadd-untyped": citiesStacked("temp"),
  "canadd-temp": citiesStacked("temp", citiesSchema),
  "canadd-usd": citiesStacked("usd", citiesSchema),
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
