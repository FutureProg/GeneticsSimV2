// Pure, DOM-free physics for the bouncing creatures.
// No React, no element refs — everything here operates on plain numbers so it
// can be unit-tested in isolation. The hook (useBlobSimulation) owns the loop
// and writes the results to the DOM.

export const BLOB_SIZE = 100 as const;

export type Bounds = { width: number; height: number };

/** The minimal motion state a physics body needs. BlobData satisfies this. */
export type PhysicsBody = {
  x: number;
  y: number;
  dirX: number;
  dirY: number;
};

/**
 * Elastic collision between two circular bodies of diameter BLOB_SIZE.
 * Mutates the velocity (dir) of both bodies in place when they overlap and are
 * moving toward each other.
 */
export function resolveCollision(a: PhysicsBody, b: PhysicsBody): void {
  const radius = BLOB_SIZE / 2;
  const ax = a.x + radius, ay = a.y + radius;
  const bx = b.x + radius, by = b.y + radius;
  const dx = bx - ax, dy = by - ay;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < BLOB_SIZE && dist > 0) {
    const nx = dx / dist, ny = dy / dist;
    const dvx = a.dirX - b.dirX;
    const dvy = a.dirY - b.dirY;
    const dot = dvx * nx + dvy * ny;
    if (dot > 0) {
      a.dirX -= dot * nx;
      a.dirY -= dot * ny;
      b.dirX += dot * nx;
      b.dirY += dot * ny;
    }
  }
}

/** Flip velocity when a body is at a wall and heading further out of bounds. */
export function bounceWalls(body: PhysicsBody, bounds: Bounds): void {
  if (body.x <= 0 && body.dirX < 0) body.dirX *= -1;
  if (body.x >= bounds.width - BLOB_SIZE && body.dirX > 0) body.dirX *= -1;
  if (body.y <= 0 && body.dirY < 0) body.dirY *= -1;
  if (body.y >= bounds.height - BLOB_SIZE && body.dirY > 0) body.dirY *= -1;
}

const SPEED = 0.1;

/** Advance position by velocity * elapsed time. */
export function step(body: PhysicsBody, deltaTime: number): void {
  body.x += body.dirX * SPEED * deltaTime;
  body.y += body.dirY * SPEED * deltaTime;
}

/** A random starting position fully inside the given bounds. */
export function randomPosition(bounds: Bounds): { x: number; y: number } {
  return {
    x: Math.random() * (bounds.width - BLOB_SIZE),
    y: Math.random() * (bounds.height - BLOB_SIZE),
  };
}

/** A random unit-ish heading in [-1, 1] on each axis. */
export function randomHeading(): { dirX: number; dirY: number } {
  return { dirX: Math.random() * 2 - 1, dirY: Math.random() * 2 - 1 };
}
