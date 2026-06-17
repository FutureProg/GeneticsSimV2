import CreatureSVG from '../assets/creature.svg?react';
import type { Creature } from '../creatures/Creature';
import { genotypeString } from '../creatures/genetics';
import { AlleleBubble } from './AlleleBubble';
import CreatureOverlaySVG from '../assets/creature-overlay.svg?react';

type Props = {
  creature: Creature;
  onSelect: (id: string) => void;
  registerBlob: (creature: Creature, element: HTMLDivElement | null) => void;
};

type PopoverElement = HTMLElement & { showPopover(): void; hidePopover(): void };

export function Blob({ creature, onSelect, registerBlob }: Props) {
  const bubbleId = `allele-${creature.id}`;
  const anchorName = `--blob-${creature.id}`;

  const showBubble = () => {
    const el = document.getElementById(bubbleId) as PopoverElement | null;
    if (el && !el.matches(':popover-open')) el.showPopover();
  };
  const hideBubble = () => {
    const el = document.getElementById(bubbleId) as PopoverElement | null;
    if (el && el.matches(':popover-open')) el.hidePopover();
  };

  return (
    <div
      className="blob"
      ref={el => registerBlob(creature, el)}
      style={{ anchorName } as React.CSSProperties}
      onMouseEnter={showBubble}
      onMouseLeave={hideBubble}
      onFocus={showBubble}
      onBlur={hideBubble}
      onClick={() => onSelect(creature.id)}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(creature.id);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Creature ${genotypeString(creature.genotype)}`}
      aria-describedby={bubbleId}
    >
      <CreatureOverlaySVG className="blob-overlay" />
      <CreatureSVG className="blob-art" />
      <AlleleBubble id={bubbleId} anchorName={anchorName} genotype={creature.genotype} />
    </div>
  );
}
