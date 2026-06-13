import { allelePairs, type Genotype } from '../creatures/genetics';

/**
 * Speech-bubble tooltip that reveals a creature's alleles on hover (Figma
 * "Basic - 1"). Rendered as a child of the blob wrapper so it inherits the
 * per-frame transform for free — no React re-render to follow the moving blob.
 * Shown/hidden purely via CSS (.blob:hover .allele-bubble).
 */
export function AlleleBubble({ genotype }: { genotype: Genotype }) {
  return (
    <div className="allele-bubble" role="tooltip">
      {allelePairs(genotype).join(' ')}
    </div>
  );
}
