import './App.css';
import { ActionButtons } from './components/ActionButtons';
import { BlobField } from './components/BlobField';
import type { Creature } from './creatures/Creature';
import { useBlobSimulation } from './hooks/useBlobSimulation';

// Hard-coded starter creatures. Temporary: generations become data-driven once
// breeding exists (see CLAUDE.md). Genotypes are placeholders for now.
const INITIAL_CREATURES: Creature[] = [
  { id: 'c1', genotype: 'AaBb' },
  { id: 'c2', genotype: 'AaBb' },
  { id: 'c3', genotype: 'AaBb' },
  { id: 'c4', genotype: 'AaBb' },
];

function App() {
  const sim = useBlobSimulation();
  const canAct = sim.selectedIds.length === 2;

  // The Punnett overlay (src/components/PunnettOverlay.tsx) is a layout scaffold;
  // its open/close state machine and the genetics behind it are not wired yet.
  return (
    <main>
      <BlobField creatures={INITIAL_CREATURES} sim={sim} />
      <ActionButtons
        canAct={canAct}
        onBreed={() => {
          // TODO: breeding — needs the genetics domain.
        }}
        onPunnett={() => {
          // TODO: open the Punnett overlay for the two selected parents.
        }}
      />
    </main>
  );
}

export default App;
