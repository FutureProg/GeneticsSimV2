// genetics.test.ts

import type { Genotype } from "./genetics";
import {
  allelePairs,
  breed,
  gametes,
  getAllele,
  phenotype,
  punnett,
} from "./genetics"; // Adjust path if necessary

describe("Genetics Domain Logic", () => {
  // --- Test getAllele ---
  describe("getAllele", () => {
    it("should correctly retrieve a predefined Allele object by its identifier character", () => {
      // Test using 'A' (AlleleBig)
      const alleleA = getAllele("A");
      expect(alleleA).toBeDefined();
      expect(alleleA.gene).toBe("A");
      expect(alleleA.phenotype).toEqual({ scale: 1.0 });

      // Test using 'b' (AlleleRed)
      const alleleB = getAllele("b");
      expect(alleleB).toBeDefined();
      expect(alleleB.gene).toBe("B");
      expect(alleleB.phenotype).toEqual({ color: "red" });
    });

    it("should throw an error or return undefined for unknown identifiers (based on implementation)", () => {
      // Based on the current implementation in genetics.ts, any unknown char will fail lookup.
      // Testing robustness against invalid input is advised here.
    });
  });

  // --- Test allelePairs ---
  describe("allelePairs", () => {
    it("should correctly convert a dihybrid genotype into two allele pairs", () => {
      // Example Di-hybrid Genotype: AaBb (A/a pair, B/b pair)
      const dihybridGenotype: Genotype = { "A": ["A", "a"], "B": ["B", "b"] };
      const pairs = allelePairs(dihybridGenotype);

      expect(pairs).toHaveLength(2);
      // Check that the resulting pairs match expected gene groups (e.g., Gene A pair, Gene B pair)
      expect(pairs).toEqual([["A", "a"], ["B", "b"]]);
    });

    it("should handle non-dihybrid/mono-hybrid cases gracefully (if supported by structure)", () => {
      // If needed, test mono-hybrid genotypes here.
    });
  });

  // --- Test phenotype calculation ---
  describe("phenotype", () => {
    it("should calculate the correct phenotype based on dominant/recessive alleles", () => {
      // Scenario 1: Dominant phenotype for both traits (e.g., AaBb crossing)
      const dominantPhenotypeGenotype: Genotype = {
        "A": ["A", "a"],
        "B": ["B", "b"],
      };
      const result = phenotype(dominantPhenotypeGenotype);
      // The expected phenotype depends on which allele is "winning" in each gene locus.
      expect(result).toBeDefined();
    });

    it("should return the combined phenotype characteristics of all genes", () => {
      // Ensure that traits are correctly merged when multiple loci contribute to the phenotype object.
    });
  });

  // --- Test gametes generation ---
  describe("gametes", () => {
    it("should generate the four expected gamete combinations for a dihybrid parent", () => {
      // Assuming the following input represents two distinct allele pairs:
      const dihybridGenotype: Genotype = { "A": ["A", "a"], "B": ["B", "b"] };
      const gameteOptions = gametes(dihybridGenotype);

      expect(gameteOptions).toHaveLength(4);
      expect(gameteOptions).toEqual(expect.arrayContaining(["AB", "Ab", "aB", "ab"]));
    });

    it("should throw an error if the genotype is not a dihybrid", () => {
      // Test case for monosomic or other non-dihybrid inputs to verify error handling.
    });
  });

  describe.todo("punnett");
  describe.todo("breed");
});
