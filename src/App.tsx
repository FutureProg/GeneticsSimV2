import { useState } from "react";
import "./App.css";
import { ActionButtons } from "./components/ActionButtons";
import { BlobField } from "./components/BlobField";
import { PunnettOverlay } from "./components/PunnettOverlay";
import { createCreature, type Creature } from "./creatures/Creature";
import { useBlobSimulation } from "./hooks/useBlobSimulation";
import { breed, punnett } from "./creatures/genetics";

// Hard-coded starter creatures. Temporary: generations become data-driven once
// breeding exists (see CLAUDE.md). Genotypes are placeholders for now.
const INITIAL_CREATURES: Creature[] = [
  { id: "c1", genotype: {
    A: ['A', 'a'],
    B: ['B', 'b'],
  } },
  { id: "c2", genotype: {
    A: ['A', 'a'],
    B: ['B', 'b'],
  } },
  { id: "c3", genotype: {
    A: ['A', 'a'],
    B: ['B', 'b'],
  } },
  { id: "c4", genotype: {
    A: ['A', 'a'],
    B: ['B', 'b'],
  } },
  { id: "c5", genotype: {
    A: ['a', 'a'],
    B: ['b', 'b'],
  } },
];

function App() {
  const sim = useBlobSimulation();
  const [punnettOpen, setPunnettOpen] = useState(false);
  const [creatures, setCreatures] = useState(INITIAL_CREATURES);
  const canAct = sim.selectedIds.length === 2;

  const togglePunnett = (value?: boolean) => {
    setPunnettOpen(value ?? !punnettOpen);
    sim.togglePaused(value ?? !punnettOpen);
  };

  const onBreed = () => {
    const [geno1, geno2] = sim.getSelectedBlobs().map(blob => blob.creature.genotype);
    const punn = punnett(geno1, geno2);
    sim.clearBlobs();
    const newCreatures = breed(punn, Math.floor(3 + (Math.random() * 2)))
      .map(value => createCreature(value));
    console.log("Created creatures", newCreatures);
    setCreatures(newCreatures);
  }

  return (
    <main>
      <BlobField creatures={creatures} sim={sim} />
      {punnettOpen && sim.selectedIds.length === 2 && (
        <PunnettOverlay
          onBreed={onBreed}
          onClose={() => {
            togglePunnett(false);
          }}
          parentA={sim.getSelectedBlobs()[0].creature} 
          parentB={sim.getSelectedBlobs()[1].creature} 
        />
      )}
      <ActionButtons
        canAct={canAct}
        onBreed={onBreed}
        onPunnett={() => {
          togglePunnett(true);
        }}
      />
    </main>
  );
}

export default App;
