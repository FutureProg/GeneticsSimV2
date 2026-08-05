// Owns the Map<creature id, BlobData> and the register/select bookkeeping
// around it. Plain state a ref can hold — no React here — so it can be shared
// between useBlobSimulation (registration, selection) and useSimulationLoop
// (the per-frame physics pass) without extra re-renders.
import type { Creature } from '../creatures/Creature';
import { phenotype } from '../creatures/genetics';
import {
  BLOB_SIZE,
  randomHeading,
  randomPosition,
  type Bounds,
  type PhysicsBody,
} from './physics';
import { applyPhenotypeStyle, setBlobPosition, setBlobSelected } from './blobDom';

/** Per-creature runtime record: physics state + its DOM element + selection. */
export type BlobData = PhysicsBody & {
  creature: Creature;
  element: HTMLDivElement;
  selected: boolean;
  /** Tracked via pointer events rather than re-matching `:hover` every frame. */
  hovered: boolean;
};

export function createBlobRegistry() {
  const blobs = new Map<string, BlobData>();

  /**
   * Registers a creature's rendered element with the simulation. Ignores
   * React's re-render churn: an already-known creature keeps its position and
   * just refreshes the element reference, so it never re-randomizes on
   * re-render.
   */
  const register = (creature: Creature, element: HTMLDivElement, bounds: Bounds): void => {
    const pheno = phenotype(creature.genotype);
    applyPhenotypeStyle(element, pheno);
    const size = BLOB_SIZE * (pheno.scale ?? 1);

    const existing = blobs.get(creature.id);
    if (existing) {
      existing.element = element;
      existing.size = size;
      setBlobPosition(element, existing.x, existing.y);
      return;
    }

    const pos = randomPosition(bounds, size);
    blobs.set(creature.id, {
      creature,
      element,
      selected: false,
      hovered: false,
      size,
      x: pos.x,
      y: pos.y,
      ...randomHeading(),
    });
    setBlobPosition(element, pos.x, pos.y);
    element.classList.add('visible');
  };

  const toggleSelect = (id: string): void => {
    const data = blobs.get(id);
    if (!data) return;
    const selected = [...blobs.values()].filter(b => b.selected);
    // Already two parents chosen and this is a third — clear the old pair first.
    if (selected.length >= 2 && !data.selected) {
      selected.forEach(b => {
        b.selected = false;
        setBlobSelected(b.element, false);
      });
    }
    data.selected = !data.selected;
    setBlobSelected(data.element, data.selected);
  };

  const clearSelection = (): void => {
    blobs.forEach(b => {
      b.selected = false;
      setBlobSelected(b.element, false);
    });
  };

  const setHovered = (id: string, hovered: boolean): void => {
    const data = blobs.get(id);
    if (data) data.hovered = hovered;
  };

  return {
    values: () => [...blobs.values()],
    getSelected: () => [...blobs.values()].filter(b => b.selected),
    selectedIds: () => [...blobs.values()].filter(b => b.selected).map(b => b.creature.id),
    register,
    toggleSelect,
    clearSelection,
    setHovered,
    clear: () => blobs.clear(),
  };
}

export type BlobRegistry = ReturnType<typeof createBlobRegistry>;
