import { genotypeString, type Genotype } from '../creatures/genetics';

type Props = {
  id: string;
  anchorName: string;
  genotype: Genotype;
};

export function AlleleBubble({ id, anchorName, genotype }: Props) {
  return (
    <div
      id={id}
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore — popover is a valid HTML attribute in React 19
      popover="manual"
      className="allele-bubble"
      style={{ positionAnchor: anchorName } as React.CSSProperties}
      role="tooltip"
    >
      {genotypeString(genotype)}
    </div>
  );
}
