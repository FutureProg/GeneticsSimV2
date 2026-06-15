// PLACEHOLDER genetics domain.
//
// The real Mendelian model — allele pairs, dominant/recessive expression into a
// phenotype, dihybrid Punnett generation, and breeding — is NOT implemented yet.
// See CLAUDE.md ("Refactoring direction"). This file exists so the presentation
// layer can be wired against real types and swapped to a real implementation
// later without touching components.

/** e.g. "AaBb". A bare string for now; will become a structured type. */
export type Phenotype = {
  color?: string;
  scale?: number;
};

type AlleleChar<G extends string> = Uppercase<G> | Lowercase<G>;
export type AlleleIdentifier = AlleleChar<'A' | 'B'>; // e.g. "A" or "a"

export type Allele = {
  dominant: boolean; // e.g. A=true, a=false
  gene: AlleleIdentifier; // e.g. "A"
  variant: AlleleIdentifier; // e.g. "a"
  phenotype: Phenotype;
}

export type Genotype<Genes extends string = 'A' | 'B'> = {
  [G in Genes]: [AlleleChar<G>, AlleleChar<G>];
};


export const AlleleBlue: Allele = {
  dominant: true,
  gene: 'B',
  variant: 'b',
  phenotype: { color: 'blue' },
}

export const AlleleRed: Allele = {
  dominant: false,
  gene: 'B',
  variant: 'b',
  phenotype: { color: 'red' },
}

export const AlleleBig: Allele = {
  dominant: true,
  gene: 'A',
  variant: 'a',
  phenotype: { scale: 1.0 },
}

export const AlleleSmall: Allele = {
  dominant: false,
  gene: 'A',
  variant: 'a',
  phenotype: { scale: 0.5 },
}

const AlleleMap = {
  A: AlleleBig,
  a: AlleleSmall,
  B: AlleleBlue,
  b: AlleleRed,
} as const;

export function getAllele(alleleChar: AlleleIdentifier): Allele {
  return AlleleMap[alleleChar];
}

/**
 * Split a genotype string into its allele pairs, e.g. "AaBb" -> ["Aa", "Bb"].
 */
export function allelePairs(genotype: Genotype): AlleleIdentifier[][] {
  const pairs: AlleleIdentifier[][] = [];
  for (const gene in genotype) {
    const alleles = genotype[gene as keyof Genotype];
    pairs.push([...alleles]);
  }
  return pairs;
}

/** The four gamete combinations a dihybrid parent can contribute. */
export function gametes(genotype: Genotype): string[] {
  const pairs = allelePairs(genotype);
  if (pairs.length !== 2) {
    throw new Error(`gametes() only supports dihybrids for now; got ${pairs.length} pairs`);
  }
  const [pairA, pairB] = pairs;
  return [
    pairA[0] + pairB[0],
    pairA[0] + pairB[1],
    pairA[1] + pairB[0],
    pairA[1] + pairB[1],
  ];
}

export function genotypeString(genotype: Genotype): string {
  return [...genotype['A'], ...genotype['B']].join('');
}

export function phenotype(genotype: Genotype): Phenotype {
  const pairs = allelePairs(genotype);
  let phenotype: Phenotype = {};
  for (const pair of pairs) {
    const dominant = pair.find(a => getAllele(a).dominant);
    const winner = dominant ?? pair[0];
    phenotype = { ...phenotype, ...getAllele(winner).phenotype };
  }
  return phenotype;
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
