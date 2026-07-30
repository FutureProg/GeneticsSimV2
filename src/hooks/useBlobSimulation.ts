import { useCallback, useEffect, useRef, useState } from 'react';
import type { Creature } from '../creatures/Creature';
import {
  BLOB_SIZE,
  bounceWalls,
  randomHeading,
  randomPosition,
  resolveCollision,
  step,
  type Bounds,
  type PhysicsBody,
} from '../simulation/physics';
import { phenotype, type Phenotype } from '../creatures/genetics';

/** Per-creature runtime record: physics state + its DOM element + selection. */
type BlobData = PhysicsBody & {
  creature: Creature;
  element: HTMLDivElement;
  selected: boolean;
};

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
 * Owns the refs + requestAnimationFrame loop and bridges the pure physics
 * helpers to the DOM. Positions are written imperatively to element.style every
 * frame (no React re-render); only selection — which changes on click, not per
 * frame — is surfaced as React state so the rest of the UI can react to it.
 */
export function useBlobSimulation(): BlobSimulation {
  const containerRef = useRef<HTMLDivElement>(null);
  const blobs = useRef<Map<string, BlobData>>(new Map());
  const bounds = useRef<Bounds>({ width: window.innerWidth, height: window.innerHeight });
  const lastTime = useRef<number | null>(null);
  const frame = useRef<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const paused = useRef(false); 
  const togglePaused = (value?: boolean) => {    
    paused.current = value ?? !paused.current;      
    lastTime.current = null; // reset timing to avoid big jumps when resuming
  };

  const syncSelected = useCallback(() => {
    setSelectedIds(
      [...blobs.current.values()].filter(b => b.selected).map(b => b.creature.id),
    );
  }, []);

  const renderPhenotypes = (creature: Creature, element: HTMLDivElement) : Phenotype => {
    const pheno = phenotype(creature.genotype);
    element.style.setProperty("--creature-colour", pheno.color ?? 'green');
    element.style.setProperty("--creature-scale", `${pheno.scale ?? 1}`);
    return pheno;
  }

  // cx, cy are the blob's centre in screen px. The CSS wrapper recentres itself
  // with translate(-50%, -50%), so we write the raw centre and let the box size
  // (which tracks --creature-scale) take care of the offset for any scale.
  const setBlobPosition = (element: HTMLDivElement, cx: number, cy: number) => {
    element.style.setProperty('--creature-x', `${cx}px`);
    element.style.setProperty('--creature-y', `${cy}px`);
  }

  const clearBlobs = () => {        
    blobs.current.clear();    
  }

  const registerBlob = useCallback(
    (creature: Creature, element: HTMLDivElement | null) => {
      // Ignore React's cleanup (null) and re-render churn: keep position, just
      // refresh the element reference so we never re-randomize on re-render.
      if (!element) return;
      const existing = blobs.current.get(creature.id);
      if (existing) {
        existing.element = element;
        setBlobPosition(existing.element, existing.x, existing.y);
        const pheno = renderPhenotypes(creature, element);        
        existing.size = BLOB_SIZE * (pheno.scale ?? 1);
        return;
      }
      const pheno = renderPhenotypes(creature, element);
      const scale = pheno.scale ?? 1;
      const size = BLOB_SIZE * scale;
      const pos = randomPosition(bounds.current, size);
      const data: BlobData = {
        creature,
        element,
        selected: false,
        x: pos.x, y: pos.y,
        size,
        ...randomHeading(),
      };
      blobs.current.set(creature.id, data);
      setBlobPosition(element, pos.x, pos.y);
      element.classList.add('visible');
    },
    [],
  );

  const getSelectedBlobs = () => {
    return [...blobs.current.values()].filter(b => b.selected);
  };

  const clearSelection = useCallback(() => {
    blobs.current.forEach(b => {
      b.selected = false;
      b.element.classList.remove('selected');
    });
    syncSelected();
  }, [syncSelected]);

  const toggleSelect = useCallback(
    (id: string) => {
      const data = blobs.current.get(id);
      if (!data) return;
      const selected = [...blobs.current.values()].filter(b => b.selected);
      // Already two parents chosen and this is a third — clear the old pair first.
      if (selected.length >= 2 && !data.selected) {
        selected.forEach(b => {
          b.selected = false;
          b.element.classList.remove('selected');
        });
      }
      data.selected = !data.selected;
      data.element.classList.toggle('selected', data.selected);
      syncSelected();
    },
    [syncSelected],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    bounds.current = { width: container.clientWidth, height: container.clientHeight };
    setReady(true);

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.target === container) {
          const { width, height } = entry.contentRect;
          bounds.current = { width, height };
        }
      }
    });
    observer.observe(container);

    const render = (currentTime: number) => {
      if (paused.current) {
        lastTime.current = null; // reset timing to avoid big jumps when resuming
        frame.current = requestAnimationFrame(render);
        return;
      }
      if (lastTime.current == null) lastTime.current = currentTime;
      const deltaTime = currentTime - lastTime.current;
      lastTime.current = currentTime;

      const list = [...blobs.current.values()];
      // Frozen blobs (selected parents, or hovered for easier clicking) hold
      // still. Mark them immovable so collisions treat them as infinite mass and
      // never drift their stored position out of sync with where they're drawn.
      for (const blob of list)
        blob.immovable = blob.selected || blob.element.matches(':hover');

      for (let i = 0; i < list.length; i++)
        for (let j = i + 1; j < list.length; j++)
          resolveCollision(list[i], list[j]);

      for (const blob of list) {
        if (blob.immovable) continue;
        bounceWalls(blob, bounds.current);
        step(blob, deltaTime);
        setBlobPosition(blob.element, blob.x, blob.y);
      }
      frame.current = requestAnimationFrame(render);
    };
    frame.current = requestAnimationFrame(render);

    const handleVisibility = () => {
      if (document.hidden) {
        if (frame.current != null) cancelAnimationFrame(frame.current);
        frame.current = null;
        lastTime.current = null;
      } else {
        frame.current = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
      if (frame.current != null) cancelAnimationFrame(frame.current);
      lastTime.current = null;
    };
  }, []);

  return { containerRef, clearBlobs, registerBlob: registerBlob, toggleSelect, clearSelection, togglePaused, selectedIds, getSelectedBlobs, ready };
}
