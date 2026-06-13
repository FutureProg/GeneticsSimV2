import CreatureSVG from './assets/creature.svg';
import './App.css';
import { useEffect, useRef } from 'react';

type BlobData = {
  element: HTMLImageElement;
  x: number;
  y: number;
  dirX: number;
  dirY: number;
};

const BLOB_SIZE = 100 as const;

function App() {  

  const blobsArr = useRef<BlobData[]>([]);    
  const blobsPool = useRef<HTMLDivElement>(null);
  const lastTime = useRef<number>(null);
  const bounds = useRef<{ width: number; height: number }>({ width: window.innerWidth, height: window.innerHeight });
  const resizeObserver = useRef<ResizeObserver>(null);

  const initBlobs = () => {    
    bounds.current = { width: blobsPool.current?.clientWidth || window.innerWidth, height: blobsPool.current?.clientHeight || window.innerHeight };
    blobsArr.current = Array.from(document.querySelectorAll<HTMLImageElement>('.blob')).map(element => ({
      element,
      size: { width: element.width, height: element.height },
      x: Math.random() * (bounds.current.width - BLOB_SIZE),
      y: Math.random() * (bounds.current.height - BLOB_SIZE),
      dirX: Math.random() * 2 - 1,
      dirY: Math.random() * 2 - 1
    }));
    blobsArr.current.forEach(blob => {
      blob.element.style.transform = `translate(${blob.x}px, ${blob.y}px)`;
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
      // Only respond if blobs are approaching each other
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

  const render = async (currentTime: number) => {
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
        <img className="blob" src={CreatureSVG} alt="creature" />
        <img className="blob" src={CreatureSVG} alt="creature" />
        <img className="blob" src={CreatureSVG} alt="creature" />
        <img className="blob" src={CreatureSVG} alt="creature" />
      </div>
    </main>
  )
}

export default App
