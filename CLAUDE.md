# GeneticsSimv2

A web re-creation of an educational genetics simulator that the author originally built in
grade 11 (Java/Swing) so a grade-10 science teacher could demonstrate Mendelian inheritance.
This is the 2026 rewrite. It is intended to live as a piece of the author's personal website.

- Original Java app: https://github.com/FutureProg/GeneticsSimulation (classes: `Creature`,
  `Genotype`, `Phenotype`, `Breeder`, `PunettSquare`, `History`, `MainPanel`, `GeneticsAI`).
- Design vision doc and Figma ("Personal Website", node `151-56`) define the intended UX.

## The experience (target behaviour)

1. Cute "creatures" (blobs) bounce around the screen, colliding with each other and the walls.
2. The user clicks **two** creatures to select them as parents.
3. **Punnett Square** previews the possible offspring genotype combinations for that pairing.
4. **Breed** produces the offspring generation and focuses on it. The original tracked
   generations (F1, F2 …) and a **History** panel; forward-only by design (no going back).

The genetics model is classic Mendelian: allele pairs (e.g. `A/a`, `B/b`), genotypes like
`AaBb`, dominant/recessive expression into a phenotype, and a dihybrid 4×4 Punnett square
(`AaBb × AaBb`). None of this domain model exists in the code yet — only the visual blob layer.

## Key technical decisions (from the design doc)

- **Plain HTML/DOM elements, not `<canvas>`.** Deliberate choice to reduce complexity and gain
  accessibility / W3C conformance for free. Do not reach for canvas rendering. (Chrome's
  HTML-in-Canvas was considered and rejected as too new / single-browser.)
- **Web over native** for portability (desktop + mobile), accessibility, and agent-friendliness.
- Creatures are rendered as **inline SVG** (`vite-plugin-svgr`, imported `?react`).

## Stack

- React 19 + TypeScript + Vite. pnpm. ESLint flat config.
- SVG-as-component via `vite-plugin-svgr`.
- Creature art lives in `src/assets/creature*.svg` (base, surprised, dizzy, overlay, plus
  animated variants).

## Commands

- `pnpm dev` — Vite dev server
- `pnpm build` — `tsc -b && vite build`
- `pnpm lint` — ESLint

## Code layout (current)

`App.tsx` has been refactored from a single god-component into three layers — pure
simulation, a (placeholder) genetics domain, and presentation:

- `src/simulation/physics.ts` — pure, DOM-free physics: `resolveCollision`, `bounceWalls`,
  `step`, `randomPosition`/`randomHeading`, plus `BLOB_SIZE` and the `Bounds`/`PhysicsBody`
  types. No React, no DOM — unit-testable in isolation.
- `src/hooks/useBlobSimulation.ts` — owns the refs + rAF loop + `ResizeObserver`; calls the
  physics helpers and writes results to `element.style.transform`. Exposes `containerRef`,
  `registerBlob`, `toggleSelect`, and `selectedIds`. Has proper cleanup (cancels the frame,
  disconnects the observer) so React 19 StrictMode doesn't start a second loop; `registerBlob`
  is idempotent so re-renders don't re-randomize positions.
- `src/creatures/Creature.ts` + `genetics.ts` — `Creature = { id, genotype }` and the genetics
  domain. **`genetics.ts` is a PLACEHOLDER**: `Genotype = string`, `gametes()` returns hard-coded
  dihybrid markers, `punnett()`/`breed()` throw. Swapping in the real Mendelian model should
  touch only this file, not the components.
- `src/components/` — `BlobField` (the pool), `Blob` (the wrapper element the loop moves),
  `AlleleBubble` (hover tooltip), `ActionButtons`, and `PunnettOverlay` (full-screen scaffold,
  not yet wired — see below).
- `src/App.tsx` — composition only: mounts the hook, renders `BlobField` + `ActionButtons`.
- `src/App.css`, `src/index.css` — styles. `.blob` is now the **wrapper** div the physics loop
  moves (not the SVG); the art is `.blob-art` and the selected glow is `.blob.selected
  .blob-art`. The hover bubble shows via `.blob:hover .allele-bubble` (pure CSS, no re-render).

## Architecture notes / conventions

- The blob layer works by **imperative DOM mutation inside refs**, not React state — positions
  are written to `element.style.transform` every frame, and `.selected` is toggled as a CSS
  class. This is intentional for animation performance; keep per-frame work out of React render.
- **Selection is deliberately dual.** The per-frame highlight stays an imperative `classList`
  toggle (fast); but the *identity* of the two selected parents is surfaced as React state
  (`selectedIds`) because it changes on click (rare), not per frame, and the rest of the UI
  (`ActionButtons` disabled state, opening the Punnett overlay) needs to react to it.
- `BlobData` (inside `useBlobSimulation`) is the per-creature runtime record (`PhysicsBody` +
  DOM element + `creature` + `selected`). The visual blob and its `Genotype` are linked through
  the `Creature` but kept as **separate concerns** — physics never reads alleles, genetics never
  reads `dirX`.
- **Selected parents freeze** (`if (blob.selected) continue` in the loop). This is load-bearing
  for the planned Punnett slide-in animation (see below) — the parents hold still while the
  overlay morphs in.
- Blob count is currently hard-coded as four creatures in `INITIAL_CREATURES` (`App.tsx`). Treat
  this as temporary — generations will be data-driven once breeding exists.

## Refactoring direction

The simulation/genetics/presentation split is now in place (see Code layout). Keep it. Avoid
premature abstractions that fight the forward-only generation model or the imperative-animation
approach above.

**Remaining / not yet built:**

- **Genetics domain** — the real Mendelian model behind `genetics.ts` (structured `Genotype`,
  allele/phenotype, dihybrid Punnett generation, `breed`). Pure, DOM-free. Confine changes to
  `genetics.ts`; components already consume its types.
- **Punnett overlay wiring** — `PunnettOverlay` is a layout scaffold only. Its open/close state
  machine is not wired (`ActionButtons.onPunnett` is a no-op), and the grid cells are
  placeholders until the genetics lands.
- **Breeding / generations** — `onBreed` is a no-op. Producing the offspring generation, focusing
  on it (forward-only), and the History panel are all still to come.

## Animation decisions

When wiring the Punnett overlay, the two selected parents should **slide into position** in the
overlay and slide back on close (per the Figma "Basic - 2" annotations).

**Use the View Transitions API** for this slide, via the shared-element pattern: give the field
blob and the overlay's parent SVG the same `view-transition-name` and wrap the open/close DOM
change in `document.startViewTransition()`. Rationale: the parents cross from inside `#blob-pool`
(relative, can clip) up into the `position: fixed` overlay; VT renders the morph in the browser's
**top layer**, which avoids the `z-index`/overflow/stacking-context fight you'd otherwise hit (the
main reason to prefer VT over hand-rolled WAAPI here). Because the overlay parent is a *separate*
DOM node and the field blob stays frozen in place underneath, there's no position write-back on
close — the field blob never moved.

Gotchas to remember:

- **`flushSync`** — VT snapshots, runs the callback, then animates the new DOM, so the DOM mutation
  must happen *synchronously* inside the `startViewTransition` callback. React state updates are
  async, so wrap the `setState` in `flushSync(...)`. (React 19's `<ViewTransition>` component is
  still experimental — prefer the manual `document.startViewTransition()` path.) **Spike this first.**
- **Freeze stays load-bearing** — the parents must hold still during the transition; the existing
  `selected → skip physics` rule already provides this.
- **Scope it** — set `:root { view-transition-name: none }` and `::view-transition { pointer-events:
  none }` so only the two parents are captured and the other bouncing blobs stay live/interactive.
- **Progressive enhancement + a11y** — feature-detect (`if (document.startViewTransition)`, else
  just toggle state) and gate the motion on `prefers-reduced-motion`. Same-document VT is Baseline
  since late 2025; for this personal-site demo that's fine.
- Reach for WAAPI/CSS transitions instead only if you switch to moving the *same* node (not a
  separate overlay copy) or need perfectly interruptible from-current-position reversal — the one
  axis where VT (which snaps a running transition to its end before reversing) is weaker.
