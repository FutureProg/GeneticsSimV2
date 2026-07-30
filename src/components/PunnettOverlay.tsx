import { Fragment } from 'react';
import CreatureSVG from '../assets/creature.svg?react';
import CreatureOverlaySVG from '../assets/creature-overlay.svg?react';
import type { Creature } from '../creatures/Creature';
import { gametes, genotypeString, phenotype, punnett } from '../creatures/genetics';

type Props = {
  parentA: Creature;
  parentB: Creature;
  /** Generation code, e.g. "F1". */
  generation?: string;
  onClose: () => void;
  onBreed: () => void;
};

/**
 * Full-screen Punnett overlay. LAYOUT SCAFFOLD ONLY — the
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
  const createParentRepresentation = (creature: Creature, viewTransitionSuffix: string) => {
    const pheno = phenotype(creature.genotype);
    const styling = {
      '--creature-colour': pheno.color,
      '--creature-scale': pheno.scale,
      viewTransitionName: `parent-${viewTransitionSuffix}`
    }
    return (
      <>
        <span className="genotype">{genotypeString(creature.genotype)}</span>
        <div className='punnett-parent-art' style={styling}>
          <CreatureOverlaySVG className="blob-overlay"/>
          <CreatureSVG className="blob-art" />
        </div>
      </>
    ) 
  }  

  return (
    <div className="punnett-overlay" role="dialog" aria-modal="true" aria-label="Punnett square">      
      <div className="punnett-parents">
        {createParentRepresentation(parentA, 'a')}        
        <span className="cross">×</span>
        {createParentRepresentation(parentB, 'b')}
      </div>
      <div className="punnett-scrim" onClick={onClose} />
      <div className="punnett-panel">        
        <div className="punnett-grid">
          <h2 className="punnett-code-area">
            <span className="generation-code">{generation}</span>
            <span>{parentAGenotype} × {parentBGenotype}</span>
          </h2>
          {cols.map((col, idx) => (            
            <div key={`col-icon-${col}-${idx}`} className="punnett-axis">
              {"icon"}
            </div>
          ))}                    
          {cols.map((col, idx) => (            
            <div key={`col-${col}-${idx}`} className="punnett-axis">
              {col}
            </div>
          ))}
          
          {rows.map((row, rowIndex) => (
            <Fragment key={`row-${row}-${rowIndex}`}>
              <div className="punnett-axis">{"icon"}</div>
              <div className="punnett-axis">{row}</div>              
              {cols.map((col, colIndex) => (
                <div key={`${row}-${col}-${rowIndex}-${colIndex}`} className="punnett-cell">
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
