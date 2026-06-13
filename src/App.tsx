import CreatureSVG from './assets/creature.svg?react';
import './App.css';
import { useEffect, useRef } from 'react';

type BlobData = {
  element: SVGSVGElement;
  x: number;
  y: number;
  dirX: number;
  dirY: number;
  selected: boolean;
};

const BLOB_SIZE = 100 as const;

function App() {

  const blobsArr = useRef<BlobData[]>([]);
  const blobsPool = useRef<HTMLDivElement>(null);
  const lastTime = useRef<number>(null);
  const bounds = useRef<{ width: number; height: number }>({ width: window.innerWidth, height: window.innerHeight });
  const resizeObserver = useRef<ResizeObserver>(null);

  const onBlobClick = (blob: BlobData) => {
    const selectedBlobs = blobsArr.current.filter(b => b.selected);
    if (selectedBlobs.length >= 2 && !blob.selected) {
      selectedBlobs.forEach(b => {
        b.selected = false;
        b.element.classList.remove('selected');
      });
    }
    blob.selected = !blob.selected;
    blob.element.classList.toggle('selected', blob.selected);        
  }

  const initBlobs = () => {
    bounds.current = { width: blobsPool.current?.clientWidth || window.innerWidth, height: blobsPool.current?.clientHeight || window.innerHeight };
    blobsArr.current = Array.from(document.querySelectorAll<SVGSVGElement>('.blob')).map(element => ({
      element,
      x: Math.random() * (bounds.current.width - BLOB_SIZE),
      y: Math.random() * (bounds.current.height - BLOB_SIZE),
      dirX: Math.random() * 2 - 1,
      dirY: Math.random() * 2 - 1,
      selected: false,
    }));
    blobsArr.current.forEach(blob => {
      blob.element.style.transform = `translate(${blob.x}px, ${blob.y}px)`;
      blob.element.onclick = onBlobClick.bind(null, blob);
    });
  }  

  const collisionDetection = (blobA: BlobData, blobB: BlobData) => {
    const radius = BLOB_SIZE / 2;
    const ax = blobA.x + radius, ay = blobA.y + radius;
    const bx = blobB.x + radius, by = blobB.y + radius;
    const dx = bx - ax, dy = by - ay;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < BLOB_SIZE && dist > 0) {
      const nx = dx / dist, ny = dy / dist;
      const dvx = blobA.dirX - blobB.dirX;
      const dvy = blobA.dirY - blobB.dirY;
      const dot = dvx * nx + dvy * ny;
      if (dot > 0) {
        blobA.dirX -= dot * nx;
        blobA.dirY -= dot * ny;
        blobB.dirX += dot * nx;
        blobB.dirY += dot * ny;
      }
    }
  }

  const render = (currentTime: number) => {
    if (!blobsPool.current) return;
    if (!blobsArr.current.length) return;
    if (!lastTime.current) lastTime.current = currentTime;
    const deltaTime = currentTime - lastTime.current;
    lastTime.current = currentTime;

    const blobs = blobsArr.current;
    for (let i = 0; i < blobs.length; i++)
      for (let j = i + 1; j < blobs.length; j++)
        collisionDetection(blobs[i], blobs[j]);

    blobsArr.current.forEach(blob => {
      const { element, x, y } = blob;
      if (blob.selected) return;    
      if (x <= 0 && blob.dirX < 0) blob.dirX *= -1;
      if (x >= bounds.current.width - BLOB_SIZE && blob.dirX > 0) blob.dirX *= -1;
      if (y <= 0 && blob.dirY < 0) blob.dirY *= -1;
      if (y >= bounds.current.height - BLOB_SIZE && blob.dirY > 0) blob.dirY *= -1;
      const speed = 0.1;
      const nx = x + (blob.dirX * speed * deltaTime);
      const ny = y + (blob.dirY * speed * deltaTime);
      blob.x = nx;
      blob.y = ny;
      element.style.transform = `translate(${nx}px, ${ny}px)`;
});
    requestAnimationFrame(render);
  }

  useEffect(() => {
    resizeObserver.current = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.target === blobsPool.current) {
          const { width, height } = entry.contentRect;
          bounds.current = { width, height };
        }
      }
    });
    resizeObserver.current.observe(blobsPool.current!);
    initBlobs();
    requestAnimationFrame(render);
  }, []);

  return (
    <main>
      <div id="blob-pool" ref={blobsPool}>
        <CreatureSVG className="blob" />
        <CreatureSVG className="blob" />
        <CreatureSVG className="blob" />
        <CreatureSVG className="blob" />
      </div>
      <div id="action-buttons">
        <button>Breed</button>
        <button>Punnett Square</button>
      </div>
    </main>
  )
}

export default App;
