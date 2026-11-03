# The Grammar of Graphics Needs Verbs: Towards a GUGOG

Revised outline, 2026-11-03, sixth version. Short talk, 7:00 budget, at the GUGOG workshop at IEEE VIS 2026. This version follows the user's own spoken run-through of the talk.

## The story in one paragraph

The talk opens on a wall of GoFish charts, so the audience has something concrete to hold on to. Then it asks why we unify charts into one language at all. The old reasons, that one language is easier to write and easier to read, matter less now that AI writes a lot of code. The reason that still holds is compression: compressing forces you to find structure. The grammar of graphics did this. It compressed many chart types into one shared language, and that revealed structure like marks, channels, scales, and coordinate systems. That structure has value in itself, the way structure in mathematics does, and it shaped tools like ggplot2, Vega-Lite and Altair, and Tableau. The compression chart asks how well today's approaches compress, measured by the size of the language and the length of each spec, weighted by how often each chart is made. d3 has a small language but long specs. seaborn has short specs but a huge language. The grammar of graphics sits near the sweet spot for the common charts, until the expressivity cliff. Past the cliff, it drifts toward chart types (ggplot2 extensions) or toward explicit calculations (Vega-Lite). Past the cliff, we built islands: specialized grammars, each covering a patch of charts, with slightly different concepts, that cannot reach each other. Together they make a very large language. So let's do to these grammars what the grammar of graphics did to chart types, and compress them. What they share is operators, not more nouns, so the grammar of graphics needs verbs. GoFish adds verbs, and Atom and PiCCL reduce to them. Two fair objections follow. Andrew McNutt's is that one language cannot serve every domain's design. With verbs, a new word is a function that composes existing verbs and marks, so a DSL is a library built inside the language, and GoTree is the evidence. Cynthia Huang and Matthew Kay's is that growth costs safety. A small type system brings it back, and CanAdd is the evidence. Finally, our verbs are themselves a typology of operators, and that is the next cliff. We have to compress again, and that is the first question for the panel.

## The thesis

In the traditional grammar of graphics, the only way to grow the language is to add a new primitive. In a language with verbs, you can build new structures from old ones, using a fairly stable set of composition mechanisms.

The first half is said on the verbs slide in part 3. The full thesis is said on the hierarchy slide in part 4a, as the answer to the first objection. The crash course also says the second half once, when GoFish's verbs are introduced.

## How the parts connect

- Part 1, "Why compress", opens on concrete charts and then gives the reason to unify that still holds when AI writes code: compressing forces you to find structure. The compression chart is the yardstick. It ends at the expressivity cliff, with the line "Past the cliff, we built islands."
- Part 2, "Past the cliff", narrates the two hand-drawn pictures as islands. The grammar of graphics is the main island, and the specialized grammars are smaller islands around it. The tangle shows that they cannot reach each other. It ends with "So let's do to these grammars what the grammar of graphics did to chart types: compress them."
- Part 3, "The grammar of graphics needs verbs", is the main point and where the title lands. What the islands share is operators, not more nouns. The verbs slide says the first half of the thesis. The crash course, Atom, and PiCCL are the evidence that the islands reduce to a shared set of operators. It ends with "There are two fair concerns about this idea. The first one is Andrew McNutt's."
- Part 4a, "Does one language cost domain design?", is the first objection, McNutt's, in its strongest form and credited. The answer is that with verbs a DSL is a library built inside the language. The hierarchy slide states the full thesis, and GoTree and Figure 6 are the evidence. The spoken bridge crediting Jason Brunson ends 4a and raises the second objection.
- Part 4b, "Does growth cost safety?", is the second objection, Huang and Kay's, in their own words and credited. The answer is a small type system, shown by the four CanAdd steps. It ends with "So growth does not have to cost safety. But the growth itself has a limit, and that is where I want to end."
- Part 5, "The next cliff", admits what is still missing. Our verbs are themselves a typology of operators, so we have to compress again. The panel slide follows.

Both objections are presented as fair concerns, in their strongest form, with credit, before the evidence. McNutt, Cynthia Huang, Matthew Kay, Jason Brunson, and Vega-Lite's authors are expected in the room.

## Slides

Times are targets. Each slide shows its target and running total in its speaker notes. Hidden slides and the comparison variants of the compression chart are not counted.

### 1. Why compress (about 1:05)

The slides are in `00-title.html`, `00b-splash.html`, and `01-compression.html`.

1. **Title.** 0:00. Running total 0:00.
2. **Splash: these are all GoFish programs.** 0:15. Running total 0:15.
   - The talk opens on concrete charts. Some of them come back later as the leaves of the hierarchy picture.
3. **A grammar is a compression.** 0:50, up from 0:35, because its notes now open with why we compress. Running total 1:05.
   - Why compress, said over the empty axes before the first click: the old reasons (easier to write, easier to read) matter less now that AI writes a lot of code. The reason that still holds is that compressing forces you to find structure. The grammar of graphics compressed many chart types into one shared language, which revealed marks, channels, scales, and coordinate systems. That structure has value in itself, the way structure in mathematics does, and it shaped ggplot2, Vega-Lite and Altair, and Tableau.
   - Then walk the chart, one design per click. The left panel is the usage curve, so it also says what the hidden usage curve slide said. seaborn has short specs but a huge language. d3 has a small language but long specs. The grammar of graphics is in the sweet spot for the common charts, then the expressivity cliff. Past the cliff, ggplot2 drifts toward new chart types and Vega-Lite toward explicit calculations. The notes stay generous to both systems. Then the sweet spot.
   - The line on the slide is still "What are the obstacles to doing this compression?" The notes say the first one is the cliff itself.
   - Two comparison variants ("as rates", a ramp and a step) come right after this slide. They have Target 0:00 and are outside the timing.

Leads into part 2 with: "Past the cliff, we built islands."

### 2. Past the cliff (about 0:30)

The slides are in `01b-islands.html`. They have no part label, because the drawing fills the slide.

4. **Islands (the grammars picture).** 0:15. Running total 1:20.
   - For the long tail, we built specialized grammars. Seen from above, the grammar of graphics is the main island, and the specialized grammars are smaller islands around it. Each covers a patch of charts, and each has slightly different concepts. Together they make a very large language.
5. **The tangle.** 0:15. Running total 1:35. An auto-animate pair with slide 4, so only the arrows fade in.
   - The islands cannot reach each other: comparing them means translating between every pair.
   - Said with confidence: the grammars are hard to compare, and I have run into this a lot. Said as a suspicion: that the field is treading water a bit, and that this is the cause.
   - "Some of us doubt that a shared kernel exists. I think one does, but it may not look quite like the grammar of graphics we are used to."

Leads into part 3 with: "So let's do to these grammars what the grammar of graphics did to chart types: compress them."

### 3. The grammar of graphics needs verbs (about 1:35)

The slides are in `02-verbs.html`, `03-gofish-intro.html`, and `03b-code-comparisons.html`.

6. **Data, marks, channels, coordinates.** 0:20, up from 0:15, because it now states the first half of the thesis. Running total 1:55.
   - What the islands share is operators, not more nouns. The grammar of graphics has a rich set of nouns and almost no verbs.
   - Say: "In the traditional grammar of graphics, the only way to grow the language is to add a new primitive. That is what happens past the cliff. So the grammar of graphics needs verbs."
7. **Crash course, three steps.** 0:30 in all (0:10 each). Running totals 2:05, 2:15, 2:25.
   - GoFish's verbs, on two surfaces of one core. It says the second half of the thesis once. Its structure, data-ids, and auto-animate are unchanged.
8. **Atom: a grammar for unit visualizations.** 0:10. Running total 2:35.
9. **Atom's gridxy is GoFish's spread.** 0:10. Running total 2:45.
10. **PiCCL: a grammar for pictorial charts.** 0:10. Running total 2:55.
11. **The PiCCL bottle chart in GoFish.** 0:15. Running total 3:10.
    - Atom and PiCCL are evidence that the islands reduce to a shared set of operators. All credit for their ideas goes to their authors.

Leads into part 4a with: "So these two islands reduce to a few shared verbs. That is why I say the grammar of graphics needs verbs. There are two fair concerns about this idea, and I want to take both of them seriously. The first one is Andrew McNutt's."

### 4a. Does one language cost domain design? (about 1:50, including the bridge line)

The slides are in `04a-domain-design.html` (renamed from `04a-big-or-small.html`).

12. **McNutt quote.** 0:15. Running total 3:25.
    - The first objection, in its strongest form and credited: no single DSL can capture every task without compromising its domain design.
    - Say: "With verbs, a new word is a function that composes existing verbs, so a DSL is a library built inside the language. Each domain keeps its own design, and it is still one language." His suggestion of small modular language components is the direction GoFish takes, and his compile towers are his own answer to drift.
13. **A language that grows is a hierarchy.** 0:10. Running total 3:35.
    - The answer to the first objection. Its left half, one flat layer of nouns, calls back to the compression chart's grammar of graphics line and its cliff.
    - State the full thesis.
    - The next slides show one of those DSLs, GoTree, which happens to be for tree data.
14. **GoTree, the data and the picture.** 0:15. Running total 3:50.
15. **GoTree and gofish-gotree specs.** 0:20. Running total 4:10.
16. **combine compiles to GoFish constraints.** 0:20. Running total 4:30.
17. **Same core, three shapes of data.** 0:15. Running total 4:45.
18. **The surfaces work together (Figure 6).** 0:10, plus about 0:05 for the bridge line. Running total 5:00.
    - Slides 14 to 18 are evidence for the answer to the first objection.
    - The bridge, crediting Jason Brunson's GUGOG paper, "Balancing constriction and expansion for domain-specific grammars": "Jason's paper argues that each domain needs a dialect, with its own objects and its own constraints on how they combine. GoTree is a dialect in that sense, with its own objects. His second half, the constraints, is where the objection comes in. The more you let people extend the language, the more it seems you give up safety."

### 4b. Does growth cost safety? (about 0:55)

The slides are in `04b-validity.html`. Only their notes changed. The structure, data-ids, auto-animate attributes, delays, and `data-magic-move` of the CanAdd steps are unchanged.

19. **Huang and Kay quote.** 0:15. Running total 5:15.
    - The second objection, in their own words, credited. Their work showed me that validity is important.
20. **CanAdd, four steps.** 0:40 in all (0:10, 0:10, 0:05, 0:15). Running totals 5:25, 5:35, 5:40, 5:55.
    - No schema, then the schema is added, then the error, then USD stacks. It constrains specs, not pictures. The limits: one operator and one property, and interactivity is not covered.

Leads into part 5 with: "So growth does not have to cost safety. But the growth itself has a limit, and that is where I want to end."

### 5. The next cliff (about 1:05)

The slides are in `04c-next-cliff.html` and `05-panel.html`. Both carry the label "5 · The next cliff".

21. **Where we are now.** 0:25. Running total 6:20.
    - "We replaced a typology of charts with a grammar. But our verbs are themselves a typology of operators, and that is the next cliff." Then the existing script: when you need a layout that is not in the set, today you add it from outside the language, which is the same add-a-new-primitive move the grammar of graphics makes past its cliff. So we have to compress again. "I think the way past it is a layout or constraint language that is more expressive than what we have now. That is the question I would most like help with."
22. **Questions for the panel.** 0:40. Running total 7:00.

## Time

| Part | Target |
| --- | --- |
| 1. Why compress | 1:05 |
| 2. Past the cliff | 0:30 |
| 3. The grammar of graphics needs verbs | 1:35 |
| 4a. Does one language cost domain design? (with the bridge line) | 1:50 |
| 4b. Does growth cost safety? | 0:55 |
| 5. The next cliff (with the panel) | 1:05 |
| Total | 7:00 |

The fifth version ran 7:35. Hiding the usage curve (0:20), the flat layer slide (0:20), and the Steele quote (0:15) saves 0:55. The compression chart grew by 0:15 and the verbs slide by 0:05, so the deck now runs 7:00, on budget.

If it runs long, cut these first:

- Show the GoTree data and specs on one slide, which saves about 0:15.
- Skip the "same core, three shapes of data" recap, because Figure 6 makes the same point, which saves 0:15.
- Trim the spoken notes on the McNutt quote to the accent phrase and the last sentence, which saves about 0:05.

## Changes to the deck

- New order: title, splash, compression chart (and its two variants), islands, tangle, verbs slide, crash course, Atom intro, Atom comparison, PiCCL intro, bottle, McNutt, hierarchy, the four GoTree slides, Figure 6, Huang and Kay, CanAdd 1 to 4, where we are now, panel.
- Moved slides:
  - The islands and tangle move from before the compression chart to after it, into their own file, `01b-islands.html`.
  - McNutt now opens part 4a, as the first objection.
- Hidden slides, each with `data-visibility="hidden"` and a comment saying why:
  - The usage curve. The compression chart's left panel covers it.
  - "The grammar of graphics is one flat layer of nouns". The compression chart's grammar of graphics line and its cliff make its point, and the verbs slide states the first half of the thesis.
  - The Steele quote. Part 4 is now two objections, not a big language against a small one.
  - "From I to we" and the Haskell aside stay hidden.
- Renamed files: `04a-big-or-small.html` is now `04a-domain-design.html`.
- New part labels: "1 · Why compress", "2 · Past the cliff" (no slide shows it, because the islands drawing fills the slide), "3 · The grammar of graphics needs verbs", "4a · Does one language cost domain design?", "4b · Does growth cost safety?", "5 · The next cliff". The crash course still has no label.
- Rewritten notes and lead lines at every part boundary, as written above.
- Slide text is unchanged, apart from the part labels.

## Open choices

- The compression chart's on-slide line is still "What are the obstacles to doing this compression?" The new spine reads more like "how well do today's approaches compress?" The line could change to that, or the obstacles line could stay, with the notes naming the cliff as the first obstacle.
- The panel slide carries "5 · The next cliff", because its first question is the next cliff. It could instead go back to its own label, such as "6 · Questions for the panel".
- "2 · Past the cliff" shows on no slide. A small label could go on the islands drawing if the audience needs it.
- The Steele quote could come back as the opening of part 5, where "a language that can grow" meets the next cliff.
