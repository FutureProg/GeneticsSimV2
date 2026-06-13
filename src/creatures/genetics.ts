// PLACEHOLDER genetics domain.
//
// The real Mendelian model — allele pairs, dominant/recessive expression into a
// phenotype, dihybrid Punnett generation, and breeding — is NOT implemented yet.
// See CLAUDE.md ("Refactoring direction"). This file exists so the presentation
// layer can be wired against real types and swapped to a real implementation
// later without touching components.

/** e.g. "AaBb". A bare string for now; will become a structured type. */
export type Genotype = string;

/**
 * Split a genotype string into its allele pairs, e.g. "AaBb" -> ["Aa", "Bb"].
 * Placeholder: assumes well-formed two-character pairs.
 */
export function allelePairs(genotype: Genotype): string[] {
  const pairs: string[] = [];
  for (let i = 0; i < genotype.length; i += 2) pairs.push(genotype.slice(i, i + 2));
  return pairs;
}

/** The four gamete combinations a dihybrid parent can contribute. Placeholder. */
export function gametes(genotype: Genotype): string[] {
  // TODO: derive from genotype. Hard-coded dihybrid markers for layout only.
  void genotype;
  return ['AB', 'Ab', 'aB', 'ab'];
}

/** TODO: build the Punnett grid of offspring genotypes for parentA × parentB. */
export function punnett(a: Genotype, b: Genotype): never {
  void a;
  void b;
  throw new Error('punnett() not implemented — genetics domain is a placeholder');
}

/** TODO: produce an offspring genotype from two parents. */
export function breed(a: Genotype, b: Genotype): never {
  void a;
  void b;
  throw new Error('breed() not implemented — genetics domain is a placeholder');
}
