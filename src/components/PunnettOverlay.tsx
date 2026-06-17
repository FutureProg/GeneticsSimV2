import { Fragment } from 'react';
import CreatureSVG from '../assets/creature.svg?react';
import type { Creature } from '../creatures/Creature';
import { gametes, genotypeString, punnett } from '../creatures/genetics';

type Props = {
  parentA: Creature;
  parentB: Creature;
  /** Generation code, e.g. "F1". */
  generation?: string;
  onClose: () => void;
  onBreed: () => void;
};

/**
 * Full-screen Punnett overlay (Figma "Basic - 2"). LAYOUT SCAFFOLD ONLY — the
 * open/close state machine and the slide-in transition are not wired yet, and
 * the grid cells are placeholders: real offspring previews land with the
 * genetics domain. The component is intentionally self-contained — it draws its
 * own parent creatures from the two genotypes and only needs those as props, so
 * it stays decoupled from the physics layer.
 */
export function PunnettOverlay({ parentA, parentB, generation = 'F1', onClose, onBreed }: Props) {
  const rows = gametes(parentA.genotype);
  const cols = gametes(parentB.genotype);
  const parentAGenotype = genotypeString(parentA.genotype);
  const parentBGenotype = genotypeString(parentB.genotype);
  const punnettValues = punnett(parentA.genotype, parentB.genotype);

  return (
    <div className="punnett-overlay" role="dialog" aria-modal="true" aria-label="Punnett square">
      <div className="punnett-scrim" onClick={onClose} />
      <div className="punnett-panel">
        <header className="punnett-parents">
          <span className="genotype">{parentAGenotype}</span>
          <CreatureSVG className="punnett-parent-art" />
          <span className="cross">×</span>
          <CreatureSVG className="punnett-parent-art" />
          <span className="genotype">{parentBGenotype}</span>
        </header>

        <h2 className="punnett-title">
          <span className="generation-code">{generation}</span>
          {parentAGenotype} × {parentBGenotype}
        </h2>

        <div className="punnett-grid">
          <div className="punnett-corner" aria-hidden />
          {cols.map(c => (
            <div key={`col-${c}`} className="punnett-axis">
              {c}
            </div>
          ))}
          {rows.map((row, rowIndex) => (
            <Fragment key={`row-${row}`}>
              <div className="punnett-axis">{row}</div>
              {cols.map((col, colIndex) => (
                <div key={`${row}-${col}`} className="punnett-cell">
                  {genotypeString(punnettValues.at(rowIndex, colIndex))}
                </div>
              ))}
            </Fragment>
          ))}
        </div>

        <footer className="punnett-actions">
          <button onClick={onClose}>Close</button>
          <button onClick={onBreed}>Breed</button>
        </footer>
      </div>
    </div>
  );
}
