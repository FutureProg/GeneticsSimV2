// DOM-writing helpers for a blob's wrapper element. Isolated from the physics
// loop and the registry so both can stay focused on their own bookkeeping.
import type { Phenotype } from '../creatures/genetics';

/** Writes a creature's phenotype (colour, scale) as CSS custom properties. */
export function applyPhenotypeStyle(element: HTMLDivElement, pheno: Phenotype): void {
  element.style.setProperty('--creature-colour', pheno.color ?? 'green');
  element.style.setProperty('--creature-scale', `${pheno.scale ?? 1}`);
}

// cx, cy are the blob's centre in screen px. The CSS wrapper recentres itself
// with translate(-50%, -50%), so we write the raw centre and let the box size
// (which tracks --creature-scale) take care of the offset for any scale.
export function setBlobPosition(element: HTMLDivElement, cx: number, cy: number): void {
  element.style.setProperty('--creature-x', `${cx}px`);
  element.style.setProperty('--creature-y', `${cy}px`);
}

export function setBlobSelected(element: HTMLDivElement, selected: boolean): void {
  element.classList.toggle('selected', selected);
}
