import CreatureSVG from '../assets/creature.svg?react';
import type { Creature } from '../creatures/Creature';
import { AlleleBubble } from './AlleleBubble';

type Props = {
  creature: Creature;
  onSelect: (id: string) => void;
  registerBlob: (creature: Creature, element: HTMLDivElement | null) => void;
};

/**
 * A single creature: a positioned wrapper (the `.blob` element the physics loop
 * moves) holding the creature art and its hover allele bubble. The wrapper, not
 * the SVG, is `.blob` now — the bubble needs to live inside it so it tracks the
 * blob as it bounces.
 */
export function Blob({ creature, onSelect, registerBlob }: Props) {
  return (
    <div
      className="blob"
      ref={el => registerBlob(creature, el)}
      onClick={() => onSelect(creature.id)}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(creature.id);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Creature ${creature.genotype}`}
    >
      <CreatureSVG className="blob-art" />
      <AlleleBubble genotype={creature.genotype} />
    </div>
  );
}
