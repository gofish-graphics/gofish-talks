# The Grammar of Graphics Needs Verbs: Towards a GUGOG

Revised outline, 2026-11-02, third version. Short talk, 7:00 budget, at the GUGOG workshop at IEEE VIS 2026.

## The story in one paragraph

The talk opens on a wall of GoFish charts, so the audience has something concrete to hold on to. A visualization language is a compression of the charts people want to make. Chart typologies like seaborn give short specs for common charts but need a new function for every unusual chart. Low-level toolkits like d3 have a small vocabulary but long specs for every chart. The question for the talk is what stands in the way of doing this compression well. The grammar of graphics sits in the middle as one flat layer of fixed nouns. A fixed set of nouns gives a finite number of combinations, so the only way to grow the language is to add a new primitive, and the core keeps growing. In a language with verbs, you can build new structures from old ones instead. GoFish adds verbs, and with them it can write other grammars' ideas in one language. A unified grammar like this still seems to face three obstacles. The first is that a field needs many API surfaces, and it is not clear that they can be tied together in one language. The second is that a language seems to have to choose between checking validity and allowing any arrangement. The third is the choice between a small language and a big one. For the first two, GoTree and CanAdd are evidence that the obstacle is incidental. For the third, Steele's answer is a language that can grow. With verbs, the language grows as a tree, with a small core and new levels built from old ones, and the middle level stays open. GoFish can grow charts from within, but its layouts are still plug-ins written outside the language, which is the same move as adding a new primitive. Growing layouts from within is the hard part, and I do not have an answer yet. That is the open question for the panel.

## The thesis

In the traditional grammar of graphics, the only way to grow the language is to add a new primitive. In a language with verbs, you can build new structures from old ones, using a fairly stable set of composition mechanisms.

## How the parts connect

- Part 1 opens on concrete charts and then sets up compression as the yardstick for the whole talk. It ends with the question for the talk: "What are the obstacles to doing this compression?"
- Part 2 names the first obstacle in the grammar of graphics. It has nouns but almost no verbs, so it is one flat layer, and the only way to grow it is to add a new primitive. The thesis is stated here briefly, in one or two sentences, and not argued.
- Part 3 shows verbs working, first inside GoFish and then across other grammars.
- Part 4 takes three more obstacles in turn. The first two are disputed with evidence. The third is answered by the tree slide, which comes back to the flat layer from part 2 and states the full thesis. What is still missing is admitted as open.
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
3. **From "I" to "we".** Existing, trimmed. 0:30.
   - Each vis grammar teaches me something, but the lessons stay stuck in separate systems.
   - As a field, our grammars cannot build on each other.
4. **The usage curve.** Moved from section 5. 0:20.
   - How often a chart is made, against how complex it is. Bar, line, and scatter are on the left. One-lab infographics and diagrams are on the right.
   - Name the two ends. Chart typologies like seaborn are on one end, and low-level toolkits like d3 are on the other.
5. **A good grammar is a good compression.** Moved from section 5. 0:25.
   - One function per chart type gives a big language. Low-level primitives give long specs.
   - A good grammar keeps both small. Total cost is the size of the language plus the size of every spec written in it, weighted by how often each chart is made.
   - The slide ends with the question for the talk, shown as a line after a click: "What are the obstacles to doing this compression?"

Leads into part 2 with: "Let's start with the usual answer for the middle, the grammar of graphics."

The Haskell aside is cut from this version. It can come back if there is time.

### 2. The grammar of graphics needs verbs (about 0:35)

The thesis is stated here briefly and is not argued. The full argument comes at the end, on the tree slide.

6. **Data, marks, channels, coordinates.** Existing, from the thesis deck, shortened. 0:15.
   - The grammar of graphics is the usual answer for the middle. It has a rich set of nouns but almost no verbs.
   - All four columns show at once. The closing line is the only click.
7. **The grammar of graphics is one flat layer of nouns.** New. 0:20.
   - The same specific charts as the tree slide hang straight off one flat bar. The bar is split into a few of the grammar's categories: marks, encoding channels, coordinate transforms, and a faded slot for the rest.
   - Every chart is written directly against the same fixed nouns, and there is no way to define new words from old ones.
   - One click adds a chart outside the combinations, the croissant chart from the splash, and the bar grows by "+ new geom" and "+ new coordinate system". The line "A fixed set of nouns gives a finite number of combinations. Do we keep adding nouns forever?" appears.
   - Say the first half of the thesis: "In the traditional grammar of graphics, the only way to grow the language is to add a new primitive." Then set up the second half by asking what it would take to build new structures from old ones.

Leads into part 3 with the crash course, which states the second half of the thesis when GoFish's verbs are introduced.

### 3. The tree in practice (about 1:15)

8. **Crash course, three steps.** Existing. 0:30 in total.
   - GoFish's verbs are introduced here. Say the second half of the thesis once, plainly: "In a language with verbs, you can build new structures from old ones, using a fairly stable set of composition mechanisms."
   - Two API surfaces of GoFish side by side. The planets use the low-level core of marks and relations. The stacked bars use the chart level with short specs.
   - Add a label and an arrow to the planets. Then add a ribbon to the bars.
   - Say that these are two surfaces on one core.
9. **Atom's gridxy is GoFish's spread.** Existing. 0:20.
10. **PiCCL lines up with GoFish.** Existing. 0:25.
    - Atom and PiCCL fit into the same tree. Written in one language, they share most of their structure, and the differences are small parts you can point to.

Leads into part 4 with: "So unifying grammars compresses them. But three things seem to stand in the way of that compression, and I want to take them one at a time."

### 4. Three obstacles (about 3:50)

Each obstacle is something that seems to stand in the way of the compression from the opening. Each is presented in its strongest form, with credit, before the evidence. The first two are disputed. The third is answered by the tree slide, and what is still missing is admitted as open.

11. **Three obstacles.** Optional. 0:10.
    - Many API surfaces against one language.
    - Validity against freedom of arrangement.
    - A small language against a big one.
    - This slide can be skipped if time is short, because the section titles carry the same structure.

#### 4a. Many surfaces against one language (about 1:40, including the bridge line to 4b)

This obstacle combines the two angles from the false tradeoffs draft. One angle is that a field needs many API surfaces, so one language will not do. The other angle is that it is not possible to tie those surfaces together in one language. GoFish's answer to both is the same. It has several surfaces that work together and share a core.

12. **McNutt quote.** Existing. 0:15.
    - "Small modular language components" is highlighted.
    - Say that I agree no single surface should do everything, and that his suggestion of small modular parts is the direction GoFish takes.
13. **GoTree, the data and the picture.** Existing. 0:15.
    - Nested data, so it is not obvious where chart(data).flow(...) goes.
14. **GoTree and gofish-gotree specs.** Existing. 0:20.
15. **combine compiles to GoFish constraints.** Existing. 0:20, trimmed from 0:25.
16. **Same core, three shapes of data.** Existing. 0:15.
    - Low-level, tabular, and hierarchical surfaces on one core. GoTree keeps its own design and is one more level of the tree, which is McNutt's compile tower.
17. **The surfaces work together.** New, picture only. 0:10.
    - Figure 6 from the paper, the tree of bottle waffles. It uses all three surfaces in one graphic.
    - This answers the second angle, that the surfaces cannot be tied together.

Leads into 4b with a line that credits Jason Brunson's GUGOG paper, "Balancing constriction and expansion for domain-specific grammars". For example, "Jason's paper puts these two obstacles together. He argues that each domain needs a dialect, with its own objects and its own constraints on how they combine. GoTree is a dialect. The next question is about the constraints." This adds about 0:05 and needs no new slide.

Keep the reference to Jason at this high level. The details of his geometric data analysis case are not needed in the talk.

#### 4b. Validity against freedom of arrangement (about 0:55)

18. **Huang and Kay quote.** Existing. 0:15.
    - Their section 6.4 question, with "which of these trade-offs are principled and which are merely incidental" highlighted.
    - Credit them for showing me that validity is important.
19. **CanAdd.** Existing. 0:40, trimmed from 0:55.
    - USD stacks, and degrees Celsius gives an error that suggests the fix.
    - It constrains specs, not pictures. Every picture is still reachable.
    - State my view plainly. I think this obstacle is incidental, and the type system that catches this error is small.
    - State the limits. It is one operator and one property, and interactivity is not covered.
    - For Q&A or the panel, not the slides. The same type information covers Jason's unit aspect ratio case. GoFish tracks at the type level whether two axes have the same type, and if they do, it uses the same scale for both by default.

Leads into 4c with: "The third obstacle is about how big the language should be. It seems that a language has to be either small, with long specs, or big, with a short spec for every chart. It is the one I have only partly solved."

#### 4c. A small language against a big one (about 1:05)

A small core and an extensible core do not conflict. An extensible core can be small, as long as people extend it from within the language. The obstacle is the choice between a small language and a big one. Steele's answer is a language that can grow, and the tree slide shows what that looks like. GoFish has part of that answer.

20. **Steele quote.** New. 0:15.
    - "I should not design a small language, and I should not design a large one. I need to design a language that can grow." Steele, Growing a Language, 1998. This is the wording in the v3 draft, main.typ line 166. It was checked against Steele's text and is verbatim.
    - Tie it to part 1. A small core keeps the language small, and growing from within gives the big vocabulary that short specs need.
21. **A language that grows is a tree.** Moved from part 2. 0:10.
    - Open with the callback: "Earlier I asked whether we keep adding nouns forever. Here is the answer."
    - The left side is the same flat layer picture from part 2, drawn identically. The right side puts the same charts on intermediate words (chart, tree, diagram) built from a small core of marks and verbs.
    - The leaves are specific charts the audience has already seen. The population pyramid, GoTree silhouette tree, Sankey tree, and point labels avoiding a trend line are on the splash. The ribbon chart is from the crash course.
    - A faded fourth middle node with "..." and faded "..." leaves show that the middle is not a closed set of three kinds. New levels and new grammars can keep being added.
    - The line under the picture is "Build new structures from old ones with a small, stable set of verbs."
    - State the full thesis as the payoff.
    - If asked about "optimal" compression, the honest claim is that nested rules compress better than one flat layer. Grammar-based compression algorithms such as Sequitur work by building nested rules.
22. **Where we are now.** Existing slides "where we are now" and "evidence so far", merged. 0:20.
    - GoFish can grow from within at the chart level. GoTree and the chart templates are defined with the same verbs people use to build graphics.
    - Tie the limit to the word "fairly" in the thesis. The verbs are mostly stable, but layouts cannot grow from within yet. They are opaque plug-ins written outside the language, and adding one is the same "add a new primitive" move as in the grammar of graphics. The v3 draft points out the same problem for ggplot2, where extending it with ggproto means leaving the plot language for a package implementation interface.
    - The verbs are still a fixed set.
    - Marks reduce to simple primitives, and interfaces reduce to bounding boxes and boundary curves.
23. **What is the lambda calculus of layout?** Existing. 0:20.
    - What is a small core where a new layout can be defined inside the language? This question is about removing the last case where you have to add a new primitive.
    - Say plainly that this is hard and that we are working on it.

Leads into part 5 with: "That is the question I would most like help with."

### 5. Questions for the panel (about 0:40)

24. **Questions for the panel.** Existing. 0:40.
    - What should the core of a GUGOG be?
    - How do our grammars build on each other? Libraries on libraries are a form of compression.
    - Is there a concrete case where checking validity forces you to give up a picture you would want?
    - Could the usage curve become a benchmark, e.g., for AI-generated charts?

## Time

| Part | Target |
| --- | --- |
| 1. Opening: compression is the yardstick | 1:30 |
| 2. The grammar of graphics needs verbs | 0:35 |
| 3. The tree in practice | 1:15 |
| 4. Three obstacles, including the optional overview slide | 3:50 |
| 5. Questions for the panel | 0:40 |
| Total | 7:50 |

Without the optional overview slide the total is 7:40. The deck used to run 9:20. Most of the savings come from these changes:

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
  - "The grammar of graphics is one flat layer of nouns", in part 2.
  - "A language that grows is a tree", in 4c. Its left side is the same picture as the flat layer slide.
  - "Three obstacles", optional.
  - "The surfaces work together", with Figure 6 from the paper.
  - The Steele quote.
- Moved slides:
  - The splash moves to right after the title.
  - The usage curve and the compression bars move to part 1.
  - The big vs. small slides become obstacle 4c.
- Shortened slides:
  - The verbs slide, with all columns at once.
  - CanAdd, by trimming the spoken notes.
- Merged slides: "where we are now" and "evidence so far".
- Removed slides:
  - The Haskell aside.
  - The hidden backup version of section 5, which this version no longer needs.
- New section titles:
  - "Compression is the yardstick"
  - "The grammar of graphics needs verbs"
  - "The tree in practice"
  - "Three obstacles"
  - "Many surfaces against one language"
  - "Validity against freedom of arrangement"
  - "A small language against a big one"
- New lead lines at the end of each part, as written above.

## Open choices

- The three obstacle titles are long. Shorter versions could be "many surfaces", "validity", and "small or big".
