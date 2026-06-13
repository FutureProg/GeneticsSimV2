type Props = {
  /** Both actions need exactly two selected parents. */
  canAct: boolean;
  onBreed: () => void;
  onPunnett: () => void;
};

/** Breed / Punnett Square actions, disabled until two parents are selected. */
export function ActionButtons({ canAct, onBreed, onPunnett }: Props) {
  return (
    <div id="action-buttons">
      <button onClick={onBreed} disabled={!canAct}>
        Breed
      </button>
      <button onClick={onPunnett} disabled={!canAct}>
        Punnett Square
      </button>
    </div>
  );
}
