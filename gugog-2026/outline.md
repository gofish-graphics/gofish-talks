# The Grammar of Graphics Needs Verbs: Towards a GUGOG

Revised outline, 2026-11-03, sixth version. Short talk, 7:00 budget, at the GUGOG workshop at IEEE VIS 2026. This version follows the user's own spoken run-through of the talk.

Note, 2026-11-03, later the same day: the bridge from the islands to the verbs now shows the evidence before it names the pattern. The Atom and PiCCL intro slides moved up to the end of part 2, where they ask what each island added. The verbs slide then names what they share. The change is time neutral. See "Changes to the deck" for details.

Note, 2026-11-04: the compression chart now carries a cited claim. A small line under its title says "To make a description shorter, you have to find the structure." with the source "Simon, 1962". The two "as rates" variants carry the same line, so the three stay comparable. Its notes now cite Herbert Simon for "compression begets structure", with backup quotes from Simon, Peter Grünwald, and Gregory Chaitin. The hierarchy slide in 4a gets one backup sentence that points back to Simon. The Target stays 0:50, but the Simon lines add about 0:15 when spoken and part 1 has no slack, so rehearse it. See "References".

Note, 2026-11-04, later the same day: the talk has a new hook, and the opening is in a new order. After the splash, the islands drawing carries the hook, in the user's own words: "I love visualization grammars, and I'm sad, because I can't use them together." The tangle shows that they do not work with each other and asks "Why are there so many islands?" The compression chart now comes after the islands and answers that question. The grammar of graphics compresses the common charts very well, then hits the expressivity cliff, and each island is someone getting past the cliff on their own. Its closing line is now "What if we compress the islands?" Simon's point, that you have to find the structure to make a description shorter, now explains how to fix the problem, not why to care. The reason for the change is that a personal, concrete problem is easier to care about at the start than an abstract argument, and compression then becomes both the explanation and the fix. The "why unify at all" opening and the AI line are dropped. Parts 1 and 2 are renamed, and the section files are renamed so the file order matches the talk order. The total stays 7:00. See "Changes to the deck" and "Time".

Note, 2026-11-05 (later): the circle slide now uses the user's drawing, and the islands drawings are colored as islands, green land with yellow shores in blue water. On the circle slide, GUGOG itself is one light green island with a yellow shore, and the grammars inside it are darker green with no shore.

Note, 2026-11-07, later: semantic validity is now bonus slides. The whole section (the opener, the Huang and Kay quote, the four CanSum steps, and the hidden open question) comes after the panel slide, behind a new divider slide titled "Bonus slides". The conclusion lost its third bullet, the open question, whose point is now in the last CanSum step's notes. The hierarchy slide now leads into the conclusion. The Atom walkthrough builds up again, with "Spread into bars" and "Stack within each lake" before the unit chart. The talk now runs 5:05 before the panel, which leaves 1:55 for the panel. See "Changes, 2026-11-07, later" below.

Note, 2026-11-07: GoFish is now introduced through the three grammars' examples, not a separate crash course. Each example teaches one GoFish idea. Atom teaches the chart flow: a plain stacked bar chart becomes Atom's unit chart with a small code change. PiCCL's bottle teaches operators on marks and then relations. GoTree's slide is unchanged. The ribbon buildup, the three planets slides, the Atom comparison, "same core, three shapes of data" and the open question slide are hidden. The labels above the slide titles are gone from the whole deck, the middle dots in slide text are gone, and "All three grammars in one picture" now shows its code. The three grammar intros are now two steps each: the example charts alone, then the operators. The talk now runs 6:15 before the panel, 1:15 less than before. See "Changes, 2026-11-07" below.

Note, 2026-11-06, late night, part A: the PiCCL bottle is now built in three steps that lead to image compositing, following the SciPy 2026 deck's bottle steps. GoTree is reframed: its own idea is that one spec works for any tree and gives many layouts, and gofish-gotree keeps that idea but writes the layout with GoFish's align and distribute in place of GoTree's four relation names. The tree of bottle waffles, remade with ten bottles per waffle, now comes right after "same core, three shapes of data" as "All three grammars in one picture". The answer grows by 0:10, so with part B the talk runs 7:30 before the panel. See "Changes, 2026-11-06, late night, part A" below.

Note, 2026-11-06, late night, part B: the semantic validity part carries the user's new script, in the same slide order. The opener now says "Very expressive! Did we lose safety and correctness?" The notes of the CanSum steps now say why the stacked temperatures are wrong, where the idea of tracking units came from (Huang and Kay, Flint, and the units in matplotlib), and that other cases are not caught yet. The part grows from 1:00 to 1:20, so the talk runs 7:20 before the panel. See "Changes, 2026-11-06, late night, part B" below.

Note, 2026-11-06, night: a new slide, "Add a label under a planet", sits between "Operators also work directly on marks" and "`spread` is `align` plus `distribute`". It is on trial and may be cut. It adds the label and arrow from "same core, three shapes of data" to the planets, placed by `align` and `distribute`, so the next slide can show that `spread` is made of the same two relations. The next slide now keeps the label, and the three planets slides share one fixed frame, so the planets do not move. With it, the talk runs 7:00 before the panel, and 7:15 with the panel. See "Changes, 2026-11-06, night" below.

Note, 2026-11-06, evening: the ribbon buildup now explains the data and shows how the rows are grouped at each step, the way the SciPy 2026 deck does. A new first step, "Start with the data", shows the first rows of the seafood table. On the four steps after it, a small copy of the table sits in the top right corner, and a data pipeline under the code shows how each operator groups the rows. The planets code now writes out the four circles. Auto-animate steps now take 0.3 seconds, and the new chart and title appear at once while the code moves, as in the thesis defense deck. The talk now runs 6:45 before the panel. See "Changes, 2026-11-06, evening" below.

Note, 2026-11-06, later the same day: the GoFish intro now builds the ribbon chart step by step, then shows operators used directly on marks and how `spread` is made of relations, and the GoTree specs slide is back in the answer. The talk now runs 6:25 before the panel. See "Changes, 2026-11-06, later" below.

Note, 2026-11-06: the talk is restructured around the user's new story. See "Restructure, 2026-11-06" below. It replaces the slide order, parts, and timing described in the older sections.

Note, 2026-11-05: part 2 and part 3 are restructured, following the user's notes. A new circle slide, "one language that holds all of them", now opens part 2. It shows the user's drawing of one circle around all the islands. Its notes are the bridge: you could hold every grammar without unifying anything, by bundling each one as a separate component, but then you could not mix them, and mixing needs something the islands have in common. A new GoTree intro, "GoTree adds operators for laying out trees", joins the Atom and PiCCL intros. A short "What is GoFish?" slide after the verbs slide says that GoFish extends the grammar of graphics with verbs, like the thesis defense deck's slide of that name. The crash course is now the chart API only, two steps, stacked bars to the ribbon chart. The planets diagram moves to a new slide after it, "under the chart API is a smaller, more direct core", and the PiCCL bottle slide gets a callout that points at the same core lines in its spec. The three GoTree code slides in 4a are hidden, and GoTree in GoFish is shown only on "same core, three shapes of data". The total stays 7:00. See "Changes to the deck" and "Time".

## Changes, 2026-11-07, later

This section updates the slide order and timing of "Changes, 2026-11-07" just below. Everything not named here stays as that section describes it.

### What changed

- Semantic validity is now bonus slides. `vite.config.ts` puts `04b-validity.html` after `05-panel.html`, so the slides moved as a whole and were not copied. The file opens with a plain divider slide titled "Bonus slides", which marks where the main talk ends.
- The bonus slides have no running totals. Each one's notes say "Bonus slide" and give its target if shown. Shown in full they take about 1:10.
- The conclusion's third bullet, "Open question. Can validity rules attached to operators cover every chart that uses them?", is removed, because the main talk no longer presents validity. Its point and the notes on syntax-directed type checking are now in the last CanSum step's notes. The conclusion's notes say how to put the bullet back. The conclusion's target drops from 0:20 to 0:15.
- The hierarchy slide now leads into the conclusion ("To sum up."). Its old lead into validity is kept in its notes for reference.
- The panel's cut list no longer has "Cut the semantic validity opener". The panel's fourth question, about checking validity, is unchanged.
- The grammar intros' operator figures no longer fade in on step 2. Each one is already on step 1, smaller than the example charts and hidden behind them, and slides out from behind them as the charts move away. Going back reverses it.
- The Atom walkthrough builds up again before the unit chart: "Start with the data", "Spread into bars", "Stack within each lake" (until now "A stacked bar chart is a flow of operators"), then "Atom draws one square for each fish". The ribbon buildup's first three steps moved from `03-gofish-intro.html` to `03b-code-comparisons.html`, so they are not duplicated. "Sort the stacks" and "Draw the ribbon" stay hidden in `03-gofish-intro.html`. The pipeline grows one stage per step, and the bars keep their width, spacing and baseline through the unit chart (new chart `atom-bars`). "Spread into bars" is 0:10. "Stack within each lake" drops from 0:15 to 0:10, because `spread` is now explained on the step before it. The unit chart step no longer shows a pipeline. What it showed (103, 137 and 88 units, then rows of five) is in its notes. The code and the chart do not move when the pipeline goes, because the code column is pinned at the top.
- "The PiCCL bottle chart starts as two bars" has a line under the code and the chart: "`.mark()` can accept glyphs made by applying operators directly to other marks". It is on step 1 only. The code and chart sit in a box of fixed height, so nothing moves when the line goes on step 2.
- On "Add relations to place a line and a label", the blue "relations" tint covers only the `.relate(...)` call. Everything else new on that step (`layer([`, the line and label marks, and the three `.name(...)` calls) gets the orange highlight the other steps use for what they add.
- The gofish-gotree code on the visible slides uses a simplified syntax, by the user's choice, because it is easier to read for people new to GoFish. The layout rules are curried relation functions (`parentChild: { x: align({ alignment: "middle" }), y: distribute({ spacing: 90 }) }`), the link is a line mark (`link: line({ curve: Curve.linear() })`), and on the GoTree slide the node is a mark with no callback (`node: circle({ r: 9 })`). The current library writes `node: () => circle(...)`, `link: { kind: "line", ... }` (link options in the current source) and `combine({ x: { kind: "align", alignment: "middle" }, ... })`. A comment above each changed code block and a line in the notes say so. The renders are static pictures, so nothing that runs changes, and `sources/tree-waffle/main.ts` is unchanged. On "All three grammars in one picture" the node keeps its callback, because it uses the data.
- On "All three grammars in one picture", the calls where one grammar plugs into the next are marked in the color of the grammar they call: `waffle(d)` in the GoTree part in Atom's blue, and `bottleUnit` in `.mark(bottleUnit)` in the Atom part in PiCCL's brown.
- On the grammar intros, each small label moves and scales with its picture, and the operator figure's label starts hidden behind the charts with the figure and slides out with it.
- The circle slide has no title and no on-slide question. The title's point ("We would love a grand unified grammar of graphics") and the question ("Why can't these grammars be unified with the grammar of graphics?") are in its notes. The question did not fit under the drawing once the drawing was as large as the tangle. The slide now crossfades from the tangle: the islands and arrows fade out as the circle fades in. The circle drawing has the islands at the same places as the tangle drawing, but the circle reaches past the water box, so at the tangle's scale it would be taller than the slide. It is drawn at 0.86 of the tangle's scale, placed so the islands land within about 30px of the tangle's islands (36px at most).
- The GoTree slide ("GoTree's layouts with GoFish's relations") shows the tree its code draws under the gofish-gotree code: the paper's Figure 5 render (images/tradeoffs/gofish-gotree-node-link.svg), made by gofish-gotree. The deck has no render made by GoTree itself.
- The PiCCL intro now shows a second figure, PiCCL's snapping and matching relations (point snapping, line snapping, orientation matching, length matching; images/intros/piccl-snapping.png, from the PiCCL paper). Like the compositing operators, it starts hidden behind the charts on step 1 and slides out on step 2. On step 2 the charts are on top, and the compositing operators and the snapping and matching relations sit side by side under them at the same height, so neither looks more important.
- "They add graphical operators and relations" shows the intro slides' figures under each drawing, sorted by kind. The operators card has Atom's layout operators and PiCCL's compositing operators. The relations card has PiCCL's snapping and matching relations and GoTree's layout rules. The two cards are now rows, one above the other, so the figures are big enough to read beside each card's drawing.
- The islands, tangle, and circle slides now share one scale and place: the islands and arrows drawings were given the circle drawing's viewBox (in their own coordinates), so all three fill one frame and every island sits on the same pixels (within 1px, the hand-drawn shapes differ slightly). The islands are 14% smaller than before so the circle fits. From the tangle to the circle, the islands stay still while the water and arrows fade and the GUGOG circle fades in.
- On the Atom steps, the data table moves and shrinks from its big place on "Start with the data" into the top right corner, instead of vanishing and coming back. It is the same table (same card style, with the vertical dots row) on all four steps, shrunk in the corner.
- The PiCCL intro's title is now "PiCCL adds compositing operators and snapping relations" (one line).
- On "They add graphical operators and relations", the relations row comes in on a click, in a space it holds from the start, and the line about the seven concepts comes on a second click. The head of each row has more room on the left.
- New slide after "GoTree's layouts with GoFish's relations": "spread is align plus distribute" (0:15). It shows spread over four bars in a dashed box, and on a click what spread elaborates to in GoFish (a layer with Constraint.align and Constraint.distribute), with a dashed baseline and gap markers added to the drawing. It ties the examples together: the operator from the Atom chart is the two relations from the bottle and GoTree. Running totals after it move by 0:15: the picture 4:50, the hierarchy 5:05, the conclusion 5:20, the panel 5:35.
- The GoTree and Atom paper figures were re-cut from the papers at 600 dpi, with the same framing: gotree-examples.png (867x367 to 4266x1806), gotree-operators.png (785x508 to 2135x1382), atom-operators.png (1080x366 to 4363x1479). The thin light blue frame in the old GoTree images (a screenshot edge) is gone. atom-teaser.png (3018x740) was already sharp and is unchanged.
- (2026-11-08) "spread is align plus distribute" moved to right after "All three grammars in one picture" and was rebuilt in three clicks: the spread call, then what it elaborates to (layer, align, distribute), then gofish-gotree's layout rules (the same align and distribute), then the bars drawing with its baseline and gap arrows and the line "The operator from the Atom chart is built from the same two relations GoTree uses." align is red and distribute blue throughout. Running totals: the picture 4:35, this slide 4:50, the hierarchy 5:05 as before.
- (2026-11-08) "They add graphical operators and relations" now starts with only the title. Click 1 shows the operators row, click 2 the relations row, click 3 the line about the seven concepts. Both rows hold their places from the start.
- (2026-11-08) A new slide before the bottle steps, "Next, PiCCL's bottle chart" (0:05), shows the finished chart large, so the audience sees where the build-up goes. It is GoFish's render of step 3; the PiCCL paper's own figure is not on this machine. Running totals from the bottle on move by 0:05: bottle steps 3:45, 3:55, 4:10; GoTree 4:25; the picture 4:40; spread 4:55; the hierarchy 5:10; the conclusion 5:25; the panel 5:40.
- (2026-11-08) "Stack within each lake" ends with a click that shows a small preview of the waffle under the stacked bars, labeled "next: one square per fish". It is the same chart as the next step, and the waffle then takes the bars' place on that step. No time added.
- No new pair animates by accident: the hierarchy slide, the conclusion, the panel slide, the divider, and the validity opener have no `data-auto-animate`. The four CanSum steps still pair with each other as before.

### Slide order and timing

Problem and question are unchanged. Running total 2:45.

13. Atom, "Start with the data". 0:10. Running total 2:55.
14. Atom, "Spread into bars". 0:10. Running total 3:05.
15. Atom, "Stack within each lake". 0:10. Running total 3:15.
16. Atom, "Atom draws one square for each fish". 0:15. Running total 3:30.
17. to 19. The PiCCL bottle steps. 0:10, 0:10, 0:15. Running totals 3:40, 3:50, 4:05.
20. "GoTree's layouts with GoFish's relations". 0:15. Running total 4:20.
21. "All three grammars in one picture". 0:15. Running total 4:35.
22. "Unify the domains and keep their structure". 0:15. Running total 4:50.
23. "The grammar of graphics needs verbs". 0:15. Running total 5:05.
24. Questions for the panel. 0:15. Running total 5:20.

Bonus slides, after the panel, not counted.

25. "Bonus slides" divider.
26. "Very expressive! Did we lose safety and correctness?" 0:05 if shown.
27. Huang and Kay quote. 0:10 if shown.
28. CanSum, four steps. 0:30, 0:15, 0:05, 0:05 if shown.

### Time

The talk now runs 5:05 before the panel, down from 6:15. Moving semantic validity out saves 1:10, and the shorter conclusion saves 0:05. The Atom buildup adds 0:05 (0:10 for "Spread into bars", less 0:05 on the stacked step). This leaves 1:55 for the panel within 7:00.

## Changes, 2026-11-07

This section updates the slide order and timing of "Changes, 2026-11-06, late night, part A" and part B below. Everything not named here stays as those sections describe it.

### What changed

- GoFish is introduced through the three grammars' examples, in place of the ribbon buildup and the planets slides. Each example teaches one GoFish idea, in this order. Atom teaches the chart flow, that is, operators in the chart API. PiCCL teaches operators used directly on marks, and then relations. GoTree shows its layouts written with the same relations.
- Atom is now three auto-animate steps, in `03b-code-comparisons.html`, with the code on the left and a live chart on the right:
  1. "Start with the data". 0:10. The ribbon buildup's first step: `chart(seafood)` and the first rows of the seafood table.
  2. "A stacked bar chart is a flow of operators". 0:15. A plain stacked bar chart, `spread` by lake and `stack` by species, with the small data table in the top right corner and the data transformation pipeline under the code, both from the ribbon buildup.
  3. "Atom draws one square for each fish". 0:15. Atom's version of the same chart, a unit chart. The `stack` line becomes three lines: `derive` repeats each row as many times as its count, then a `spread` by `chunk(5)` and a `spread` along x put the fish in rows of five. The mark gets a fixed size, and the lake `spread` gets `alignment: "end"` so the columns share a baseline. This is the GoFish repo's waffle story (`stories/forwardsyntax/WaffleChart.stories.tsx`), the same on origin/main and in nightly 20261106. The pipeline shows the rows becoming units and rows of five. The notes carry the old Atom comparison's points: Atom's nested `gridxy` layouts are these spreads, the credit to Atom for GoFish's flow syntax, and the paper's honest difference about packing.
- The bars and the units sit in the same frame. Both charts use the same lake spacing, the bars are as wide as a row of five units, and both are drawn at the same size, so the tallest bar is as tall as the tallest column of units. Only the x axis is drawn, under the chart, which the slides ask for with a render option (`data-x-axis`), like the existing `legend: false`. The charts are `atom-stacked` and `atom-units` in `charts.ts`.
- The PiCCL bottle steps now read as two parts. Step 1's notes say that operators also work directly on marks, and that `layer` is an operator on two rectangles. Step 2 is unchanged. Step 3 is now titled "Add relations to place a line and a label", its tag reads "relations place one mark against another", and its notes explain what a relation is, as the hidden planets slide did. Step 1 grows to 0:10 and step 3 to 0:15.
- "`spread` is `align` plus `distribute`" is no longer a slide. The GoTree slide's notes have one optional line: GoTree's rule for siblings, distribute on x and align on y, is what `spread` does.
- Hidden, with a comment saying why, so they can be compared or brought back: the five ribbon buildup slides and the three planets slides (`03-gofish-intro.html`), the Atom comparison "Atom's `gridxy` is GoFish's `spread`" (`03b-code-comparisons.html`), "same core, three shapes of data" (`04a-domain-design.html`), and the open question slide (`04b-validity.html`, hidden by the user). The open question's spoken framing, syntax-directed type checking, is now in the conclusion's notes next to its "Open question" bullet. "Same core, three shapes of data" is hidden because its planets and ribbon examples are no longer shown earlier, and "All three grammars in one picture" makes the shared-core point more strongly. Its spoken points moved to that slide: the GoTree slide now leads in with "And because they share one core, you can mix them", and the picture slide's notes say that Atom, PiCCL and GoTree in GoFish all use the same core operators and relations, and that the differences are in the shape of the data (rows of a table, a picture, a tree).
- Notes that pointed at hidden slides are fixed: the lead out of "What is GoFish?", the bottle's "as with the planets" tag and notes, the GoTree slide's "like the planets", the "same core, three shapes of data" notes (the ribbon chart and the planets are now new to the audience there), the lead out of the last CanSum step, the GoTree intro's notes and comment in `01c-compress-islands.html`, the panel slide's cut list, and the story summary on the title slide.
- The labels above the slide titles ("Problem", "Question", "Answer", "Semantic validity", "Conclusion", "Panel", and older numbered ones on hidden slides) are removed from every section file, hidden slides included. The CanSum steps' label had a `data-id`, removed on all four steps together, so the titles still match and do not move. The CSS rule `.part` stays in the shared template, because the SciPy 2026 deck still uses it. The title slide's venue line "GUGOG @ IEEE VIS 2026" is a different element and stays.
- Middle dots are gone from slide text. Source lines now put the authors in parentheses, for example "Bottle chart from PiCCL (Shi et al., IEEE VIS 2025)". Code captions keep only their first part: "GoTree", "gofish-gotree", "Atom", "core", "tabular", "hierarchical", "the data", and "the picture". The hidden `combine` slide's caption is now two sentences. The old part labels quoted in this outline use commas.
- On the bottle's second and third steps, the picture's `filter: Filter.grayscale` is now shown, on its own line under `image(...)`, because it is part of how the compositing works: the bottle is drawn in grays, and the color blend mode takes its color from the green rectangle. The type of `image` in nightly 20261106 accepts `filter`, so the `as any` casts on those two `image` calls in `charts.ts` are gone. The third step's code box is now 15 lines tall.
- "All three grammars in one picture" now shows its code beside the picture. It is `sources/tree-waffle/main.ts` in three parts, in the file's order: `bottleUnit` (PiCCL, with `atop`), `waffle` (Atom, two spreads), and the `tree` call (GoTree). Each part is tinted and tagged with its grammar's name. Styling and setup are left out as `...`: the TypeScript casts, how `amount` is read, the fill's y and height, the picture's height, spacing, node and card and link styling, the two `combine` rules, the `cells` helper, the `hierarchy` data, and the render call. The slide grows from 0:10 to 0:15.

- The three grammar intros in `01c-compress-islands.html` are now two auto-animate steps each. Step 1 shows only the example charts, large and centered, and its notes say what the charts are. In step 2 the charts move and shrink (up for Atom, whose figures stack, and to the left for PiCCL and GoTree, whose figures sit side by side), and the operator figure appears where they were. Its notes are about the operators. Each intro takes 0:05 more.

### Slide order and timing

Problem, 1:20, is unchanged.

Question, 1:25.

5. Atom intro, step 1, the unit charts. 0:10. Running total 1:30.
6. Atom intro, step 2, the layout operators. 0:10. Running total 1:40.
7. PiCCL intro, step 1, the pictorial charts. 0:05. Running total 1:45.
8. PiCCL intro, step 2, the compositing operators. 0:10. Running total 1:55.
9. GoTree intro, step 1, the tree visualizations. 0:05. Running total 2:00.
10. GoTree intro, step 2, the layout rules. 0:10. Running total 2:10.
11. "They add graphical operators and relations". 0:25. Running total 2:35.
12. "What is GoFish?". 0:10. Running total 2:45.

Examples, which introduce GoFish and are the answer, 2:00.

13. Atom, "Start with the data". 0:10. Running total 2:55.
14. Atom, "A stacked bar chart is a flow of operators". 0:15. Running total 3:10.
15. Atom, "Atom draws one square for each fish". 0:15. Running total 3:25.
16. PiCCL, "The PiCCL bottle chart starts as two bars". 0:10. Running total 3:35.
17. PiCCL, "Composite the green onto a bottle picture". 0:10. Running total 3:45.
18. PiCCL, "Add relations to place a line and a label". 0:15. Running total 4:00.
19. "GoTree's layouts with GoFish's relations". 0:15. Running total 4:15.
20. "All three grammars in one picture". 0:15. Running total 4:30.
21. "Unify the domains and keep their structure". 0:15. Running total 4:45.

Semantic validity, 1:10.

22. "Very expressive! Did we lose safety and correctness?" 0:05. Running total 4:50.
23. Huang and Kay quote. 0:10. Running total 5:00.
24. CanSum, four steps. 0:30, 0:15, 0:05, 0:05. Running totals 5:30, 5:45, 5:50, 5:55.

Conclusion, 0:20.

25. "The grammar of graphics needs verbs". 0:20. Running total 6:15.

Panel.

26. Questions for the panel. 0:15. Running total 6:30.

The running totals in `04b-validity.html` are correct again; part A had left them 0:10 early.

### Time

The talk now runs 6:15 before the panel, down from 7:30. From "What is GoFish?" to the end of the hierarchy slide used to take 3:20 and now takes 2:00. The new way of introducing GoFish saves 1:00, which already counts the extra 0:05 on the picture slide for its code. Hiding "same core, three shapes of data" saves 0:20, and hiding the open question saves 0:10. The two-step grammar intros add 0:15. This leaves 0:45 for the panel within 7:00.

## Changes, 2026-11-06, late night, part A

This section updates the answer and the question parts of "Changes, 2026-11-06, night" below. Part B, just after it, covers semantic validity. Everything not named here stays as those sections describe it.

### What changed

- The PiCCL bottle slide is now three auto-animate steps, like the ribbon buildup. The code is on the left and moves word by word. The live chart is on the right, in a fixed box, and the bottles do not move from step to step. The steps follow the SciPy 2026 deck's bottle steps ("normalized bars", "paint the bottle", "layer on labels"), in TypeScript and with `atop` in place of `paint`:
  1. "The PiCCL bottle chart starts as two bars". 0:05. A `layer` of a gray rectangle as tall as 100 and a green ("lime") rectangle as tall as the amount, spread by category.
  2. "Composite the green onto a bottle picture". 0:10. The `layer` becomes `atop({ blendMode: "color" }, [...])` and the gray rectangle becomes the bottle picture. This is the peak of the buildup, because image compositing is PiCCL's own idea.
  3. "Mark the amount with a line and a label". 0:10. The full spec, with the line and label placed by `.relate(...)`. The "relations" tint and tag stay on this step, because the buildup makes the relations the one new thing on it.
- From the SciPy deck, these slides keep the order, the gray and green bars, and the code of each step. They drop the SciPy deck's layout of three charts side by side with arrows, its fragments, its bar chart's axes and muted colors, and its Python syntax. Each step is its own slide here, and the bars use the same gray and green as the code says.
- To keep the bottles still, the live charts differ from the GoFish repo's bottle story in styling only, which the slides elide as `...`. Every category takes the same width on every step. The bars are as wide as the bottle picture, the line runs from the bottle to the end of its label, and the label is in the deck's font. The story's 175-wide fill and line would make step 3 wider than step 2, because `atop` takes the picture's bounds. The charts are `piccl-bottle-bars`, `piccl-bottle-tinted`, and `piccl-bottle` in `charts.ts`.
- The PiCCL intro is now titled "PiCCL adds operators for compositing images", and its notes say that image compositing is PiCCL's distinctive idea.
- The GoTree intro is now titled "GoTree draws any tree in many layouts", and its right figure is labeled "layout rules for each axis". Its notes say that GoTree's interesting idea is that one spec works for any shape of tree and that the same few rules give very different pictures, and that it lays trees out with relations on each axis to do this.
- The GoTree specs slide is now titled "GoTree's layouts with GoFish's relations". A line under the code says "GoTree has four relation names to learn: within, flatten, juxtapose, and align. GoFish's align and distribute do the same work." The notes say that gofish-gotree keeps GoTree's idea and writes it with the relations GoFish already has, and that GoTree's names made sense in its own setting. The color pairs still support the point: C (within) and F (align) map to `align`, and D (flatten) and E (juxtapose) map to `distribute`.
- On "They add graphical operators and relations", the relations card now says "GoTree builds every layout from relations on each axis. Its juxtapose puts children beside their parent, and its align lines up siblings." This is still an honest example of a relation, from the paper's own description of GoTree, but it no longer reads as if relations were GoTree's main idea. The notes add a short line to say that these grammars did much more, that their other ideas were interesting and important at the time, and that they shaped GoFish's design too.
- The kicker is back in the place the user asked for. It was never removed: it was the Figure 6 slide, "the surfaces work together", after the hierarchy slide. It now comes right after "same core, three shapes of data", titled "All three grammars in one picture". Its picture is a remake of the paper's Figure 6, which was a picture, not a live chart. Each waffle now has ten bottles, five across and two high. One waffle is empty, one is full, and two are partly filled, with one bottle partly full in each. Each waffle sits on a white card, so the links stop at its top. The source is `sources/tree-waffle/main.ts`, the paper's source updated for nightly 20261106 (`atop`) and gofish-gotree on GoFish origin/main. It stays a picture, because gofish-gotree is not on npm. No GoFish story has this example. The image is `images/tradeoffs/gofish-tree-waffle-tenths.png`; the paper's image is still in the same folder.
- The hierarchy slide now ends the answer, and its notes carry the lead into semantic validity and the optional Brunson bridge.

### Slide order and timing

Everything up to the Atom comparison is unchanged and ends at 4:25.

Answer, 1:35.

19. Atom comparison. 0:10. Running total 4:25.
20. Bottle step 1, "The PiCCL bottle chart starts as two bars". 0:05. Running total 4:30.
21. Bottle step 2, "Composite the green onto a bottle picture". 0:10. Running total 4:40.
22. Bottle step 3, "Mark the amount with a line and a label". 0:10. Running total 4:50.
23. "GoTree's layouts with GoFish's relations". 0:15. Running total 5:05.
24. "Same core, three shapes of data". 0:20. Running total 5:25.
25. "All three grammars in one picture". 0:10. Running total 5:35.
26. "Unify the domains and keep their structure". 0:15. Running total 5:50.

Semantic validity, 1:20, as part B describes it, but each running total is 0:10 later: 6:55 after the Huang and Kay quote, 7:10 at the end of the part. The running totals in `04b-validity.html` were not changed here, because another change was editing that file; they are 0:10 early.

Conclusion, 0:20. Running total 7:30.

Panel, 0:15. Running total 7:45.

### Over 7:00

The talk now runs 7:30 before the panel. Nothing was cut. The bottle buildup costs 0:10 more than the single bottle slide. Cutting the label slide on trial saves 0:15, and cutting "All three grammars in one picture" saves 0:10. The cuts in "Changes, 2026-11-06, evening" still apply.

## Changes, 2026-11-06, late night, part B

This section updates the semantic validity part of "Changes, 2026-11-06, night" below. Everything not named here stays as that section describes it.

### What changed

- The opener "Validity rules belong to operators" is replaced. The slide now says "Very expressive! Did we lose safety and correctness?" The notes add that there seem to be a lot more ways for a GoFish spec to go wrong.
- The Huang and Kay quote stays where it was, right after the opener. Its notes end with "Let me show you one example."
- CanSum step 1 shows the same incorrect chart. Its caption now says "it stacks, but temperatures do not add up". Its notes say that it is true that there are more ways to go wrong, and that nothing in the syntax stops you from writing this spec. Then they give the argument: `stack` places marks end to end, so the total length is the sum of their sizes. That only makes sense if the sizes are amounts that add up, so the rule follows from what `stack` means. Because GoFish uses the same `stack` operator for bars, areas, ribbons, waffles and nested layouts, one rule covers all of them. The notes also say, to be fair, that the stack transform in Vega-Lite and the position adjustment in ggplot2 are also one place where such a check could live.
- CanSum step 2's notes now say where the idea came from: Cynthia and Matt's paper, Flint, and the units in matplotlib. The idea is to track the unit of measure of each column in the dataset. The notes quote the matplotlib docs for `matplotlib.units` (`ConversionInterface`, the units registry, and `AxisInfo`), and say that matplotlib uses units to convert values and label axes, not to decide which operations are valid.
- CanSum step 3's notes say that `stack` requires the column it stacks to be summable, so GoFish can enforce correct stacking, and that there are other cases it does not catch yet.
- CanSum step 4's notes now say "Now switch to a column that is summable, the US dollars, and we can stack safely." The old lines (it checks specs, not pictures, and its limits) stay as lines to say if there is time.
- The captions of the three results no longer use middle dots or colons. The footnote on the CanSum steps now also names matplotlib's units.
- The auto-animate chain, data-ids, delays and `data-magic-move` are unchanged.

### Slide order and timing

Everything up to Figure 6 is unchanged and ends at 5:40.

Semantic validity, 1:20.

25. "Very expressive! Did we lose safety and correctness?" 0:05. Running total 5:45.
26. Huang and Kay quote. 0:10. Running total 5:55.
27. CanSum, four steps. 0:30, 0:15, 0:05, 0:05. Running totals 6:25, 6:40, 6:45, 6:50.
28. "Open question". 0:10. Running total 7:00.

Conclusion, 0:20.

29. "The grammar of graphics needs verbs". 0:20. Running total 7:20.

Panel.

30. Questions for the panel. 0:15. Running total 7:35.

### Over 7:00

The talk now runs 7:20 before the panel. Step 1 grew the most, because its notes now carry the argument about what `stack` means. Nothing is cut here. Cutting the label slide on trial saves 0:15, and the cuts in "Changes, 2026-11-06, evening" still apply.

## Changes, 2026-11-06, night

This section updates "Changes, 2026-11-06, evening" below. Everything not named here stays as that section describes it.

### What changed

- A new slide, "Add a label under a planet", comes between the two planets slides. It is on trial: the user wants to see it, and it may be cut for time.
- It shows the label and arrow from the planets on "same core, three shapes of data", written like the two planets slides: no `const planets`, no map, and the same four circle lines. The box and the label go in a `layer`, and three relations place the label: `align` puts it under Mercury, `distribute` puts it 20 pixels below the box, and an arrow points from it to Mercury. The live chart is `planets-row-label` in `charts.ts`, and it runs the code shown with the styling filled in.
- The flow is now: operators on marks, then a label placed by relations, then `spread` written as the same two relations. The magic move into the new slide wraps the box in a `layer` and adds the label lines. The magic move out of it turns only `spread` into the `layer` and its two relations.
- "`spread` is `align` plus `distribute`" now keeps the label, the outer `layer` and its `relate`, and the arrow. It is the label slide with only the `spread` written out as a `layer` with `align` and `distribute`, so the magic move between them changes only the `spread` part. Its live chart, `planets-relate`, runs that code.
- The three planets slides now share one fixed frame. The code is at 0.61em, the size the other code slides use, in a box as tall as the longest code (18 lines). The picture sits under it at the same place and scale (1.2, down from 1.4) on all three slides. The planets do not move at all between the slides; only the code changes, and the label and arrow appear under the row. The first slide's code box now has empty space under its 8 lines.

To cut the label slide:

1. Delete its section (and the comment above it) in `sections/03-gofish-intro.html`, and delete `planetsRowLabel` and its `planets-row-label` key in `charts.ts`.
2. Take the label back out of "`spread` is `align` plus `distribute`": its code loses the outer `layer([`, the `.name("planets")`, the `text` line, and the outer `.relate` with its three lines, and `planetsRelate` in `charts.ts` returns `planetsRelateBox()` without `withLabel`.
3. Take 0:15 off the running totals from "`spread` is `align` plus `distribute`" on.

The shared frame can stay. The code box could then be made shorter (11 lines) and the picture larger again.

### Slide order and timing

Everything up to "Operators also work directly on marks" is unchanged and ends at 3:45.

GoFish intro, 1:55.

16. "Operators also work directly on marks". 0:15. Running total 3:45.
17. "Add a label under a planet" (on trial). 0:15. Running total 4:00.
18. "`spread` is `align` plus `distribute`". 0:15. Running total 4:15.

Answer, 1:25.

19. Atom comparison. 0:10. Running total 4:25.
20. The PiCCL bottle chart in GoFish. 0:15. Running total 4:40.
21. "GoTree in GoFish keeps GoTree's own words". 0:15. Running total 4:55.
22. "Same core, three shapes of data". 0:20. Running total 5:15.
23. "Unify the domains and keep their structure". 0:15. Running total 5:30.
24. Figure 6, "the surfaces work together". 0:10. Running total 5:40.

Semantic validity, 1:00.

25. "Validity rules belong to operators". 0:10. Running total 5:50.
26. Huang and Kay quote. 0:10. Running total 6:00.
27. CanSum, four steps. 0:10, 0:05, 0:05, 0:10. Running totals 6:10, 6:15, 6:20, 6:30.
28. "Open question". 0:10. Running total 6:40.

Conclusion, 0:20.

29. "The grammar of graphics needs verbs". 0:20. Running total 7:00.

Panel.

30. Questions for the panel. 0:15. Running total 7:15.

### Over 7:00

The main story now runs 7:00 and leaves no time for the panel. Cutting the new slide brings it back to 6:45. The cuts suggested in "Changes, 2026-11-06, evening" still apply.

## Changes, 2026-11-06, evening

This section updates "Changes, 2026-11-06, later" below. Everything not named here stays as that section describes it.

### What changed

- The ribbon buildup has a new first step, "Start with the data". It shows `chart(seafood)` and, in place of the chart, the first three rows of the table, with its fields lake, species, and count. This is the thesis defense deck's "Start with the Data" slide, with the same rows and the same card style. The SciPy 2026 deck has the same slide for its barley data.
- The four steps after it show the data at each step. Under the code, a data pipeline shows the 30 rows, how `spread` groups them by lake, how `stack` groups each lake by species, how sorting gives each lake its own order, and what each rectangle gets. On the last step it also shows how `ribbon` groups the rectangles again by species, one ribbon for each species. This is the SciPy 2026 deck's "data transformation pipeline", from its "add a second grouping" slide, with its markup, colors, and CSS. As in the SciPy deck, it shows the first two lakes or species, then "…", then the last one.
- On those four steps, a small copy of the table sits in the top right corner, so the fields stay in view. The SciPy 2026 deck does the same on its walkthrough slides. Its header uses this deck's red, not SciPy's navy.
- The pipeline's colored rectangles use the chart's own colors. GoFish gives the colors to the species in the order it meets them, so the colors change when the stacks are sorted. The thesis deck's charts do the same.
- Auto-animate steps now take 0.3 seconds, not Reveal's default of 1 second. This is set for this deck only, in `main.ts`. The shared template keeps Reveal's default unless a deck asks.
- In the ribbon buildup and the two planets slides, the new title, chart, and pipeline now appear at once, and the code then moves into place over 0.3 seconds. This is the order the thesis defense deck uses. The SciPy 2026 deck has no animation; its slides change all at once.
- The planets code now writes the four circles out one by one, with no data array, and the same four lines are on both planets slides. Only the circles' outline and the box's styling are left out, as `...`. The live charts run the same code.

Left out from the source decks, to keep the buildup short:

- The SciPy deck builds its pipeline one row per click, in four clicks. Here each step's new rows come with the step, so the buildup has no extra clicks.
- The thesis deck's "Place One Slot per Lake" step, with empty slots and no mark, and the SciPy deck's matching "place one slot per site".
- The thesis deck's "elaborates to" code under step 1, which writes `spread` out as a `groupBy`. The pipeline shows the same grouping.
- The thesis deck's preview of the ribbon chart before its ribbon steps, the sorted bars with an arrow to the ribbon chart.
- The SciPy deck's color legend for operators, marks, and data work.

### Slide order and timing

Problem, 1:20, and Question, 1:00, are unchanged. They end at 2:20.

GoFish intro, 1:40.

10. "What is GoFish?" 0:10. Running total 2:30.
11. "Start with the data". 0:10. Running total 2:40.
12. "Spread into bars". 0:15. Running total 2:55.
13. "Stack within each lake". 0:10. Running total 3:05.
14. "Sort the stacks". 0:10. Running total 3:15.
15. "Draw the ribbon". 0:15. Running total 3:30.
16. "Operators also work directly on marks". 0:15. Running total 3:45.
17. "`spread` is `align` plus `distribute`". 0:15. Running total 4:00.

Answer, 1:25.

18. Atom comparison. 0:10. Running total 4:10.
19. The PiCCL bottle chart in GoFish. 0:15. Running total 4:25.
20. "GoTree in GoFish keeps GoTree's own words". 0:15. Running total 4:40.
21. "Same core, three shapes of data". 0:20. Running total 5:00.
22. "Unify the domains and keep their structure". 0:15. Running total 5:15.
23. Figure 6, "the surfaces work together". 0:10. Running total 5:25.

Semantic validity, 1:00.

24. "Validity rules belong to operators". 0:10. Running total 5:35.
25. Huang and Kay quote. 0:10. Running total 5:45.
26. CanSum, four steps. 0:10, 0:05, 0:05, 0:10. Running totals 5:55, 6:00, 6:05, 6:15.
27. "Open question". 0:10. Running total 6:25.

Conclusion, 0:20.

28. "The grammar of graphics needs verbs". 0:20. Running total 6:45.

Panel.

29. Questions for the panel. 0:15. Running total 7:00.

### Over 6:00

The main story now runs 6:45 and leaves only 0:15 for the panel. Nothing was cut. The cuts suggested in "Changes, 2026-11-06, later" still apply and would bring it to 6:15. After them, the next cut I would suggest is "Operators also work directly on marks" (0:15), saying its point over the relations slide, which shows the same picture.

## Changes, 2026-11-06, later

This section updates the slide order and timing in "Restructure, 2026-11-06" below. Everything not named here stays as that section describes it.

### What changed

- The GoFish intro now has three stages, following the user's notes. First, operators in a chart: the ribbon chart is built in four steps. Second, operators used directly on marks, with no data table: the planets diagram. Third, relations: the same planets, with `spread` written as `align` plus `distribute`, and the same picture.
- The ribbon buildup replaces the two-step crash course. Its four steps are four slides of the thesis defense deck's seafood walkthrough (`phd-thesis-20260618/presentation/sections/03-gofish.html`), with their titles in sentence case: "Spread into bars", "Stack within each lake", "Sort the stacks", and "Draw the ribbon". The last step uses the shorter `.layer(ribbon(...))` form, which is the GUGOG paper's Figure 2. Each step has its own live chart, and the code moves word by word between steps. The thesis deck adds the spacing between lakes just before the ribbon. Here every step has it, shown as `...`, so the bars do not move.
- "Operators also work directly on marks" shows the planets from the GoFish repo's Basics tutorial story: four circles, placed in a row by `spread`, inside `enclose`.
- "`spread` is `align` plus `distribute`" moves the same code one step: the `spread` line becomes a `layer` with `.relate(...)`, `Constraint.align({ y: "middle" }, ...)` and `Constraint.distribute({ dir: "x", spacing: 50 }, ...)`. The picture does not change. This is how GoFish really defines `spread`. In `packages/gofish-graphics/src/ast/graphicalOperators/spread.tsx` (the same code in nightly 20261106), `spread` builds a layer over its children and relates them with `align` on the other axis and `distribute` along its direction. Its defaults are a baseline alignment and 8 pixels of spacing. `stack` is `spread` with the marks glued together.
- These two planets slides replace the hidden core slide ("under the chart API is a smaller, more direct core"), whose markup is now only in git history. "Same core, three shapes of data" still shows the labeled planets.
- On "They add graphical operators and relations", the line "An operator places its marks completely. A relation sets only some properties. So operators can be built from relations." is gone, and so is the matching spoken point. The planets slides now show it with code.
- On the bottle slide, the tinted lines and their tag now say "relations", not "core". The tag reads "relations written directly, as with the planets".
- The GoTree specs slide is shown again, moved to just before "same core, three shapes of data". Its title is now "GoTree in GoFish keeps GoTree's own words", and it is no longer an auto-animate slide. The GoTree data and picture slide and "`combine` compiles to GoFish constraints" stay hidden.

### Slide order and timing

Problem, 1:20, and Question, 1:00, are unchanged. They end at 2:20.

GoFish intro, 1:20.

10. "What is GoFish?" 0:10. Running total 2:30.
11. "Spread into bars". 0:10. Running total 2:40.
12. "Stack within each lake". 0:10. Running total 2:50.
13. "Sort the stacks". 0:10. Running total 3:00.
14. "Draw the ribbon". 0:10. Running total 3:10.
15. "Operators also work directly on marks". 0:15. Running total 3:25.
16. "`spread` is `align` plus `distribute`". 0:15. Running total 3:40.

Answer, 1:25.

17. Atom comparison. 0:10. Running total 3:50.
18. The PiCCL bottle chart in GoFish. 0:15. Running total 4:05.
19. "GoTree in GoFish keeps GoTree's own words". 0:15. Running total 4:20.
20. "Same core, three shapes of data". 0:20. Running total 4:40.
21. "Unify the domains and keep their structure". 0:15. Running total 4:55.
22. Figure 6, "the surfaces work together". 0:10. Running total 5:05.

Semantic validity, 1:00.

23. "Validity rules belong to operators". 0:10. Running total 5:15.
24. Huang and Kay quote. 0:10. Running total 5:25.
25. CanSum, four steps. 0:10, 0:05, 0:05, 0:10. Running totals 5:35, 5:40, 5:45, 5:55.
26. "Open question". 0:10. Running total 6:05.

Conclusion, 0:20.

27. "The grammar of graphics needs verbs". 0:20. Running total 6:25.

Panel.

28. Questions for the panel. 0:35. Running total 7:00.

### Over 6:00

The main story now runs 6:25, past the 6:00 mark, and leaves only 0:35 for the panel. Nothing was cut. These are the cuts I would suggest, in order:

- "Sort the stacks" (0:10). Sort in the "Draw the ribbon" step instead.
- Figure 6, "the surfaces work together" (0:10).
- "What is GoFish?" (0:10). Say its line over the operators and relations slide.
- The Huang and Kay quote (0:10). Say the point over the validity opener.

The first three bring the main story to 5:55.

## Restructure, 2026-11-06

This section replaces the structure below. The older sections stay as a record of earlier versions. The talk now follows the user's new story, in four parts plus a conclusion: problem, question, answer, and semantic validity. It borrows more of the paper's story and wording, especially in the opening and in how graphical operators and relations are described. The talk does not assert "verbs" up front. It arrives at operators and relations from the three examples, and the conclusion's title, "The grammar of graphics needs verbs", names them as the verbs of the paper's title.

The part labels are now plain words, with no numbers: "Problem", "Question", "Answer", "Semantic validity", "Conclusion", and "Panel". The islands drawing and the tangle still have no label.

### Slide order and timing

Times are targets. Each slide's notes show its target and running total.

Problem, 1:20.

1. Title. 0:00. Running total 0:00.
2. Splash, "these are all GoFish programs". 0:10. Running total 0:10.
3. Islands. 0:35. Running total 0:45. The notes now follow the paper's opening. The grammar of graphics replaced a messy collection of chart types with seven concepts that combine. It is very expressive, but it does not cover every visualization, so researchers keep making new grammars for trees, networks, maps, animation, and other domains. We now live in a world not of chart types, but of grammar types. The old hook is kept as an optional line.
4. Tangle. 0:15. Running total 1:00. Each grammar is its own system, so their ideas are hard to compare, combine, and carry into practice.
5. The circle, "We want a grand unified grammar of graphics". 0:20, with the question. Running total 1:20. It now follows the tangle directly. Its one click shows the question "Why can't these grammars be unified with the grammar of graphics?" The old bridge about bundles and mixing is gone.

Question, 1:00.

6. Atom intro. 0:15. Running total 1:35.
7. PiCCL intro. 0:10. Running total 1:45.
8. GoTree intro. 0:10. Running total 1:55.
9. "They add graphical operators and relations". 0:25. Running total 2:20. This reworks the old verbs slide ("Data, Marks, Channels, Coordinates"). An operator takes a set of marks and makes a new mark. A relation takes a set of marks and produces a property, such as a shared position. An operator places its marks completely, and a relation sets only some properties, so operators can be built from relations. Its one click says that neither fits any of the seven concepts of the grammar of graphics.

GoFish intro, 0:30.

10. "What is GoFish?" 0:10. Running total 2:30. Its line is now "GoFish adds graphical operators and relations to the grammar of graphics."
11. Crash course, two steps. 0:10 each. Running totals 2:40 and 2:50. The first step's title is now "GoFish composes marks with operators".

Answer, 1:10.

12. Atom comparison. 0:10. Running total 3:00.
13. The PiCCL bottle chart in GoFish. 0:15. Running total 3:15. Its callout tag now says "relations, written directly", because the core slide it pointed back to is hidden. Its code now uses `atop` in place of `paint` (see below).
14. "Same core, three shapes of data". 0:20. Running total 3:35. It now comes before the hierarchy slide.
15. The hierarchy slide, now titled "Unify the domains and keep their structure". 0:15. Running total 3:50. This is the takeaway. The domains keep their own character while being unified. A universal grammar can keep each domain's structure in a hierarchy with shared parts, and GoFish is one concrete, precise example of that, which persuades more than a general argument that such a grammar might exist. Its labels changed: the left row is "one flat layer of concepts", the bottom row is "core: marks and relations", the right caption is "a hierarchy: many domains, one grammar", and the line under it is "Each domain keeps its own structure, and all of them share the parts underneath."
16. Figure 6, "the surfaces work together". 0:10. Running total 4:00.

Semantic validity, 1:00.

17. "Validity rules belong to operators". 0:10. Running total 4:10. New. A unified grammar is more expressive, so it can also make more incorrect charts. But its structure helps, because validity rules belong to a few operators, not to many chart types. For example, `stack` sums its values, so `stack` needs values that can be summed.
18. Huang and Kay quote. 0:10. Running total 4:20. Moved here, and no longer framed as an objection. Semantic validity is a big theme at this workshop.
19. CanSum, four steps. 0:10, 0:05, 0:05, 0:10. Running totals 4:30, 4:35, 4:40, 4:50. The first step is the incorrect stacked chart, and its notes say this work is very early and was inspired by Bartonicek, Urbanek, and Murrell, Flint, and Huang and Kay.
20. "Open question". 0:10. Running total 5:00. New. "Can we check whether a chart is valid by following the structure of its specification?" The notes say this is like syntax-directed type checking, that not every type system works that way, that reasonable people disagree that a specification's structure is the right place to check validity, and that the user believes it is well suited, with the proof left to future work.

Conclusion, 0:20.

21. "The grammar of graphics needs verbs". 0:20. Running total 5:20. New. Three points: domain-specific grammars add graphical operators and relations, which the grammar of graphics doesn't have; with those added, one grammar can hold the domains and keep each one's structure; and the open question of whether validity rules attached to operators can cover every chart that uses them.

Panel.

22. Questions for the panel. 1:40. Running total 7:00. Unchanged apart from its label, now "Panel", and its timing notes.

The main story runs 5:20 at its targets, which leaves 1:40 for the panel slide.

### Hidden on 2026-11-06, and why

Each hidden slide has `data-visibility="hidden"` and a comment that says why.

- The compression chart and its two "as rates" variants, with the Simon framing. The user cut the compression section, so the circle follows the tangle directly.
- "Under the chart API is a smaller, more direct core". It is not in the new story. "Same core, three shapes of data" still shows the planets as the core.
- The McNutt quote. It is not in the new story. The hierarchy slide's notes keep a backup line that answers his concern.
- "Where we are now" (the next cliff and the typology of operators). It is not in the new story. The conclusion slide now comes before the panel.

The old verbs slide, "Data, Marks, Channels, Coordinates", was reworked in place into the operators and relations slide, not hidden. Its markup is in git history and in the thesis defense deck.

### The bottle code on nightly 20261106

The deck pins gofish-graphics 0.1.0-nightly.20261106. In GoFish commit df2fd1de (2026-11-04), `paint` became `atop`, `mask` was removed, and `union`, `intersect`, `subtract`, and `exclude` were added. The repo's bottle story (`packages/gofish-graphics/stories/piccl/Bottle.stories.tsx`) changed in the same commit: it uses `atop({ blendMode: "color" }, [...])`, and its image takes `filter: Filter.grayscale`. The bottle slide now shows that code, with styling elided, and draws the chart live from the full story ("piccl-bottle" in `charts.ts`, with the story's image copied to `images/comparisons/wilsonblanco.png`), in place of the paper's static image. The paper's Figure 4 still shows the older `paint` version.

## The story in one paragraph

The talk opens on a wall of GoFish charts, so the audience has something concrete to hold on to. Then comes the hook, over the islands drawing. I love visualization grammars, and every time I see one presented I'm in the audience like the sunglasses emoji. But I'm sad, because I can't use them together. They are all different systems, and they don't work with each other. The ggplot2 ecosystem does not help me, because I mostly work in JavaScript and Python, and many grammars don't fit the grammar of graphics anyway. There is also a practical problem: a lot of cool work, including mine, has no clear path into practice. That is why I want to build a GUGOG. It would let me play with all these grammars, and maybe let end users make charts they have never seen. The tangle shows that the islands don't work with each other, and asks why there are so many islands. The compression chart answers. It measures how well today's approaches compress, by the size of the language and the length of each spec, weighted by how often each chart is made. d3 has a small language but long specs. seaborn has short specs but a huge language. The grammar of graphics compressed many chart types into one shared language, and that revealed structure like marks, channels, scales, and coordinate systems. It sits near the sweet spot for the common charts, until the expressivity cliff. Past the cliff, it drifts toward chart types (ggplot2 extensions) or toward explicit calculations (Vega-Lite), and each island is someone getting past the cliff on their own. Together the islands make a very large language. So what if we compress the islands into one language? You could hold them all without unifying anything, with one package that bundles every grammar as a separate component. That would fix installing them, but it would not let you mix them, because each island's ideas would still only work inside that island. Mixing needs something the islands have in common. To make a description shorter, you have to find the structure (Simon, 1962), and the structure you find depends on the language you use. A language with only nouns finds nouns. So look at what each island added. Atom added operators for splitting and arranging units. PiCCL added operators for repeating and combining pictures. GoTree added operators for laying out trees. None of them mainly added a new kind of mark or channel. So what the islands share is operators, not more nouns, and the grammar of graphics has almost none. The grammar of graphics needs verbs. GoFish extends the grammar of graphics with verbs. Its chart API is short for common charts, and it is built on a smaller, more direct core, where marks are placed by explicit relations like align and distribute. Atom and PiCCL reduce to these verbs, and the PiCCL bottle mixes the chart API and the core in one spec. Two fair objections follow. Andrew McNutt's is that one language cannot serve every domain's design. With verbs, a new word is a function that composes existing verbs and marks, so a DSL is a library built inside the language. The core is the bottom of that hierarchy, the chart API is one surface on it, and GoTree is another. Cynthia Huang and Matthew Kay's is that growth costs safety. A small type system brings it back, and CanSum is the evidence. Finally, our verbs are themselves a typology of operators, and that is the next cliff. We have to compress again, and that is the first question for the panel.

## The thesis

In the traditional grammar of graphics, the only way to grow the language is to add a new primitive. In a language with verbs, you can build new structures from old ones, using a fairly stable set of composition mechanisms.

The first half is said on the verbs slide in part 3. The full thesis is said on the hierarchy slide in part 4a, as the answer to the first objection. The first crash course step also says the second half once, when GoFish's verbs are introduced.

## How the parts connect

- Part 1, "Why there are islands", opens on concrete charts and then the hook, spoken over the islands drawing: I love visualization grammars, and I'm sad, because I can't use them together. The tangle shows that they don't work with each other and asks "Why are there so many islands?" The compression chart answers it. The grammar of graphics compresses the common charts very well, then hits the expressivity cliff, and each island is someone getting past the cliff on their own. It ends with the line "What if we compress the islands?"
- Part 2, "Compress the islands", says how to fix it. It opens on the circle slide, one language that holds all the islands (the user's drawing, with one circle labeled GUGOG around all the islands). Its notes are the bridge: a bundle of separate grammars would hold them all but would not let you mix them, so mixing needs something the islands have in common. Then it asks what each island added, with three of them up close. Atom added operators for splitting and arranging units, PiCCL added operators for repeating and combining pictures, and GoTree added operators for laying out trees. It ends with "So none of these three islands mainly added a new kind of mark or channel. Each one added new ways to arrange and combine things."
- Part 3, "The grammar of graphics needs verbs", is the main point and where the title lands. The verbs slide names what part 2 showed: the islands all added verbs, and the grammar of graphics has a rich set of nouns and almost no verbs. It says the first half of the thesis. "What is GoFish?" says that GoFish extends the grammar of graphics with verbs. The crash course shows GoFish's verbs on the chart API, and the core slide shows the smaller, more direct core under it. The Atom and PiCCL comparisons are the evidence that the same pictures reduce to one shared set of verbs, and the bottle's callout shows the chart API and the core mixing in one spec. It ends with "There are two fair concerns about this idea. The first one is Andrew McNutt's."
- Part 4a, "Does one language cost domain design?", is the first objection, McNutt's, in its strongest form and credited. The answer is that with verbs a DSL is a library built inside the language. The hierarchy slide states the full thesis, and its bottom row is the core the audience already saw. "Same core, three shapes of data" and Figure 6 are the evidence, with GoTree as the third surface. The spoken bridge crediting Jason Brunson ends 4a and raises the second objection.
- Part 4b, "Does growth cost safety?", is the second objection, Huang and Kay's, in their own words and credited. The answer is a small type system, shown by the four CanSum steps. It ends with "So growth does not have to cost safety. But the growth itself has a limit, and that is where I want to end."
- Part 5, "The next cliff", admits what is still missing. Our verbs are themselves a typology of operators, so we have to compress again. The panel slide follows.

Both objections are presented as fair concerns, in their strongest form, with credit, before the evidence. McNutt, Cynthia Huang, Matthew Kay, Jason Brunson, Atom's, PiCCL's, and GoTree's authors, and Vega-Lite's authors are expected in the room. The hook is said as love for their work and as a problem we all share, and the circle slide's bridge says plainly that building a separate grammar was the right move for each team at the time.

## Slides

Times are targets. Each slide shows its target and running total in its speaker notes. Hidden slides and the comparison variants of the compression chart are not counted.

### 1. Why there are islands (about 1:35)

The slides are in `00-title.html`, `00b-splash.html`, `01-islands.html`, and `01b-compression.html`. The islands and the tangle have no part label, because the drawing fills the slide. The compression chart and its variants carry "1, Why there are islands".

1. **Title.** 0:00. Running total 0:00.
2. **Splash: these are all GoFish programs.** 0:10, down from 0:15, because the hook now comes on the next slide. Running total 0:10.
   - "Hey everyone. These are all GoFish programs." Pointing at a few kinds is only if there is time.
   - Lead into the islands: "Many of these ideas started in other grammars, like Atom, Bluefish, and Canis. Here they are written in one language, and that is what this talk is about."
3. **Islands (the grammars picture), with the hook.** 0:35, up from 0:15. Running total 0:45.
   - The hook, close to the user's own words: "I'm sad. I'm sad because I love visualization grammars. Every time I see one presented, I'm in the audience like the sunglasses emoji. But when I go to use them, I can't figure out how to fit them into my workflow." Then the islands: the grammar of graphics is the big island in the middle, and the specialized grammars are the smaller islands around it. "They are all different systems. Some of them you can download, but they don't work with each other. We have the ggplot2 ecosystem, but I mostly work in JavaScript and Python, so it doesn't help me. And many grammars don't fit the grammar of graphics anyway." "There's also a practical problem. A lot of cool work, including mine, has no clear path into practice." "That's why I want to build a GUGOG. It would let me play with all these grammars. And maybe it would let end users make charts they have never seen before."
   - There is no text on the slide. The drawing fills it, and the tangle after it is an auto-animate pair that has to line up with it.
4. **The tangle.** 0:15. Running total 1:00. An auto-animate pair with slide 3, so only the arrows fade in.
   - This is what it looks like when they don't work with each other: to use them together or compare them, you have to translate between every pair.
   - Said with confidence: the grammars are hard to use together and to compare, and I have run into this a lot. Said as a suspicion: that the field is treading water a bit, and that this is the cause.
   - Only if there is time: "Some of us doubt that a shared kernel exists. I think one does, but it may not look quite like the grammar of graphics we are used to."
   - Lead into the compression chart: "Why are there so many islands?"
5. **A grammar is a compression.** 0:35, down from 0:50, because it no longer opens with why we unify at all. Running total 1:35.
   - Over the empty axes: the grammar of graphics is a compression. It compressed many chart types into marks, channels, scales, and coordinates, and that structure shaped ggplot2, Vega-Lite and Altair, and Tableau. So how well do today's approaches compress?
   - Then walk the chart, one design per click. The left panel is the usage curve, so it also says what the hidden usage curve slide said. seaborn has short specs but a huge language. d3 has a small language but long specs. The grammar of graphics is in the sweet spot for the common charts, then the expressivity cliff. Past the cliff, ggplot2 drifts toward new chart types and Vega-Lite toward explicit calculations. The notes stay generous to both systems. "Past the cliff, each island is someone getting past it on their own." Then the sweet spot.
   - The line on the slide is now "What if we compress the islands?" It was "What are the obstacles to doing this compression?"
   - The small line under the title stays: "To make a description shorter, you have to find the structure." Its source reads "Simon, 1962". It is on screen from the first build step. It now goes with the closing question, as the way to compress the islands. After the click, paraphrase Simon: most complex things are full of repetition, and we can use that to describe them simply, but only if we find the right representation. Which structure you find depends on the language you describe charts in, and a language with only nouns finds nouns. The backup notes, marked "If asked", hold Simon's quotes, Grünwald's statement of the minimum description length principle, the caveat that the shortest description can be opaque, Chaitin's one line, and the grokking example, which is not yet checked against its papers. See "References".
   - This Target is tight. Before 2026-11-04 the chart walk alone took about 0:35, and the Simon lines now share that time, so each click has to be said in its short form. Rehearse it.
   - Two comparison variants ("as rates", a ramp and a step) come right after this slide. They have Target 0:00 and are outside the timing. They carry the same line under the title and the same closing line.

Leads into part 2 with: "So let's do to the islands what the grammar of graphics did to chart types, and compress them into one language."

### 2. Compress the islands (about 0:55)

The slides are in `01c-compress-islands.html`. All four carry "2, Compress the islands".

6. **One language that holds all of them (the circle).** 0:20. Running total 1:55. New on 2026-11-05.
   - The user's drawing (`images/opening/grammars-circle.svg`, added 2026-11-05): the islands inside one circle labeled GUGOG.
   - The bridge, in the notes: "What if one language held all of these? You could do this without unifying anything: one package that bundles every grammar as a separate component. That would fix installing them. It would not let you mix them. Each island's ideas would still only work inside that island, so you could not use Atom's unit layout inside a PiCCL picture, or put a GoTree layout inside a chart. Mixing needs something the islands have in common. So is there anything in common? Look at what each island added."
   - The notes also say that building a separate grammar was the right move for each team, so the bridge does not blame anyone.
7. **Atom adds operators for arranging units.** 0:15. Running total 2:10.
   - Atom's marks are plain circles and rectangles. What it added is a small set of layout operators, like FillX and MaxFill, that split a space into cells and arrange the units inside them.
8. **PiCCL adds operators for combining pictures.** 0:10. Running total 2:20.
   - PiCCL's marks are ordinary pictures and shapes. What it added is a set of operators for repeating pictures and combining them, e.g., "A atop B".
   - Lead into GoTree: "And one more, for a different shape of data."
9. **GoTree adds operators for laying out trees.** 0:10. Running total 2:30. New on 2026-11-05.
   - The defense deck's GoTree figures: the paper's gallery of tree layouts and its layout operator figure. GoTree's marks are plain nodes and links. What it added is a set of layout operators: on each axis a parent and its children are placed by include, juxtapose, or within, and siblings are aligned or flattened.
   - Source line: "GoTree: A Grammar of Tree Visualizations (Li, Tian, Xu, McGuffin & Yuan, ACM CHI 2020)", as in the GUGOG paper's bibliography.
   - Atom, PiCCL, and GoTree are the evidence for the verbs slide. All credit for their ideas goes to their authors.

Leads into part 3 with: "So none of these three islands mainly added a new kind of mark or channel. Each one added new ways to arrange and combine things. I think most of the other islands are like this too. They add ways to arrange, combine, repeat, or connect marks."

### 3. The grammar of graphics needs verbs (about 1:30)

The slides are in `02-verbs.html`, `03-gofish-intro.html`, and `03b-code-comparisons.html`.

10. **Data, marks, channels, coordinates.** 0:15. Running total 2:45.
    - Say: "They all added verbs. A verb takes graphics and composes them into bigger graphics. The grammar of graphics has a rich set of nouns: data, marks, channels, and coordinates." Then the click: "A rich set of nouns, but almost no verbs."
    - Say: "In the traditional grammar of graphics, the only way to grow the language is to add a new primitive. That is what happens past the cliff. So the grammar of graphics needs verbs."
    - Backup for questions: past the cliff, most ggplot2 extensions add new arrangements, and Vega-Lite's explicit calculations mostly compute positions, so what breaks at the cliff is arrangement. Both systems chose a small, fixed set of nouns on purpose, and that is why the common charts are so short.
    - One optional sentence: "I come from programming languages, and the first thing I look for in a language is its verbs."
    - Lead: "That is what GoFish does."
11. **What is GoFish?** 0:10. Running total 2:55. New on 2026-11-05.
    - Modeled on the defense deck's "What Is GoFish?" slide. The line on the slide is "GoFish extends the grammar of graphics with verbs." Under it is the defense deck's own line: "MIT-licensed and open source, for JavaScript and Python, at gofish.graphics".
    - It is its own slide, not a second click on the verbs slide, because the verbs slide's grid leaves no room for a second line at 1280x720.
12. **Crash course, two steps, chart API only.** 0:20 in all (0:10 each). Running totals 3:05, 3:15.
    - Stacked bars, then one added line, `ribbon`, makes the ribbon chart. The code is on the left and the live render on the right, with `data-magic-move` on the code. The first step says the second half of the thesis once.
    - Until 2026-11-05 it had three steps, with the planets diagram as a left column. Without that column, the old second step was the same as the first on the chart side, so it was dropped.
    - Lead: "These verbs are not magic. Underneath them is something smaller and more direct."
13. **Under the chart API is a smaller, more direct core.** 0:20. Running total 3:35. New on 2026-11-05.
    - The planets diagram and its code: `enclose`, `spread`, `layer`, `.relate` with `Constraint.align` and `Constraint.distribute`, and an `arrow`. The chart API is built on this core, where marks are placed by explicit relations like align and distribute. One slide, no animation.
    - Lead into the Atom comparison: "Now let's go back to the islands from before and write them with these verbs. First Atom."
14. **Atom's gridxy is GoFish's spread.** 0:10. Running total 3:45.
15. **The PiCCL bottle chart in GoFish.** 0:15. Running total 4:00.
    - These are the same pictures from part 2, written with one shared set of verbs. The same `spread` does the work of Atom's `gridxy` and of PiCCL's repeating.
    - New on 2026-11-05: a callout. The spec's low-level lines, `layer` and the `.relate(...)` block with `Constraint.align` and `Constraint.distribute`, are tinted blue and tagged "core" in the gutter, and a tag under the code says "the core from two slides ago". Say: "The chart API and the core mix in one spec, because they are one language."

Leads into part 4a with: "So these two islands reduce to a few shared verbs. That is why I say the grammar of graphics needs verbs. There are two fair concerns about this idea, and I want to take both of them seriously. The first one is Andrew McNutt's."

### 4a. Does one language cost domain design? (about 1:00, including the bridge line)

The slides are in `04a-domain-design.html`.

16. **McNutt quote.** 0:15. Running total 4:15.
    - The first objection, in its strongest form and credited: no single DSL can capture every task without compromising its domain design.
    - Say: "With verbs, a new word is a function that composes existing verbs, so a DSL is a library built inside the language. Each domain keeps its own design, and it is still one language." His suggestion of small modular language components is the direction GoFish takes, and his compile towers are his own answer to drift.
17. **A language that grows is a hierarchy.** 0:10. Running total 4:25.
    - The answer to the first objection. Its left half, one flat layer of nouns, calls back to the compression chart's grammar of graphics line and its cliff.
    - The bottom row, "core: marks + verbs", is the core the audience saw on the core slide and in the bottle spec. The chart API is one surface on it, and DSLs like GoTree are others.
    - State the full thesis.
18. **Same core, three shapes of data.** 0:20 (was 0:15). Running total 4:45.
    - Its notes now introduce GoTree in GoFish on their own, because the GoTree code slides are hidden: GoTree's input is a tree, not a table, so it was rebuilt as a small library on GoFish that keeps GoTree's own words, and its rules turn into the same align and distribute relations as the core. They point back to the GoTree intro in part 2. The left column's label is now "core", not "low-level".
19. **The surfaces work together (Figure 6).** 0:10, plus about 0:05 for the bridge line. Running total 5:00.
    - Slides 18 and 19 are evidence for the answer to the first objection.
    - The bridge, crediting Jason Brunson's GUGOG paper, "Balancing constriction and expansion for domain-specific grammars": "Jason's paper argues that each domain needs a dialect, with its own objects and its own constraints on how they combine. GoTree is a dialect in that sense, with its own objects. His second half, the constraints, is where the objection comes in. The more you let people extend the language, the more it seems you give up safety."

Hidden since 2026-11-05: "GoTree, a grammar for trees" (the data and the picture, 0:15 if shown), the GoTree and gofish-gotree specs (0:20), and "`combine` compiles to GoFish constraints" (0:20). The user cut them for now. To restore them, remove `data-visibility="hidden"` from all three and add their 0:55 back into the running totals.

### 4b. Does growth cost safety? (about 0:55)

The slides are in `04b-validity.html`. Only their notes changed. The structure, data-ids, auto-animate attributes, delays, and `data-magic-move` of the CanSum steps are unchanged.

20. **Huang and Kay quote.** 0:15. Running total 5:15.
    - The second objection, in their own words, credited. Their work showed me that validity is important.
21. **CanSum, four steps.** 0:40 in all (0:10, 0:10, 0:05, 0:15). Running totals 5:25, 5:35, 5:40, 5:55.
    - No schema, then the schema is added, then the error, then USD stacks. It constrains specs, not pictures. The limits: one operator and one property, and interactivity is not covered.

Leads into part 5 with: "So growth does not have to cost safety. But the growth itself has a limit, and that is where I want to end."

### 5. The next cliff (about 1:05)

The slides are in `04c-next-cliff.html` and `05-panel.html`. Both carry the label "5, The next cliff".

22. **Where we are now.** 0:25. Running total 6:20.
    - "We replaced a typology of charts with a grammar. But our verbs are themselves a typology of operators, and that is the next cliff." Then the existing script: when you need a layout that is not in the set, today you add it from outside the language, which is the same add-a-new-primitive move the grammar of graphics makes past its cliff. So we have to compress again. "I think the way past it is a layout or constraint language that is more expressive than what we have now. That is the question I would most like help with."
23. **Questions for the panel.** 0:40. Running total 7:00.

## Time

| Part | Target |
| --- | --- |
| 1. Why there are islands | 1:35 |
| 2. Compress the islands | 0:55 |
| 3. The grammar of graphics needs verbs | 1:30 |
| 4a. Does one language cost domain design? (with the bridge line) | 1:00 |
| 4b. Does growth cost safety? | 0:55 |
| 5. The next cliff (with the panel) | 1:05 |
| Total | 7:00 |

The fifth version ran 7:35. Hiding the usage curve (0:20), the flat layer slide (0:20), and the Steele quote (0:15) saves 0:55. The compression chart grew by 0:15 and the verbs slide by 0:05, so the deck now runs 7:00, on budget. Moving the Atom and PiCCL intros into part 2 is time neutral, because the Atom intro grew by 0:05 and the verbs slide shrank by 0:05.

The new hook on 2026-11-04 is also time neutral. The islands slide grew by 0:20 for the hook. The splash shrank by 0:05 and the compression chart by 0:15, because it no longer opens with why we unify at all.

The restructure on 2026-11-05 is also time neutral. Added: the circle slide (0:20), the GoTree intro (0:10), "What is GoFish?" (0:10), the core slide (0:20), and 0:05 on "same core, three shapes of data", which now introduces GoTree on its own, for 1:05 in all. Saved: the three hidden GoTree code slides (0:55) and one crash course step (0:10), for 1:05 in all. The running totals from the Huang and Kay quote on are unchanged.

If it runs long, cut these first:

- Cut the "What is GoFish?" slide and say its line on the verbs slide, which saves about 0:10.
- Say the circle slide's bridge in its short form ("One package that bundles them all would not let you mix them. Mixing needs something in common."), which saves about 0:10.
- Trim the spoken notes on the McNutt quote to the accent phrase and the last sentence, which saves about 0:05.

## Changes to the deck

- New order (since 2026-11-05): title, splash, islands, tangle, compression chart (and its two variants), the circle, Atom intro, PiCCL intro, GoTree intro, verbs slide, What is GoFish?, crash course (two steps), the core slide, Atom comparison, bottle, McNutt, hierarchy, same core three shapes of data, Figure 6, Huang and Kay, CanSum 1 to 4, where we are now, panel. The three GoTree code slides are hidden.
- 2026-11-05: new slides. The circle slide and the GoTree intro are in `01c-compress-islands.html`. "What is GoFish?" and the core slide are in `03-gofish-intro.html`, around the crash course. The GoTree figures were copied from the defense deck into `images/comparisons/gotree-examples.png` and `images/comparisons/gotree-operators.png`.
- 2026-11-05: the crash course is the chart API only, two steps. Its code is on the left and the render on the right, both larger. The header row lost its data-id, because the logo inside it is matched by its src, and nothing inside a matched element may be matched on its own. The code column is pinned to the top so it does not move when the second step adds a line.
- 2026-11-05: the bottle slide's callout is a code region with the role "core" (talk-template's `data-code-regions`, colored in `gofish-compare.css`) and a tag under the code.
- Order before 2026-11-05 (since 2026-11-04): title, splash, islands, tangle, compression chart (and its two variants), Atom intro, PiCCL intro, verbs slide, crash course, Atom comparison, bottle, McNutt, hierarchy, the four GoTree slides, Figure 6, Huang and Kay, CanSum 1 to 4, where we are now, panel.
- Moved slides:
  - The islands and tangle move from before the compression chart to after it, into their own file, `01b-islands.html`.
  - McNutt now opens part 4a, as the first objection.
  - 2026-11-04: the islands and tangle move back to before the compression chart, so the hook comes first and the chart explains it. The Atom and PiCCL intros stay after the chart, so they move out of the islands file into their own file, `01c-compress-islands.html`, with the link to `gofish-compare.css` at its top.
  - 2026-11-03, later the same day: the Atom and PiCCL intros move from `03b-code-comparisons.html` to the end of `01b-islands.html`, before the verbs slide, under "2, Past the cliff". Their titles now say what each grammar added: "Atom adds operators for arranging units" and "PiCCL adds operators for combining pictures". They are short so each fits on one line, and the notes say the longer versions. The source lines keep the papers' full titles and authors. The link to `gofish-compare.css` moves to the top of `01b-islands.html`, before the first slide that uses it. The thesis defense deck put the nouns slide before its islands, as their cause, and its hidden "Limitations of Marks/Channels Lead to New Grammars with New Compositional Rules" slide showed Atom's operator figure. This talk uses the same figures and the GUGOG paper's wording ("verbs for arranging, compositing, repeating, or otherwise relating marks"), but shows the operators first and names the pattern after.
- Hidden slides, each with `data-visibility="hidden"` and a comment saying why:
  - 2026-11-05: the three GoTree code slides in 4a (the data and the picture, the specs, and "`combine` compiles to GoFish constraints"). The user cut them for now.
  - The usage curve. The compression chart's left panel covers it.
  - "The grammar of graphics is one flat layer of nouns". The compression chart's grammar of graphics line and its cliff make its point, and the verbs slide states the first half of the thesis.
  - The Steele quote. Part 4 is now two objections, not a big language against a small one.
  - "From I to we" and the Haskell aside stay hidden.
- Renamed files: `04a-big-or-small.html` is now `04a-domain-design.html`. On 2026-11-04, `01b-islands.html` became `01-islands.html` (the islands and the tangle only), and `01-compression.html` became `01b-compression.html`, so the file order matches the talk order. The Atom and PiCCL intros are in the new file `01c-compress-islands.html`.
- New part labels: "1, Why there are islands" (shown on the compression chart and its variants, and not on the islands drawing, which fills the slide), "2, Compress the islands" (shown on the Atom and PiCCL intros), "3, The grammar of graphics needs verbs", "4a, Does one language cost domain design?", "4b, Does growth cost safety?", "5, The next cliff". The crash course still has no label.
- Rewritten notes and lead lines at every part boundary, as written above.
- Slide text is unchanged, apart from the part labels, the titles of the Atom and PiCCL intros, and, on 2026-11-04, the compression chart's closing line.

## Open choices

- Resolved on 2026-11-04: the compression chart's on-slide line is now "What if we compress the islands?"
- The circle slide comes right after the compression chart, not right after the tangle as the user first said, because the chart's closing line, "What if we compress the islands?", is the question the circle answers, and the tangle's lead, "Why are there so many islands?", still works into the chart. Putting it right after the tangle is a one-slide move from `01c-compress-islands.html` to the end of `01-islands.html`; its lead line would then need to change.
- "What is GoFish?" is its own short slide. If time is short it can go, and its line can be said over the verbs slide.
- The hook has no text on the islands slide. A small line such as "I love visualization grammars. I can't use them together." could go on it, but the drawing would have to shrink on both slides of the auto-animate pair.
- The panel slide carries "5, The next cliff", because its first question is the next cliff. It could instead go back to its own label, such as "6, Questions for the panel".
- "1, Why there are islands" shows on the compression chart but not on the islands drawing. A small label could go on the drawing if the audience needs it.
- The Steele quote could come back as the opening of part 5, where "a language that can grow" meets the next cliff.

## References

Added 2026-11-04 for the claim that compression begets structure, on the compression chart and in its notes. Later the same day the spoken Simon lines moved to the end of the compression chart's notes, after "What if we compress the islands?", and the line under the title stayed where it was. The quotes were checked against the sources.

- Herbert A. Simon, "The Architecture of Complexity," Proceedings of the American Philosophical Society 106(6), 1962.
  - p. 481, in the summary section "The description of complexity": "How complex or simple a structure is depends critically upon the way in which we describe it. Most of the complex structures found in the world are enormously redundant, and we can use this redundancy to simplify their description. But to use it, to achieve the simplification, we must find the right representation." This is the source of the line on the slide and of the spoken paraphrase.
  - p. 478: "The hierarchic structures we have been discussing have a high degree of redundancy, hence can often be described in economical terms." And the first form of that redundancy: "Hierarchic systems are usually composed of only a few different kinds of subsystems, in various combinations and arrangements." This backs the hierarchy slide in 4a.
  - p. 477: "If there are important systems in the world that are complex without being hierarchic, they may to a considerable extent escape our observation and our understanding."
- Peter Grünwald, "A Tutorial Introduction to the Minimum Description Length Principle," 2004, arXiv math/0406077, section 1.1: "any regularity in the data can be used to compress the data, i.e. to describe it using fewer symbols than the number of symbols needed to describe the data literally. The more regularities there are, the more the data can be compressed. Equating 'learning' with 'finding regularity', we can therefore say that the more we are able to compress the data, the more we have learned about the data." Backup only.
- Gregory Chaitin, "On the intelligibility of the universe and the notions of simplicity, complexity and irreducibility," 2002, arXiv math/0210035, abstract: "comprehension is compression, i.e., explaining many facts using few theoretical assumptions". Backup only, as a short line.
- Grokking (Power et al. 2022; Nanda et al. 2023) is in the backup notes as an example, but it is not yet checked against the papers. Verify it before saying it.
- GoTree, added 2026-11-05 for the GoTree intro: Guozheng Li, Min Tian, Qinmei Xu, Michael J. McGuffin, and Xiaoru Yuan, "GoTree: A Grammar of Tree Visualizations," Proc. CHI 2020, doi 10.1145/3313831.3376297. The title and authors are from the GUGOG paper's bibliography (`gugog-2026-camera-ready-v3/refs.bib`, key `gotree`). The figures are the paper's, by way of the thesis defense deck.
