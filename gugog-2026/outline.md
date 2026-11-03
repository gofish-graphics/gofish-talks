# The Grammar of Graphics Needs Verbs: Towards a GUGOG

Revised outline, 2026-11-03, fifth version. Short talk, 7:00 budget, at the GUGOG workshop at IEEE VIS 2026.

## The story in one paragraph

The talk opens on a wall of GoFish charts, so the audience has something concrete to hold on to. Charts follow a long tail. The grammar of graphics covers the common charts, and one of its big ideas was to write many chart types in one shared language. That shared language let us ask questions about the structure of charts, such as questions about marks and channels, and not only about chart types. For the long tail, we built many new grammars instead. Each one is its own language, so they are hard to compare, and comparing them means translating between every pair. I suspect this makes it harder to ask new research questions about the long tail, but I am not sure that it is the cause. Some of us doubt that a shared kernel exists under these languages. I think one does, but it may not look quite like the grammar of graphics we are used to. A visualization language is a compression of the charts people want to make. Chart typologies like seaborn give short specs for common charts but need a new function for every unusual chart. Low-level toolkits like d3 have a small vocabulary but long specs for every chart. The question for the talk is what stands in the way of doing this compression well. The grammar of graphics sits in the middle as one flat layer of fixed nouns. A fixed set of nouns gives a finite number of combinations, so the only way to grow the language is to add a new primitive, and the core keeps growing. In a language with verbs, you can build new structures from old ones instead. GoFish adds verbs, and with them it can write other grammars' ideas in one language. A unified grammar like this still seems to face one central tradeoff, the one from the opening chart: a big language that supports many charts, or a small language that is very verbose. Steele's answer is a language that can grow. The middle path is a hierarchy of abstractions. McNutt's small modular language components are its parts, but many small languages risk falling apart into separate languages, which is the tangle from the opening. Extensibility is what keeps them together. With verbs, the language grows as a hierarchy, with a small core and new levels built from old ones from inside the language, and the middle level stays open. GoTree, rebuilt as a GoFish library, is one part of that hierarchy. It happens to be a language for tree data. The objection is that this much extensibility and expressiveness seems to cost safety. CanAdd is evidence that a small type system can bring safety back. GoFish can grow charts from within, but its verbs are themselves a typology, a typology of operators. When you need a layout that is not in the set, you hit the next cliff, and today you add it from outside the language, which is the same move as adding a new primitive. I think the way past it is a layout or constraint language that is more expressive than what we have now. That is the first question for the panel, and it is part of a bigger one: what composition mechanisms belong at the core of a truly universal, extensible grammar of graphics?

## The thesis

In the traditional grammar of graphics, the only way to grow the language is to add a new primitive. In a language with verbs, you can build new structures from old ones, using a fairly stable set of composition mechanisms.

## How the parts connect

- Part 1 opens on concrete charts. The usage curve and the two grammars pictures then make the opening argument. The grammar of graphics gave the common charts one shared language, while the long tail has many grammars that are hard to compare. Part 1 ends by asking whether a shared kernel exists, and I say that I think one does, though it may not look like the grammar of graphics. It then sets up compression as the yardstick for the whole talk. It ends with the question for the talk: "What are the obstacles to doing this compression?"
- Part 2 names the first obstacle in the grammar of graphics, and it begins the answer to how the kernel differs from the grammar of graphics we are used to. It has nouns but almost no verbs, so it is one flat layer, and the only way to grow it is to add a new primitive. The thesis is stated here briefly, in one or two sentences, and not argued.
- Part 3, "Grammars in one language", shows verbs working, first inside GoFish and then across other grammars written in GoFish. It does not mention the hierarchy, which is first shown in 4a.
- Part 4 takes on one central tradeoff and one objection. 4a states the tradeoff from the compression chart directly, a big language or a small one, with Steele's quote. McNutt's quote names the parts of the middle path. The hierarchy slide comes back to the flat layer from part 2, shows extensibility holding the parts together as one language, and states the full thesis. GoTree is the evidence, as one part of the hierarchy. A spoken line crediting Jason Brunson ends 4a and raises the objection. 4b answers it: growth seems to cost safety, and a small type system brings it back. 4c admits what is still missing: the verbs are a typology of operators, and that is the next cliff. The way past it is likely a layout language more expressive than a fixed set of operators.
- Part 5 hands the open questions to the panel.

So the thesis is mentioned briefly at the beginning and argued at the end. The hierarchy slide opens with an explicit callback: "Earlier I asked whether we keep adding nouns forever."

Each part ends with one line that leads into the next. Those lines are written below.

## Slides

Times are targets. "Existing" means the slide is already in the deck. "New" means it needs to be built. "Moved" means it exists but goes in a new place.

### 1. Opening: compression is the yardstick (about 1:40)

1. **Title.** Existing. 0:00.
2. **Splash: these are all GoFish programs.** Existing, moved to the start. 0:15.
   - The talk opens on concrete charts, so the audience has something to hold on to before the abstract slides.
   - Some of these charts come back later as the leaves of the flat layer and hierarchy pictures.
3. **The usage curve.** Moved from section 5, and moved before the grammars pictures. 0:20.
   - How often a chart is made, against how complex it is. Bar, line, and scatter are on the left. One-lab infographics and diagrams are on the right.
   - The grammar of graphics covers the common charts on the left. The long tail on the right is where people have built new grammars.
   - Name the two ends. Chart typologies like seaborn are on one end, and low-level toolkits like d3 are on the other.
4. **The grammars picture.** New, picture only. 0:15.
   - A hand drawing with GoG in a big circle in the middle and newer grammars around it: Atom, PiCCL, AnnoGram, Gemini, Mascot, Gosling, Neo, GenomeSpy, GoTree, and Canis.
   - Said with confidence: the grammar of graphics put many chart types in one shared language, and that let us ask questions about the structure of charts, such as marks and channels, and not only about chart types. Draco and CompassQL are one example, because they reason about Vega-Lite specs in terms of marks and encodings.
   - For the long tail, we built many new grammars instead, and each one is its own language.
5. **The tangle.** New, picture only. 0:15.
   - The same drawing with double-headed arrows between almost every pair. It is a Reveal auto-animate pair with slide 4, so the circles stay still and only the arrows fade in.
   - Said with confidence: comparing these grammars means translating between every pair of languages, and I have run into this a lot.
   - Said as a suspicion: I suspect this makes it harder to ask new research questions about the long tail, and that we are treading water a bit, but I am not sure that is the cause.
   - "Some of us doubt that a shared kernel exists. I think one does, but it may not look quite like the grammar of graphics we are used to." This leads into the compression bars, and later the flat layer slide and the hierarchy slide.
   - The kernel doubt is not attributed to anyone. McNutt's survey argues that no single DSL should cover every task, which is a different claim.
6. **A grammar is a compression.** Moved from section 5. 0:35 (was 0:25; the extra step needs the time). The old title was "a good grammar is a good compression"; the new one does not suggest that the other designs are bad grammars.
   - A schematic chart in three panels side by side: a small copy of the usage curve ("how often it gets made"), then two line charts, "size of the language" and "length of each spec". All three share the usage curve's x axis, from simple common charts on the left to complex tail charts on the right. The usage panel is there to show that most charts made are the simple ones, so the cost on the left counts most.
   - The lines come in one design at a time, each adding its line to both panels. First, only the usage curve and empty axes. Then a chart typology like seaborn, with one function per chart type: specs stay short, but its language climbs with every tail chart. Then a low-level toolkit like d3: a tiny, flat language, but specs are long even for the common charts and climb fast.
   - Then the grammar of graphics, in purple. It is excellent for the common charts, which are most of what people make: a small language whose parts combine well, and short specs, close to the sweet spot. A light dotted line marks the "expressivity cliff" (the GoFish paper's term) in all three panels, just past the head of the usage curve. Past it, for charts like ribbon, waffle, and mosaic charts, the usual code drifts toward one end or the other, so the line turns dashed and bends up gradually without reaching either end. In ggplot2 the usual move is a new chart type (ggalluvial, ggmosaic, ggwaffle), so the language bends toward seaborn ("ggplot2: new chart types"). In Vega-Lite the usual move is explicit layout transforms, as in its own wheat and wages and waterfall examples, so the specs bend toward d3 ("Vega-Lite: explicit calculations"). The boxplot mark is a case that goes the other way. The notes are generous to both systems, whose authors and users are in the room.
   - Then the sweet spot, in red: low in both panels across the whole range. Total cost is the size of the language plus the size of every spec written in it, weighted by how often each chart is made.
   - The slide ends with the question for the talk, shown as a line after a click: "What are the obstacles to doing this compression?"

Leads into part 2 with: "Let's start with the usual answer for the middle, the grammar of graphics."

The Haskell aside is cut from this version. It can come back if there is time.

The "from I to we" slide is hidden with `data-visibility="hidden"`, because the two grammars pictures carry its point. Its line "each vis grammar teaches me something, but the lessons stay stuck in separate systems" moved into the notes for the tangle.

### 2. The grammar of graphics needs verbs (about 0:35)

The thesis is stated here briefly and is not argued. The full argument comes at the end, on the hierarchy slide.

7. **Data, marks, channels, coordinates.** Existing, from the thesis deck, shortened. 0:15.
   - The grammar of graphics is the usual answer for the middle. It has a rich set of nouns but almost no verbs.
   - All four columns show at once. The closing line is the only click.
8. **The grammar of graphics is one flat layer of nouns.** New. 0:20.
   - Drawn as an icicle with two rows. The same specific charts as the hierarchy slide sit side by side on top, directly on one continuous flat row of nouns. The row holds a few of the grammar's categories as labels: marks, encoding channels, coordinate transforms, and a faded slot for the rest. Every chart uses all of them, so it is one row under all the charts, not one segment per chart.
   - Every chart is written directly against the same fixed nouns, and there is no way to define new words from old ones.
   - One click adds a chart outside the combinations, the croissant chart from the splash, which joins the top row in a wider tile because the chart is wide. The flat row grows to the right under it by "+ new geom" and "+ new coordinate system". The line "A fixed set of nouns gives a finite number of combinations. Do we keep adding nouns forever?" appears.
   - Say the first half of the thesis: "In the traditional grammar of graphics, the only way to grow the language is to add a new primitive." Then set up the second half by asking what it would take to build new structures from old ones.

Leads into part 3 with the crash course, which states the second half of the thesis when GoFish's verbs are introduced.

### 3. Grammars in one language (about 1:15)

9. **Crash course, three steps.** Existing. 0:30 in total.
   - GoFish's verbs are introduced here. Say the second half of the thesis once, plainly: "In a language with verbs, you can build new structures from old ones, using a fairly stable set of composition mechanisms."
   - Two API surfaces of GoFish side by side. The planets use the low-level core of marks and relations. The stacked bars use the chart level with short specs.
   - Add a label and an arrow to the planets. Then add a ribbon to the bars.
   - Say that these are two surfaces on one core.
10. **Atom: a grammar for unit visualizations.** New, pictures only. 0:10.
    - Two figures from the Atom paper with short labels: its Titanic unit charts and its layout operators (Map2D, FillX, FillY, MaxFill, Pack). This is Atom's own idea, shown before the GoFish version. The layout is the thesis deck's Atom intro slide.
11. **Atom's gridxy is GoFish's spread.** Existing. 0:10, trimmed from 0:20 because the slide before it now introduces Atom.
    - The notes point back to the Atom slide, so the GoFish code reads as the same ideas in GoFish.
12. **PiCCL: a grammar for pictorial charts.** New, pictures only. 0:10.
    - Two figures from the PiCCL paper with short labels: its pictorial chart examples and its compositing operators. The layout is the thesis deck's PiCCL intro slide.
13. **The PiCCL bottle chart in GoFish.** Changed. 0:15, trimmed from 0:25 because the slide before it now introduces PiCCL.
    - The PiCCL bottle chart beside one idiomatic GoFish spec, with styling left out as `...`. The PiCCL spec is gone, because there is no time to explain two specs. The layout is the one from the thesis deck's bottle slide, with the code on the left and the chart on the right.
    - PiCCL's idea, shown on the slide before, is that the bottle chart is built from parts. In GoFish the same parts are a few verbs and marks: `spread`, `paint`, `layer`, and `relate`.
    - Atom and PiCCL can be written in one language. Written that way, they share most of their structure, and the differences are small parts you can point to.

Leads into part 4 with: "So unifying grammars compresses them. But one tradeoff seems to stand in the way, and it is the one from the opening chart: a big language or a small one."

### 4. One tradeoff and one objection (about 3:25)

Part 4 has one central tradeoff and one objection to the answer. Many surfaces against one language and a small language against a big one are the same argument, so they are one section, 4a. The tradeoff is the one from the opening chart: a big language that covers many charts, or a small language with long specs. The answer is a language that grows as a hierarchy, held together by extensibility. The objection is that this much extensibility and expressiveness seems to cost safety, and the answer to it is a small type system. Each position is presented in its strongest form, with credit, before the evidence. What is still missing is admitted as open in 4c. There is no overview slide, because the section labels carry the structure.

#### 4a. A big language or a small one (about 2:05, including the bridge line to 4b)

The tradeoff from part 1, said directly. Steele's answer is a language that can grow. The middle path is a hierarchy of abstractions, McNutt's small modular language components are its parts, and extensibility is what keeps those parts one language. GoTree is the evidence: one branch of the tree, shown from its data down to the core. The slides are in `04a-big-or-small.html`.

14. **Steele quote.** Existing, moved from the old 4c. 0:15.
    - "I should not design a small language, and I should not design a large one. I need to design a language that can grow." Steele, Growing a Language, 1998. This is the wording in the v3 draft, main.typ line 166. It was checked against Steele's text and is verbatim.
    - This is the tradeoff from the opening chart. A big language like seaborn covers many charts with short specs but needs a new function for every new chart. A small language like d3 stays small, but every spec is long.
    - The middle path is a hierarchy of abstractions: a small core, with new levels built from the ones below it. The small core keeps the language small, and the levels give the big vocabulary that short specs need.
15. **McNutt quote.** Existing. 0:15.
    - "Small modular language components" is highlighted.
    - Credit him. Say that I agree no single surface should do everything, and that his suggestion of small modular parts is the direction GoFish takes. His components are the parts of the hierarchy.
    - The risk with many small languages is that they drift apart into separate languages, which is the tangle from the opening. This is said as a general concern, not as a flaw in his argument. His paper sees it too: it suggests designs that re-use as much of the earlier DSLs as possible, chained in compile towers.
16. **A language that grows is a hierarchy.** Existing, moved from the old 4c. 0:10.
    - Open with the callback: "Earlier I asked whether we keep adding nouns forever. Here is the answer."
    - It is called a hierarchy, not a tree, so that it is not confused with the tree data on the GoTree slides right after it.
    - Both sides are icicles: stacked rows of blocks, where each block spans exactly the blocks it supports. The left side is the same flat layer picture from part 2, drawn identically, with two rows. The right side has three rows: the same charts on top, intermediate words (chart, tree layout, diagram) in the middle, and a small core of marks and verbs at the bottom. Its caption is "a hierarchy: many DSLs, one language".
    - The middle blocks are domain languages, McNutt's small modular components. Extensibility is the mechanism that keeps the hierarchy together. Each new DSL is built from the same core with the same verbs, from inside the language, so the DSLs do not fall apart into separate languages. Each subdomain can have a custom language, and the whole is still one language.
    - The leaves are specific charts the audience has already seen. The population pyramid, GoTree silhouette tree, Sankey tree, and Bluefish pulley diagram are on the splash. The ribbon chart is from the crash course.
    - A faded fourth middle block with "..." and a faded "..." leaf show that the middle level is open, not a closed set of three kinds. New DSLs can keep being added.
    - The line under the picture is "Build new structures from old ones with a small, stable set of verbs."
    - State the full thesis as the payoff.
    - If asked about "optimal" compression, the honest claim is that nested rules compress better than one flat layer. Grammar-based compression algorithms such as Sequitur work by building nested rules.
    - The next slides show one of those DSLs, GoTree, which happens to be for tree data.
    - Leads into GoTree with: "Here is one part of that hierarchy, up close. It happens to be a language for tree data."
17. **GoTree, the data and the picture.** Existing. 0:15.
    - Nested data, so it is not obvious where chart(data).flow(...) goes. This is why a DSL for tree data is needed.
18. **GoTree and gofish-gotree specs.** Existing. 0:20.
    - The DSL keeps its own words, and they are built from the core's verbs. This is one instance of McNutt's modular approach, credited to him.
19. **combine compiles to GoFish constraints.** Existing. 0:20.
    - The DSL reaches all the way down to the core, so it is not a separate language. This is McNutt's compile tower, with GoFish as one floor of it.
20. **Same core, three shapes of data.** Existing. 0:15.
    - Low-level, tabular, and hierarchical surfaces on one core. GoTree keeps its own design and is one more part of the hierarchy, which is McNutt's compile tower.
21. **The surfaces work together.** Existing, picture only. 0:10.
    - Figure 6 from the paper, the tree of bottle waffles. It uses all three surfaces in one graphic, which is the hierarchy holding together.

Ends 4a and leads into 4b with a line that credits Jason Brunson's GUGOG paper, "Balancing constriction and expansion for domain-specific grammars": "Jason's paper argues that each domain needs a dialect, with its own objects and its own constraints on how they combine. GoTree is a dialect in that sense, with its own objects. His second half, the constraints, is where the objection comes in. The more you let people extend the language, the more it seems you give up safety." This adds about 0:05 and needs no new slide.

Keep the reference to Jason at this high level. The details of his geometric data analysis case are not needed in the talk.

#### 4b. Does growth cost safety? (about 0:55)

The objection to 4a's answer: this much extensibility and expressiveness seems to cost safety. A type system brings it back. The slides are in `04b-validity.html`, and only their part label, lead-in, and notes changed.

22. **Huang and Kay quote.** Existing. 0:15.
    - Their section 6.4 question, with "which of these trade-offs are principled and which are merely incidental" highlighted.
    - Lead in with the objection: if anyone can grow the language, it seems the language can no longer check that a picture means something. Cynthia and Matt state the general version of this tradeoff.
    - Credit them for showing me that validity is important.
23. **CanAdd.** Existing, four auto-animate steps of one spec, with one change per click. 0:40 in all (0:10, 0:10, 0:05, 0:15).
    - One dataset has a temperature column and a USD column, and a few of its rows show on every step.
    - Step 1 has no schema and stacks the temperatures. GoFish draws it, because without a schema it does not check anything. You can start untyped and add types later.
    - Step 2 adds a schema with °C and summable USD. Only the code changes, and the untyped chart stays, because nothing has been run again yet.
    - Step 3 has the same code. Only the output changes: the same stack now gives GoFish's live error, which suggests the fix.
    - Step 4 stacks USD in place of temperature, and it passes. The code changes first, and then the output.
    - It constrains specs, not pictures. Every picture is still reachable.
    - State my view plainly. I think growth does not have to cost safety: a type system brings it back, and the one that catches this error is small.
    - State the limits. It is one operator and one property, and interactivity is not covered.
    - For Q&A or the panel, not the slides. The same type information covers Jason's unit aspect ratio case. GoFish tracks at the type level whether two axes have the same type, and if they do, it uses the same scale for both by default.

Leads into 4c with: "So growth does not have to cost safety. But the growth itself has a limit, and that is where I want to end."

#### 4c. The next cliff (about 0:25)

Kept as its own short section, not folded into 4b. Its slide is about where growth from within stops, which follows from the hierarchy in 4a, not from safety in 4b, so a 4b label would misname it. The slide is in `04c-next-cliff.html`.

24. **Where we are now.** Existing, unchanged. 0:25. The "lambda calculus of layout" slide that used to follow it is cut, because it was too low level and repeated this slide.
    - Two columns. "so far": charts grow from within, marks reduce to simple primitives, and interfaces reduce to bounding boxes and boundary curves. "not yet", one line: "Our verbs are a typology of operators."
    - One line under the columns: "The next cliff: a layout language more expressive than a fixed set of operators." It reuses the words "typology" and "cliff" from part 1. Do not say "lambda calculus" on the slide.
    - Spoken: "We replaced a typology of charts with a grammar. But our verbs, like spread, stack, and relate, are themselves a typology, a typology of operators. When you need a layout that is not in the set, you hit the next cliff. Today you add it from outside the language, which is the same add-a-new-primitive move from part 2." Then: "I think the way past it is a layout or constraint language that is more expressive than what we have now. That is the question I would most like help with."
    - GoFish can grow from within at the chart level. GoTree and the chart templates are defined with the same verbs people use to build graphics.
    - For Q&A, not the slide: the limit ties to the word "fairly" in the thesis. The v3 draft points out the same problem for ggplot2, where extending it with ggproto means leaving the plot language for a package implementation interface.

Leads into part 5 with: "That is the question I would most like help with."

### 5. Questions for the panel (about 0:40)

25. **Questions for the panel.** Existing. 0:40.
    - How do we get past a typology of operators? This picks up the next cliff from the last slide. My guess is a layout or constraint language that is more expressive than what we have now, and getting past it is part of finding which composition mechanisms belong at the core of a GUGOG.
    - How do our grammars build on each other? Libraries on libraries are a form of compression.
    - Is there a concrete case where checking validity forces you to give up a picture you would want?
    - Could the usage curve become a benchmark, e.g., for AI-generated charts?

## Time

| Part | Target |
| --- | --- |
| 1. Opening: compression is the yardstick | 1:40 |
| 2. The grammar of graphics needs verbs | 0:35 |
| 3. Grammars in one language | 1:15 |
| 4. One tradeoff and one objection | 3:25 |
| 4a. A big language or a small one, including the bridge line | 2:05 |
| 4b. Does growth cost safety? | 0:55 |
| 4c. The next cliff | 0:25 |
| 5. Questions for the panel | 0:40 |
| Total | 7:35 |

In part 1, the grammars picture and the tangle take the 0:30 that "from I to we" had. The compression bars grew from 0:25 to 0:35, so part 1 is now 1:40. The running totals in the opening are 0:15 after the splash, 0:35 after the usage curve, 0:50 after the grammars picture, 1:05 after the tangle, and 1:40 after the compression bars.

Part 4 lost its old overview slide, which saves 0:10. Merging the old 4a and 4c moves slides but changes no slide's target. The running totals in every section file now agree, and all of them end at 7:35. Part 4 starts at 3:30, and its running totals are 3:45 after Steele, 4:00 after McNutt, 4:10 after the tree, 4:25, 4:45, 5:05, and 5:20 after the four GoTree slides, 5:35 after Figure 6 and the bridge line, 5:50 after Huang and Kay, 6:00, 6:10, 6:15, and 6:30 after the four CanAdd steps, and 6:55 after "where we are now". The panel ends at 7:35.

The deck used to run 9:20. Most of the savings come from these changes:

- The Haskell aside is cut.
- The verbs slide drops from 1:30 to 0:15.
- Section 5 drops from five slides to two.
- CanAdd drops from 0:55 to 0:40.

To reach 7:00, the first candidates are these:

- Show the GoTree data and specs on one slide, which saves about 0:15.
- Skip the "same core, three shapes of data" recap, because Figure 6 makes the same point, which saves 0:15.
- Trim the spoken notes on the McNutt quote to the accent phrase and the last sentence, which saves about 0:05.

The Steele quote can no longer move onto the "where we are now" slide, because it now opens part 4 and states its central tradeoff.

## Changes to the deck

- New slides:
  - The grammars picture and the tangle, in part 1. They are an auto-animate pair, and they replace "from I to we" with the same 0:30.
  - "The grammar of graphics is one flat layer of nouns", in part 2.
  - "A language that grows is a hierarchy", in 4a. Its left side is the same picture as the flat layer slide.
  - "The surfaces work together", with Figure 6 from the paper.
  - The Steele quote.
- Moved slides:
  - The splash moves to right after the title.
  - The usage curve and the compression bars move to part 1. The usage curve now comes before the grammars pictures.
  - The old 4a (many surfaces) and the old 4c (small against big) merge into one section, 4a, a big language or a small one. Its order is the Steele quote, the McNutt quote, the hierarchy slide, and then the GoTree slides as evidence. The files are now `04a-big-or-small.html`, `04b-validity.html`, and `04c-next-cliff.html`.
  - The bridge line crediting Jason Brunson now ends 4a and raises the objection that 4b answers.
  - "Where we are now" becomes its own short section, 4c, the next cliff.
- Shortened slides:
  - The verbs slide, with all columns at once.
  - CanAdd, by trimming the spoken notes.
- Merged slides: "where we are now" and "evidence so far".
- Hidden slides:
  - "From I to we". Its point is now made by the grammars pictures.
- Removed slides:
  - The Haskell aside.
  - The optional part 4 overview slide. The section labels carry the structure, and no new overview slide replaces it.
  - The hidden backup version of section 5, which this version no longer needs.
- New section titles:
  - "Compression is the yardstick"
  - "The grammar of graphics needs verbs"
  - "Grammars in one language"
  - "One tradeoff and one objection" (part 4; no slide shows it, only the outline and the file comments)
  - "A big language or a small one" (4a)
  - "Does growth cost safety?" (4b)
  - "The next cliff" (4c)
- New lead lines at the end of each part, as written above.

## Open choices

- 4c is one slide. It could be folded into the end of 4b, but its point follows from the hierarchy in 4a, not from safety, so it is kept as its own section for now.
