import type { Creature } from '../creatures/Creature';
import type { BlobSimulation } from '../hooks/useBlobSimulation';
import { Blob } from './Blob';

type Props = {
  creatures: Creature[];
  sim: BlobSimulation;
};

/**
 * The pool the creatures bounce around in. Renders one <Blob> per creature and
 * hands each its ref to the simulation; the rAF loop in the hook moves them.
 */
export function BlobField({ creatures, sim }: Props) {
  const { containerRef, toggleSelect, clearSelection, registerBlob } = sim;
  return (
    <div
      id="blob-pool"
      ref={containerRef}
      onClick={e => { if (e.target === e.currentTarget) clearSelection(); }}
    >
      {creatures.map(creature => (
        <Blob
          key={creature.id}
          creature={creature}
          onSelect={toggleSelect}
          registerBlob={registerBlob}
        />
      ))}
    </div>
  );
}
