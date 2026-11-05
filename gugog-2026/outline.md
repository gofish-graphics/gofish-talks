# The Grammar of Graphics Needs Verbs: Towards a GUGOG

Revised outline, 2026-11-03, sixth version. Short talk, 7:00 budget, at the GUGOG workshop at IEEE VIS 2026. This version follows the user's own spoken run-through of the talk.

Note, 2026-11-03, later the same day: the bridge from the islands to the verbs now shows the evidence before it names the pattern. The Atom and PiCCL intro slides moved up to the end of part 2, where they ask what each island added. The verbs slide then names what they share. The change is time neutral. See "Changes to the deck" for details.

Note, 2026-11-04: the compression chart now carries a cited claim. A small line under its title says "To make a description shorter, you have to find the structure." with the source "Simon, 1962". The two "as rates" variants carry the same line, so the three stay comparable. Its notes now cite Herbert Simon for "compression begets structure", with backup quotes from Simon, Peter Grünwald, and Gregory Chaitin. The hierarchy slide in 4a gets one backup sentence that points back to Simon. The Target stays 0:50, but the Simon lines add about 0:15 when spoken and part 1 has no slack, so rehearse it. See "References".

Note, 2026-11-04, later the same day: the talk has a new hook, and the opening is in a new order. After the splash, the islands drawing carries the hook, in the user's own words: "I love visualization grammars, and I'm sad, because I can't use them together." The tangle shows that they do not work with each other and asks "Why are there so many islands?" The compression chart now comes after the islands and answers that question. The grammar of graphics compresses the common charts very well, then hits the expressivity cliff, and each island is someone getting past the cliff on their own. Its closing line is now "What if we compress the islands?" Simon's point, that you have to find the structure to make a description shorter, now explains how to fix the problem, not why to care. The reason for the change is that a personal, concrete problem is easier to care about at the start than an abstract argument, and compression then becomes both the explanation and the fix. The "why unify at all" opening and the AI line are dropped. Parts 1 and 2 are renamed, and the section files are renamed so the file order matches the talk order. The total stays 7:00. See "Changes to the deck" and "Time".

## The story in one paragraph

The talk opens on a wall of GoFish charts, so the audience has something concrete to hold on to. Then comes the hook, over the islands drawing. I love visualization grammars, and every time I see one presented I'm in the audience like the sunglasses emoji. But I'm sad, because I can't use them together. They are all different systems, and they don't work with each other. The ggplot2 ecosystem does not help me, because I mostly work in JavaScript and Python, and many grammars don't fit the grammar of graphics anyway. There is also a practical problem: a lot of cool work, including mine, has no clear path into practice. That is why I want to build a GUGOG. It would let me play with all these grammars, and maybe let end users make charts they have never seen. The tangle shows that the islands don't work with each other, and asks why there are so many islands. The compression chart answers. It measures how well today's approaches compress, by the size of the language and the length of each spec, weighted by how often each chart is made. d3 has a small language but long specs. seaborn has short specs but a huge language. The grammar of graphics compressed many chart types into one shared language, and that revealed structure like marks, channels, scales, and coordinate systems. It sits near the sweet spot for the common charts, until the expressivity cliff. Past the cliff, it drifts toward chart types (ggplot2 extensions) or toward explicit calculations (Vega-Lite), and each island is someone getting past the cliff on their own. Together the islands make a very large language. So what if we compress the islands? To make a description shorter, you have to find the structure (Simon, 1962), and the structure you find depends on the language you use. A language with only nouns finds nouns. So let's do to the islands what the grammar of graphics did to chart types, and compress them, starting with what each island added. Atom added operators for splitting and arranging units. PiCCL added operators for repeating and combining pictures. Neither mainly added a new kind of mark or channel. So what the islands share is operators, not more nouns, and the grammar of graphics has almost none. The grammar of graphics needs verbs. GoFish adds verbs, and Atom and PiCCL reduce to them. Two fair objections follow. Andrew McNutt's is that one language cannot serve every domain's design. With verbs, a new word is a function that composes existing verbs and marks, so a DSL is a library built inside the language, and GoTree is the evidence. Cynthia Huang and Matthew Kay's is that growth costs safety. A small type system brings it back, and CanAdd is the evidence. Finally, our verbs are themselves a typology of operators, and that is the next cliff. We have to compress again, and that is the first question for the panel.

## The thesis

In the traditional grammar of graphics, the only way to grow the language is to add a new primitive. In a language with verbs, you can build new structures from old ones, using a fairly stable set of composition mechanisms.

The first half is said on the verbs slide in part 3. The full thesis is said on the hierarchy slide in part 4a, as the answer to the first objection. The crash course also says the second half once, when GoFish's verbs are introduced.

## How the parts connect

- Part 1, "Why there are islands", opens on concrete charts and then the hook, spoken over the islands drawing: I love visualization grammars, and I'm sad, because I can't use them together. The tangle shows that they don't work with each other and asks "Why are there so many islands?" The compression chart answers it. The grammar of graphics compresses the common charts very well, then hits the expressivity cliff, and each island is someone getting past the cliff on their own. It ends with the line "What if we compress the islands?"
- Part 2, "Compress the islands", says how to fix it. Simon's point, said at the end of the compression chart, is that to find what the islands share you have to find the structure, and that a language with only nouns finds nouns. Then it asks what each island added, with two of them up close. Atom added operators for splitting and arranging units, and PiCCL added operators for repeating and combining pictures. It ends with "So neither island mainly added a new kind of mark or channel. Each one added new ways to arrange and combine things."
- Part 3, "The grammar of graphics needs verbs", is the main point and where the title lands. The verbs slide names what part 2 showed: the islands all added verbs, and the grammar of graphics has a rich set of nouns and almost no verbs. It says the first half of the thesis. The crash course shows GoFish's verbs. The Atom and PiCCL comparisons are the evidence that the same pictures reduce to one shared set of verbs. It ends with "There are two fair concerns about this idea. The first one is Andrew McNutt's."
- Part 4a, "Does one language cost domain design?", is the first objection, McNutt's, in its strongest form and credited. The answer is that with verbs a DSL is a library built inside the language. The hierarchy slide states the full thesis, and GoTree and Figure 6 are the evidence. The spoken bridge crediting Jason Brunson ends 4a and raises the second objection.
- Part 4b, "Does growth cost safety?", is the second objection, Huang and Kay's, in their own words and credited. The answer is a small type system, shown by the four CanAdd steps. It ends with "So growth does not have to cost safety. But the growth itself has a limit, and that is where I want to end."
- Part 5, "The next cliff", admits what is still missing. Our verbs are themselves a typology of operators, so we have to compress again. The panel slide follows.

Both objections are presented as fair concerns, in their strongest form, with credit, before the evidence. McNutt, Cynthia Huang, Matthew Kay, Jason Brunson, Atom's and PiCCL's authors, and Vega-Lite's authors are expected in the room. The hook is said as love for their work and as a problem we all share.

## Slides

Times are targets. Each slide shows its target and running total in its speaker notes. Hidden slides and the comparison variants of the compression chart are not counted.

### 1. Why there are islands (about 1:35)

The slides are in `00-title.html`, `00b-splash.html`, `01-islands.html`, and `01b-compression.html`. The islands and the tangle have no part label, because the drawing fills the slide. The compression chart and its variants carry "1 · Why there are islands".

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

Leads into part 2 with: "So let's do to the islands what the grammar of graphics did to chart types, and compress them. Start by asking what each island added."

### 2. Compress the islands (about 0:25)

The slides are in `01c-compress-islands.html`. Both carry "2 · Compress the islands".

6. **Atom adds operators for arranging units.** 0:15. Running total 1:50.
   - Atom's marks are plain circles and rectangles. What it added is a small set of layout operators, like FillX and MaxFill, that split a space into cells and arrange the units inside them.
7. **PiCCL adds operators for combining pictures.** 0:10. Running total 2:00.
   - PiCCL's marks are ordinary pictures and shapes. What it added is a set of operators for repeating pictures and combining them, e.g., "A atop B".
   - Atom and PiCCL are the evidence for the verbs slide. All credit for their ideas goes to their authors.

Leads into part 3 with: "So neither island mainly added a new kind of mark or channel. Each one added new ways to arrange and combine things. I think most of the other islands are like this too. They add ways to arrange, combine, repeat, or connect marks."

### 3. The grammar of graphics needs verbs (about 1:10)

The slides are in `02-verbs.html`, `03-gofish-intro.html`, and `03b-code-comparisons.html`.

8. **Data, marks, channels, coordinates.** 0:15, down from 0:20, because Atom and PiCCL now show what the islands share before it. Running total 2:15.
   - Say: "They all added verbs. A verb takes graphics and composes them into bigger graphics. The grammar of graphics has a rich set of nouns: data, marks, channels, and coordinates." Then the click: "A rich set of nouns, but almost no verbs."
   - Say: "In the traditional grammar of graphics, the only way to grow the language is to add a new primitive. That is what happens past the cliff. So the grammar of graphics needs verbs."
   - Backup for questions: past the cliff, most ggplot2 extensions add new arrangements, and Vega-Lite's explicit calculations mostly compute positions, so what breaks at the cliff is arrangement. Both systems chose a small, fixed set of nouns on purpose, and that is why the common charts are so short.
   - One optional sentence: "I come from programming languages, and the first thing I look for in a language is its verbs."
9. **Crash course, three steps.** 0:30 in all (0:10 each). Running totals 2:25, 2:35, 2:45.
   - GoFish's verbs, on two surfaces of one core. It says the second half of the thesis once. Its structure, data-ids, and auto-animate are unchanged.
   - Lead into the Atom comparison: "Now let's go back to the two islands from before, Atom and PiCCL, and write them with these verbs."
10. **Atom's gridxy is GoFish's spread.** 0:10. Running total 2:55.
11. **The PiCCL bottle chart in GoFish.** 0:15. Running total 3:10.
    - These are the same pictures from part 2, written with one shared set of verbs. The same `spread` does the work of Atom's `gridxy` and of PiCCL's repeating.

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
| 1. Why there are islands | 1:35 |
| 2. Compress the islands | 0:25 |
| 3. The grammar of graphics needs verbs | 1:10 |
| 4a. Does one language cost domain design? (with the bridge line) | 1:50 |
| 4b. Does growth cost safety? | 0:55 |
| 5. The next cliff (with the panel) | 1:05 |
| Total | 7:00 |

The fifth version ran 7:35. Hiding the usage curve (0:20), the flat layer slide (0:20), and the Steele quote (0:15) saves 0:55. The compression chart grew by 0:15 and the verbs slide by 0:05, so the deck now runs 7:00, on budget. Moving the Atom and PiCCL intros into part 2 is time neutral, because the Atom intro grew by 0:05 and the verbs slide shrank by 0:05.

The new hook on 2026-11-04 is also time neutral. The islands slide grew by 0:20 for the hook. The splash shrank by 0:05 and the compression chart by 0:15, because it no longer opens with why we unify at all. The running totals from the PiCCL intro on are unchanged. Parts 1 and 2 still add up to 2:00, but the line between them moved, so part 1 is now 1:35 and part 2 is 0:25.

If it runs long, cut these first:

- Show the GoTree data and specs on one slide, which saves about 0:15.
- Skip the "same core, three shapes of data" recap, because Figure 6 makes the same point, which saves 0:15.
- Trim the spoken notes on the McNutt quote to the accent phrase and the last sentence, which saves about 0:05.

## Changes to the deck

- New order (since 2026-11-04): title, splash, islands, tangle, compression chart (and its two variants), Atom intro, PiCCL intro, verbs slide, crash course, Atom comparison, bottle, McNutt, hierarchy, the four GoTree slides, Figure 6, Huang and Kay, CanAdd 1 to 4, where we are now, panel.
- Moved slides:
  - The islands and tangle move from before the compression chart to after it, into their own file, `01b-islands.html`.
  - McNutt now opens part 4a, as the first objection.
  - 2026-11-04: the islands and tangle move back to before the compression chart, so the hook comes first and the chart explains it. The Atom and PiCCL intros stay after the chart, so they move out of the islands file into their own file, `01c-compress-islands.html`, with the link to `gofish-compare.css` at its top.
  - 2026-11-03, later the same day: the Atom and PiCCL intros move from `03b-code-comparisons.html` to the end of `01b-islands.html`, before the verbs slide, under "2 · Past the cliff". Their titles now say what each grammar added: "Atom adds operators for arranging units" and "PiCCL adds operators for combining pictures". They are short so each fits on one line, and the notes say the longer versions. The source lines keep the papers' full titles and authors. The link to `gofish-compare.css` moves to the top of `01b-islands.html`, before the first slide that uses it. The thesis defense deck put the nouns slide before its islands, as their cause, and its hidden "Limitations of Marks/Channels Lead to New Grammars with New Compositional Rules" slide showed Atom's operator figure. This talk uses the same figures and the GUGOG paper's wording ("verbs for arranging, compositing, repeating, or otherwise relating marks"), but shows the operators first and names the pattern after.
- Hidden slides, each with `data-visibility="hidden"` and a comment saying why:
  - The usage curve. The compression chart's left panel covers it.
  - "The grammar of graphics is one flat layer of nouns". The compression chart's grammar of graphics line and its cliff make its point, and the verbs slide states the first half of the thesis.
  - The Steele quote. Part 4 is now two objections, not a big language against a small one.
  - "From I to we" and the Haskell aside stay hidden.
- Renamed files: `04a-big-or-small.html` is now `04a-domain-design.html`. On 2026-11-04, `01b-islands.html` became `01-islands.html` (the islands and the tangle only), and `01-compression.html` became `01b-compression.html`, so the file order matches the talk order. The Atom and PiCCL intros are in the new file `01c-compress-islands.html`.
- New part labels: "1 · Why there are islands" (shown on the compression chart and its variants, and not on the islands drawing, which fills the slide), "2 · Compress the islands" (shown on the Atom and PiCCL intros), "3 · The grammar of graphics needs verbs", "4a · Does one language cost domain design?", "4b · Does growth cost safety?", "5 · The next cliff". The crash course still has no label.
- Rewritten notes and lead lines at every part boundary, as written above.
- Slide text is unchanged, apart from the part labels, the titles of the Atom and PiCCL intros, and, on 2026-11-04, the compression chart's closing line.

## Open choices

- Resolved on 2026-11-04: the compression chart's on-slide line is now "What if we compress the islands?"
- The hook has no text on the islands slide. A small line such as "I love visualization grammars. I can't use them together." could go on it, but the drawing would have to shrink on both slides of the auto-animate pair.
- The panel slide carries "5 · The next cliff", because its first question is the next cliff. It could instead go back to its own label, such as "6 · Questions for the panel".
- "1 · Why there are islands" shows on the compression chart but not on the islands drawing. A small label could go on the drawing if the audience needs it.
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
