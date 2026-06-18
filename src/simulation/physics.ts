// Pure, DOM-free physics for the bouncing creatures.
// No React, no element refs — everything here operates on plain numbers so it
// can be unit-tested in isolation. The hook (useBlobSimulation) owns the loop
// and writes the results to the DOM.

export const BLOB_SIZE: number = 100;

export type Bounds = { width: number; height: number };

/**
 * The minimal motion state a physics body needs. BlobData satisfies this.
 * x, y are the centre of the creature in screen px (not the wrapper top-left).
 */
export type PhysicsBody = {
  x: number;
  y: number;
  dirX: number;
  dirY: number;
  /** Collision diameter in px (defaults to BLOB_SIZE; varies with phenotype scale). */
  size: number;
  /** When true the body acts as infinite mass: collisions never move it (frozen parents). */
  immovable?: boolean;
};

/**
 * Elastic collision between two circular bodies of differing size.
 *
 * x, y are centres. Mass is taken proportional to area (size²) so a small blob
 * bounces off a big one without flinging it. Two things are corrected in place:
 *  1. position — overlapping bodies are pushed apart (split by inverse mass) so
 *     a fast/small blob can't sink into or tunnel through a larger one;
 *  2. velocity — an elastic impulse (restitution 1) is applied along the normal.
 *
 * `immovable` bodies have infinite mass: they neither move nor change velocity,
 * and the other body absorbs the full correction (used for frozen parents).
 */
export function resolveCollision(a: PhysicsBody, b: PhysicsBody): void {
  const dx = b.x - a.x, dy = b.y - a.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const minDist = (a.size + b.size) / 2;
  if (dist >= minDist || dist === 0) return;

  const nx = dx / dist, ny = dy / dist;

  // Inverse mass (mass ∝ area). Immovable bodies contribute 0 → infinite mass.
  const invA = a.immovable ? 0 : 1 / (a.size * a.size);
  const invB = b.immovable ? 0 : 1 / (b.size * b.size);
  const invSum = invA + invB;
  if (invSum === 0) return; // both immovable — nothing to resolve

  // 1. Positional correction: separate the overlap, heavier body moves less.
  const overlap = minDist - dist;
  a.x -= nx * overlap * (invA / invSum);
  a.y -= ny * overlap * (invA / invSum);
  b.x += nx * overlap * (invB / invSum);
  b.y += ny * overlap * (invB / invSum);

  // 2. Velocity impulse — only if the bodies are still approaching.
  const dot = (a.dirX - b.dirX) * nx + (a.dirY - b.dirY) * ny;
  if (dot <= 0) return; // already separating
  const j = (-2 * dot) / invSum;
  a.dirX += j * invA * nx;
  a.dirY += j * invA * ny;
  b.dirX -= j * invB * nx;
  b.dirY -= j * invB * ny;
}

/** Flip velocity when the visual edge of a body hits a wall. */
export function bounceWalls(body: PhysicsBody, bounds: Bounds): void {
  const r = body.size / 2;
  if (body.x - r <= 0 && body.dirX < 0) body.dirX *= -1;
  if (body.x + r >= bounds.width && body.dirX > 0) body.dirX *= -1;
  if (body.y - r <= 0 && body.dirY < 0) body.dirY *= -1;
  if (body.y + r >= bounds.height && body.dirY > 0) body.dirY *= -1;
}

const SPEED = 0.1;

/** Advance position by velocity * elapsed time. */
export function step(body: PhysicsBody, deltaTime: number): void {
  body.x += body.dirX * SPEED * deltaTime;
  body.y += body.dirY * SPEED * deltaTime;
}

/** A random centre position such that the creature fits fully inside bounds. */
export function randomPosition(bounds: Bounds, size = BLOB_SIZE): { x: number; y: number } {
  const r = size / 2;
  return {
    x: r + Math.random() * (bounds.width - size),
    y: r + Math.random() * (bounds.height - size),
  };
}

/** A random unit-ish heading in [-1, 1] on each axis. */
export function randomHeading(): { dirX: number; dirY: number } {
  return { dirX: Math.random() * 2 - 1, dirY: Math.random() * 2 - 1 };
}
