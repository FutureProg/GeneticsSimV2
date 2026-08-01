import { useCallback, useMemo, useRef, useState } from 'react';
import type { Creature } from '../creatures/Creature';
import type { Bounds } from '../simulation/physics';
import { createBlobRegistry, type BlobData } from '../simulation/blobRegistry';
import { useSimulationLoop } from './useSimulationLoop';

export type BlobSimulation = {
  /** Attach to the container that bounds the blobs. */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /**
   * Registers the blob and its rendered representation with the simulation
   * @param creature the creature to register the blob with
   * @param element the HTML element the blob is represented by
   */
  registerBlob: (creature: Creature, element: HTMLDivElement | null) => void;
  /** Toggle a creature's selected state (max two selected at once). */
  toggleSelect: (id: string) => void;
  /** Deselect all creatures. */
  clearSelection: () => void;
  /** Ids of the currently selected parents (0–2). React state, updated on click. */
  selectedIds: string[];
  /** Pause/unpause the simulation (e.g. for breeding). */
  togglePaused: (value?: boolean) => void;
  /** Get the currently selected blobs' data records. */
  getSelectedBlobs: () => BlobData[];
  /** Remove all of the blobs from the simulation **/
  clearBlobs(): void;
  /** True once the container has been measured, so bounds reflect its real size. */
  ready: boolean;
};

/**
 * Bridges the pure simulation pieces to React: owns the container/bounds/
 * paused refs and the blob registry, and surfaces selection as state since it
 * changes on click (rare), not per frame. The per-frame DOM-writing loop
 * itself lives in useSimulationLoop; the Map of blobs lives in blobRegistry.
 */
export function useBlobSimulation(): BlobSimulation {
  const containerRef = useRef<HTMLDivElement>(null);
  const boundsRef = useRef<Bounds>({ width: window.innerWidth, height: window.innerHeight });
  const pausedRef = useRef(false);
  const registry = useMemo(() => createBlobRegistry(), []);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { ready } = useSimulationLoop(containerRef, registry, boundsRef, pausedRef);

  const togglePaused = useCallback((value?: boolean) => {
    pausedRef.current = value ?? !pausedRef.current;
  }, []);

  const syncSelected = useCallback(() => {
    setSelectedIds(registry.selectedIds());
  }, [registry]);

  const registerBlob = useCallback(
    (creature: Creature, element: HTMLDivElement | null) => {
      // Ignore React's cleanup call (null) — the registry keeps the blob's
      // last known position until a real element re-registers it.
      if (!element) return;
      registry.register(creature, element, boundsRef.current);
    },
    [registry],
  );

  const toggleSelect = useCallback(
    (id: string) => {
      registry.toggleSelect(id);
      syncSelected();
    },
    [registry, syncSelected],
  );

  const clearSelection = useCallback(() => {
    registry.clearSelection();
    syncSelected();
  }, [registry, syncSelected]);

  const getSelectedBlobs = useCallback(() => registry.getSelected(), [registry]);
  const clearBlobs = useCallback(() => registry.clear(), [registry]);

  return {
    containerRef,
    registerBlob,
    toggleSelect,
    clearSelection,
    togglePaused,
    selectedIds,
    getSelectedBlobs,
    clearBlobs,
    ready,
  };
}
