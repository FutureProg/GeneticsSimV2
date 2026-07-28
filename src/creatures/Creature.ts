import type { Genotype } from './genetics';

/**
 * A creature in the simulation. Its visual blob (DOM element + position +
 * velocity) is tracked separately by useBlobSimulation — the genetics and the
 * physics are deliberately kept as separate concerns (see CLAUDE.md).
 */
export type Creature = {
  id: string;
  genotype: Genotype;
};

export const createCreature = (genotype: Genotype, id?: string) => {
  return {
    id: id ?? `c${crypto.randomUUID()}`,
    genotype
  }
};