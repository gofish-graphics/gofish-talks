// Live GoFish charts. A slide asks for one with an empty element, e.g.
// <div data-chart="usage-curve"></div>, and renderCharts() draws it there.
// data-w and data-h set its size in pixels.
//
// Section 5 ("big vs. small"): the usage curve and the compression bars.
// Both are schematic. The numbers below only give the shapes; no axis shows
// them, and none of them was measured.
//
// Section 3b (the GoFish crash course): the planets and the seafood charts.
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
const SPECS = "#5b8fa8";

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

function usageCurve(fontSize: number) {
  const plot = layer([
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
    chart(curveNotes, { axes: false })
      .flow(scatter({ by: "note", x: "x", y: "y" }))
      .mark(text({ text: "note", fill: "color", fontSize, fontFamily: FONT })),
  ]);

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
// What each design costs in total: the size of the language, plus the length
// of all the specs people write in it (each chart's spec, weighted by how
// often that chart is made). Schematic sizes, so only the comparison reads.
const costs = [
  { design: "one function per chart type", part: "language", size: 8 },
  { design: "one function per chart type", part: "specs", size: 1.5 },
  { design: "low-level primitives", part: "language", size: 1.4 },
  { design: "low-level primitives", part: "specs", size: 8.2 },
  { design: "a good grammar", part: "language", size: 1.8 },
  { design: "a good grammar", part: "specs", size: 2.1 },
];

function compression(fontSize: number) {
  const bars = chart(costs, {
    axes: false,
    color: Color.palette({ language: ACCENT, specs: SPECS }),
  })
    .flow(
      spread({ by: "design", dir: "y", spacing: fontSize * 2.6 }).label(
        "design",
        { position: "outset-top-start", fontFamily: FONT, fontSize, color: INK }
      ),
      stack({ by: "part", dir: "x" })
    )
    .mark(
      rect({ w: "size", h: fontSize * 2, fill: "part" }).label("part", {
        position: "center",
        fontFamily: FONT,
        fontSize: fontSize * 0.9,
        color: "white",
      })
    );

  return spread({ dir: "y", spacing: 14, alignment: "end" }, [
    bars,
    words("schematic, not measured", Math.max(16, fontSize * 0.7), {
      fill: MUTED,
        fontStyle: "italic",
      
    }),
  ]);
}

// ─── Section 3b: the GoFish crash course ──────────────────────────────────
// The core level: the four inner planets on a dark background, from the
// GoFish repo's tutorial stories (origin/main 7b902ed38), copied exactly
// without the .render() call:
// packages/gofish-graphics/stories/tutorials/Basics.stories.tsx (no label)
// and Diagrams.stories.tsx (label and arrow). The slides show these with the
// styling parameters elided as "...".
const data = [
  { name: "mercury", r: 15, fill: "#F5E3C8", stroke: "#EFC9A2" },
  { name: "venus", r: 36, fill: "#D2913C", stroke: "#A96F26" },
  { name: "earth", r: 38, fill: "#3E8CCC", stroke: "#2F6FA6" },
  { name: "mars", r: 21, fill: "#F4BC80", stroke: "#E0954C" },
];

const planetsRow = () =>
  enclose(
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
        circle({ r: d.r, fill: d.fill, stroke: d.stroke, strokeWidth: 3 })
      )
    ),
  ]);

const planetsLabeled = () =>
  layer([
    enclose(
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
    ).name("planets"),
    text({ text: "Mercury", fill: "#E94560", fontSize: 14 }).name("label"),
  ])
    .relate(({ mercury, planets, label }) => [
      Constraint.align({ x: "middle" }, [mercury, label]),
      Constraint.distribute({ dir: "y", spacing: 20 }, [planets, label]),
      arrow({ stroke: "#E94560" }, [label, mercury]),
    ]);

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

// ─── Section 4: expressive vs. structured (CanAdd) ────────────────────────
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
  compression,
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
