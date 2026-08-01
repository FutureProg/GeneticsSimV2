import { useEffect, useState } from 'react';
import { bounceWalls, resolveCollision, step, type Bounds } from '../simulation/physics';
import { setBlobPosition } from '../simulation/blobDom';
import type { BlobRegistry } from '../simulation/blobRegistry';

/**
 * Drives the requestAnimationFrame physics loop: measures + observes the
 * container's bounds, steps collisions/movement each frame, and pauses while
 * the tab is hidden or `pausedRef` is set. Positions are written imperatively
 * to the DOM every frame — this hook never re-renders for motion; it only
 * flips `ready` once the container has been measured.
 */
export function useSimulationLoop(
  containerRef: React.RefObject<HTMLDivElement | null>,
  registry: BlobRegistry,
  boundsRef: React.RefObject<Bounds>,
  pausedRef: React.RefObject<boolean>,
): { ready: boolean } {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    boundsRef.current = { width: container.clientWidth, height: container.clientHeight };
    setReady(true);

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.target === container) {
          boundsRef.current = { width: entry.contentRect.width, height: entry.contentRect.height };
        }
      }
    });
    observer.observe(container);

    let lastTime: number | null = null;
    let frame: number | null = null;

    const render = (currentTime: number) => {
      if (pausedRef.current) {
        // Kept null for the whole paused stretch, so the frame that resumes
        // doesn't see a huge deltaTime jump.
        lastTime = null;
        frame = requestAnimationFrame(render);
        return;
      }
      if (lastTime == null) lastTime = currentTime;
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      const list = registry.values();
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
        bounceWalls(blob, boundsRef.current);
        step(blob, deltaTime);
        setBlobPosition(blob.element, blob.x, blob.y);
      }
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);

    const handleVisibility = () => {
      if (document.hidden) {
        if (frame != null) cancelAnimationFrame(frame);
        frame = null;
        lastTime = null;
      } else {
        frame = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
      if (frame != null) cancelAnimationFrame(frame);
    };
  }, [containerRef, registry, boundsRef, pausedRef]);

  return { ready };
}
