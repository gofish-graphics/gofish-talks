# The Grammar of Graphics Needs Verbs: Towards a GUGOG

Revised outline, 2026-11-03, fourth version. Short talk, 7:00 budget, at the GUGOG workshop at IEEE VIS 2026.

## The story in one paragraph

The talk opens on a wall of GoFish charts, so the audience has something concrete to hold on to. Charts follow a long tail. The grammar of graphics covers the common charts, and one of its big ideas was to write many chart types in one shared language. That shared language let us ask questions about the structure of charts, such as questions about marks and channels, and not only about chart types. For the long tail, we built many new grammars instead. Each one is its own language, so they are hard to compare, and comparing them means translating between every pair. I suspect this makes it harder to ask new research questions about the long tail, but I am not sure that it is the cause. Some of us doubt that a shared kernel exists under these languages. I think one does, but it may not look quite like the grammar of graphics we are used to. A visualization language is a compression of the charts people want to make. Chart typologies like seaborn give short specs for common charts but need a new function for every unusual chart. Low-level toolkits like d3 have a small vocabulary but long specs for every chart. The question for the talk is what stands in the way of doing this compression well. The grammar of graphics sits in the middle as one flat layer of fixed nouns. A fixed set of nouns gives a finite number of combinations, so the only way to grow the language is to add a new primitive, and the core keeps growing. In a language with verbs, you can build new structures from old ones instead. GoFish adds verbs, and with them it can write other grammars' ideas in one language. A unified grammar like this still seems to face three obstacles. The first is that a field needs many API surfaces, and it is not clear that they can be tied together in one language. The second is that a language seems to have to choose between checking validity and allowing any arrangement. The third is the choice between a small language and a big one. For the first two, GoTree and CanAdd are evidence that the obstacle is incidental. For the third, Steele's answer is a language that can grow. With verbs, the language grows as a tree, with a small core and new levels built from old ones, and the middle level stays open. GoFish can grow charts from within, but its layouts are still added from outside the language, which is the same move as adding a new primitive, and its verbs are still a fixed set. Both gaps are part of a bigger open question for the panel: what composition mechanisms belong at the core of a truly universal, extensible grammar of graphics, one whose essence is its composition mechanisms?

## The thesis

In the traditional grammar of graphics, the only way to grow the language is to add a new primitive. In a language with verbs, you can build new structures from old ones, using a fairly stable set of composition mechanisms.

## How the parts connect

- Part 1 opens on concrete charts. The usage curve and the two grammars pictures then make the opening argument. The grammar of graphics gave the common charts one shared language, while the long tail has many grammars that are hard to compare. Part 1 ends by asking whether a shared kernel exists, and I say that I think one does, though it may not look like the grammar of graphics. It then sets up compression as the yardstick for the whole talk. It ends with the question for the talk: "What are the obstacles to doing this compression?"
- Part 2 names the first obstacle in the grammar of graphics, and it begins the answer to how the kernel differs from the grammar of graphics we are used to. It has nouns but almost no verbs, so it is one flat layer, and the only way to grow it is to add a new primitive. The thesis is stated here briefly, in one or two sentences, and not argued.
- Part 3, "Grammars in one language", shows verbs working, first inside GoFish and then across other grammars written in GoFish. It does not mention the tree, which is first shown in 4c.
- Part 4 takes three more obstacles in turn. The first two are disputed with evidence. The third is answered by the tree slide, which comes back to the flat layer from part 2 and states the full thesis. What is still missing is admitted as open, and it leads to the open question: what composition mechanisms belong at the core of a truly universal, extensible grammar of graphics?
- Part 5 hands the open questions to the panel.

So the thesis is mentioned briefly at the beginning and argued at the end. The tree slide opens with an explicit callback: "Earlier I asked whether we keep adding nouns forever."

Each part ends with one line that leads into the next. Those lines are written below.

## Slides

Times are targets. "Existing" means the slide is already in the deck. "New" means it needs to be built. "Moved" means it exists but goes in a new place.

### 1. Opening: compression is the yardstick (about 1:30)

1. **Title.** Existing. 0:00.
2. **Splash: these are all GoFish programs.** Existing, moved to the start. 0:15.
   - The talk opens on concrete charts, so the audience has something to hold on to before the abstract slides.
   - Some of these charts come back later as the leaves of the flat layer and tree pictures.
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
   - "Some of us doubt that a shared kernel exists. I think one does, but it may not look quite like the grammar of graphics we are used to." This leads into the compression bars, and later the flat layer slide and the tree slide.
   - The kernel doubt is not attributed to anyone. McNutt's survey argues that no single DSL should cover every task, which is a different claim.
6. **A grammar is a compression.** Moved from section 5. 0:35 (was 0:25; the extra step needs the time, and the running totals after it are not rebalanced yet). The old title was "a good grammar is a good compression"; the new one does not suggest that the other designs are bad grammars.
   - A schematic chart in three panels side by side: a small copy of the usage curve ("how often it gets made"), then two line charts, "size of the language" and "length of each spec". All three share the usage curve's x axis, from simple common charts on the left to complex tail charts on the right. The usage panel is there to show that most charts made are the simple ones, so the cost on the left counts most.
   - The lines come in one design at a time, each adding its line to both panels. First, only the usage curve and empty axes. Then a chart typology like seaborn, with one function per chart type: specs stay short, but its language climbs with every tail chart. Then a low-level toolkit like d3: a tiny, flat language, but specs are long even for the common charts and climb fast.
   - Then the grammar of graphics, in purple. It is excellent for the common charts, which are most of what people make: a small language whose parts combine well, and short specs, close to the sweet spot. A light dotted line marks the "expressivity cliff" (the GoFish paper's term) in all three panels, just past the head of the usage curve. Past it, for charts like ribbon, waffle, and mosaic charts, the usual code drifts toward one end or the other, so the line turns dashed and bends up gradually without reaching either end. In ggplot2 the usual move is a new chart type (ggalluvial, ggmosaic, ggwaffle), so the language bends toward seaborn ("ggplot2: new chart types"). In Vega-Lite the usual move is explicit layout transforms, as in its own wheat and wages and waterfall examples, so the specs bend toward d3 ("Vega-Lite: explicit calculations"). The boxplot mark is a case that goes the other way. The notes are generous to both systems, whose authors and users are in the room.
   - Then the sweet spot, in red: low in both panels across the whole range. Total cost is the size of the language plus the size of every spec written in it, weighted by how often each chart is made.
   - The slide ends with the question for the talk, shown as a line after a click: "What are the obstacles to doing this compression?"

Leads into part 2 with: "Let's start with the usual answer for the middle, the grammar of graphics."

The Haskell aside is cut from this version. It can come back if there is time.

The "from I to we" slide is hidden with `data-visibility="hidden"`, because the two grammars pictures carry its point. Its line "each vis grammar teaches me something, but the lessons stay stuck in separate systems" moved into the notes for the tangle.

### 2. The grammar of graphics needs verbs (about 0:35)

The thesis is stated here briefly and is not argued. The full argument comes at the end, on the tree slide.

7. **Data, marks, channels, coordinates.** Existing, from the thesis deck, shortened. 0:15.
   - The grammar of graphics is the usual answer for the middle. It has a rich set of nouns but almost no verbs.
   - All four columns show at once. The closing line is the only click.
8. **The grammar of graphics is one flat layer of nouns.** New. 0:20.
   - The same specific charts as the tree slide hang straight off one flat bar. The bar is split into a few of the grammar's categories: marks, encoding channels, coordinate transforms, and a faded slot for the rest.
   - Every chart is written directly against the same fixed nouns, and there is no way to define new words from old ones.
   - One click adds a chart outside the combinations, the croissant chart from the splash, and the bar grows by "+ new geom" and "+ new coordinate system". The line "A fixed set of nouns gives a finite number of combinations. Do we keep adding nouns forever?" appears.
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

Leads into part 4 with: "So unifying grammars compresses them. But three things seem to stand in the way of that compression, and I want to take them one at a time."

### 4. Three obstacles (about 3:35)

Each obstacle is something that seems to stand in the way of the compression from the opening. Each is presented in its strongest form, with credit, before the evidence. The first two are disputed. The third is answered by the tree slide, and what is still missing is admitted as open.

14. **Three obstacles.** Optional. 0:10.
    - Many API surfaces against one language.
    - Validity against freedom of arrangement.
    - A small language against a big one.
    - This slide can be skipped if time is short, because the section titles carry the same structure.

#### 4a. Many surfaces against one language (about 1:40, including the bridge line to 4b)

This obstacle combines the two angles from the false tradeoffs draft. One angle is that a field needs many API surfaces, so one language will not do. The other angle is that it is not possible to tie those surfaces together in one language. GoFish's answer to both is the same. It has several surfaces that work together and share a core.

15. **McNutt quote.** Existing. 0:15.
    - "Small modular language components" is highlighted.
    - Say that I agree no single surface should do everything, and that his suggestion of small modular parts is the direction GoFish takes.
16. **GoTree, the data and the picture.** Existing. 0:15.
    - Nested data, so it is not obvious where chart(data).flow(...) goes.
17. **GoTree and gofish-gotree specs.** Existing. 0:20.
18. **combine compiles to GoFish constraints.** Existing. 0:20, trimmed from 0:25.
19. **Same core, three shapes of data.** Existing. 0:15.
    - Low-level, tabular, and hierarchical surfaces on one core. GoTree keeps its own design and is one more level of the tree, which is McNutt's compile tower.
20. **The surfaces work together.** New, picture only. 0:10.
    - Figure 6 from the paper, the tree of bottle waffles. It uses all three surfaces in one graphic.
    - This answers the second angle, that the surfaces cannot be tied together.

Leads into 4b with a line that credits Jason Brunson's GUGOG paper, "Balancing constriction and expansion for domain-specific grammars". For example, "Jason's paper puts these two obstacles together. He argues that each domain needs a dialect, with its own objects and its own constraints on how they combine. GoTree is a dialect. The next question is about the constraints." This adds about 0:05 and needs no new slide.

Keep the reference to Jason at this high level. The details of his geometric data analysis case are not needed in the talk.

#### 4b. Validity against freedom of arrangement (about 0:55)

21. **Huang and Kay quote.** Existing. 0:15.
    - Their section 6.4 question, with "which of these trade-offs are principled and which are merely incidental" highlighted.
    - Credit them for showing me that validity is important.
22. **CanAdd.** Existing, now three auto-animate steps of one spec. 0:40 in all, trimmed from 0:55 (0:10, 0:15, 0:15).
    - One dataset has a temperature column and a USD column, and a few of its rows show on every step.
    - Step 1 has no schema and stacks the temperatures. GoFish draws it, because without a schema it does not check anything. You can start untyped and add types later.
    - Step 2 adds a schema with °C and summable USD. The same stack now gives GoFish's live error, which suggests the fix.
    - Step 3 stacks USD in place of temperature, and it passes.
    - It constrains specs, not pictures. Every picture is still reachable.
    - State my view plainly. I think this obstacle is incidental, and the type system that catches this error is small.
    - State the limits. It is one operator and one property, and interactivity is not covered.
    - For Q&A or the panel, not the slides. The same type information covers Jason's unit aspect ratio case. GoFish tracks at the type level whether two axes have the same type, and if they do, it uses the same scale for both by default.

Leads into 4c with: "The third obstacle is about how big the language should be. It seems that a language has to be either small, with long specs, or big, with a short spec for every chart. It is the one I have only partly solved."

#### 4c. A small language against a big one (about 0:50)

A small core and an extensible core do not conflict. An extensible core can be small, as long as people extend it from within the language. The obstacle is the choice between a small language and a big one. Steele's answer is a language that can grow, and the tree slide shows what that looks like. GoFish has part of that answer.

23. **Steele quote.** New. 0:15.
    - "I should not design a small language, and I should not design a large one. I need to design a language that can grow." Steele, Growing a Language, 1998. This is the wording in the v3 draft, main.typ line 166. It was checked against Steele's text and is verbatim.
    - Tie it to part 1. A small core keeps the language small, and growing from within gives the big vocabulary that short specs need.
24. **A language that grows is a tree.** Moved from part 2. 0:10.
    - Open with the callback: "Earlier I asked whether we keep adding nouns forever. Here is the answer."
    - The left side is the same flat layer picture from part 2, drawn identically. The right side puts the same charts on intermediate words (chart, tree, diagram) built from a small core of marks and verbs. Its caption is "a tree: many DSLs, one language". The middle nodes are domain languages, each with its own words, all written in one language on one core, so each subdomain can have a custom language and the whole is still one integrated language.
    - The leaves are specific charts the audience has already seen. The population pyramid, GoTree silhouette tree, Sankey tree, and Bluefish pulley diagram are on the splash. The ribbon chart is from the crash course.
    - A faded fourth middle node with "..." and faded "..." leaves show that the middle is not a closed set of three kinds. New levels and new grammars can keep being added.
    - The line under the picture is "Build new structures from old ones with a small, stable set of verbs."
    - State the full thesis as the payoff.
    - If asked about "optimal" compression, the honest claim is that nested rules compress better than one flat layer. Grammar-based compression algorithms such as Sequitur work by building nested rules.
25. **Where we are now.** Existing slides "where we are now" and "evidence so far", merged. 0:25. This is the last slide of 4c. The "lambda calculus of layout" slide that used to follow it is cut, because it was too low level and repeated this slide.
    - Two columns. "so far": charts grow from within, marks reduce to simple primitives, and interfaces reduce to bounding boxes and boundary curves. "not yet": layouts are added from outside the language, and the verbs are a fixed set.
    - One line under the columns: "Open question: what composition mechanisms belong at the core of a truly universal, extensible grammar of graphics?"
    - GoFish can grow from within at the chart level. GoTree and the chart templates are defined with the same verbs people use to build graphics.
    - Tie the limit to the word "fairly" in the thesis. The verbs are mostly stable but still a fixed set. Layouts are still added from outside the language, and adding one is the same "add a new primitive" move as in part 2. The v3 draft points out the same problem for ggplot2, where extending it with ggproto means leaving the plot language for a package implementation interface.
    - End on the open question. The goal is a truly universal, extensible grammar of graphics whose essence is its composition mechanisms. Defining new layouts from within the language is one part of that question, not the whole of it.

Leads into part 5 with: "That is the question I would most like help with."

### 5. Questions for the panel (about 0:40)

26. **Questions for the panel.** Existing. 0:40.
    - What composition mechanisms belong at the core of a GUGOG?
    - How do our grammars build on each other? Libraries on libraries are a form of compression.
    - Is there a concrete case where checking validity forces you to give up a picture you would want?
    - Could the usage curve become a benchmark, e.g., for AI-generated charts?

## Time

| Part | Target |
| --- | --- |
| 1. Opening: compression is the yardstick | 1:30 |
| 2. The grammar of graphics needs verbs | 0:35 |
| 3. Grammars in one language | 1:15 |
| 4. Three obstacles, including the optional overview slide | 3:35 |
| 5. Questions for the panel | 0:40 |
| Total | 7:35 |

In part 1, the grammars picture and the tangle take the 0:30 that "from I to we" had, so the part 1 total and the running totals after it do not change. The running totals in the opening are now 0:15 after the splash, 0:35 after the usage curve, 0:50 after the grammars picture, 1:05 after the tangle, and 1:30 after the compression bars.

Without the optional overview slide the total is 7:25. The deck used to run 9:20. Most of the savings come from these changes:

- The Haskell aside is cut.
- The verbs slide drops from 1:30 to 0:15.
- Section 5 drops from five slides to two.
- CanAdd drops from 0:55 to 0:40.

To reach 7:00, the first candidates are these:

- Skip the overview slide, which saves 0:10.
- Show the GoTree data and specs on one slide, which saves about 0:15.
- Put the Steele quote on the "where we are now" slide as a header, which saves about 0:10.

## Changes to the deck

- New slides:
  - The grammars picture and the tangle, in part 1. They are an auto-animate pair, and they replace "from I to we" with the same 0:30.
  - "The grammar of graphics is one flat layer of nouns", in part 2.
  - "A language that grows is a tree", in 4c. Its left side is the same picture as the flat layer slide.
  - "Three obstacles", optional.
  - "The surfaces work together", with Figure 6 from the paper.
  - The Steele quote.
- Moved slides:
  - The splash moves to right after the title.
  - The usage curve and the compression bars move to part 1. The usage curve now comes before the grammars pictures.
  - The big vs. small slides become obstacle 4c.
- Shortened slides:
  - The verbs slide, with all columns at once.
  - CanAdd, by trimming the spoken notes.
- Merged slides: "where we are now" and "evidence so far".
- Hidden slides:
  - "From I to we". Its point is now made by the grammars pictures.
- Removed slides:
  - The Haskell aside.
  - The hidden backup version of section 5, which this version no longer needs.
- New section titles:
  - "Compression is the yardstick"
  - "The grammar of graphics needs verbs"
  - "Grammars in one language"
  - "Three obstacles"
  - "Many surfaces against one language"
  - "Validity against freedom of arrangement"
  - "A small language against a big one"
- New lead lines at the end of each part, as written above.

## Open choices

- The three obstacle titles are long. Shorter versions could be "many surfaces", "validity", and "small or big".
