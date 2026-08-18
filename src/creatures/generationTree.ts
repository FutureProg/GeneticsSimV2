import type { Creature } from "./Creature";

export type GenerationNode = {
  id: string;
  friendlyName: string;
  creatures: Creature[];
  parentId: string | null;
};

export const createGenerationTree = (founders: Creature[]) => {
  const generationMap = new Map<string, GenerationNode>();

  let activeId: string | null = null;
  /**
   * Adds a new generation as a child of the currently active generation and
   * makes it active. Does not touch sibling branches.
   */
  const addGeneration = (offspring: Creature[]): GenerationNode => {
    const node: GenerationNode = {
      creatures: offspring,
      id: crypto.randomUUID(),
      parentId: activeId,
      friendlyName: `F${generationMap.size}`,
    };
    generationMap.set(node.id, node);
    goToGeneration(node.id);
    return node;
  };

  /**
   * Moves the active pointer to an existing generation. Does not delete or
   * otherwise modify any branch.
   */
  const goToGeneration = (id: string): void => {
    if (!generationMap.has(id)) {
      throw new Error(`Cannot change active generation: Generation \`${id}\` does not exist!`)
    }
    activeId = id;
  };

  const getActiveNodeId = (): string | null => {
    return activeId;
  };

  const getActiveGeneration = (): GenerationNode => {
    if (!activeId) {
      throw new Error("Not active generation has been set!");
    }
    return getGeneration(activeId)!;
  };

  const getGeneration = (id: string): GenerationNode => {
    if (!generationMap.has(id)) {
      throw new Error(`Generation with id \`${id}\` does not exist!`);
    }
    return generationMap.get(id)!;
  };

  /** Direct children of the given generation, in breed order. */
  const getChildren = (id: string): GenerationNode[] => {
    // Simple implementation for now, just to get something and since it shouldn't happen too often.
    // Reversing the tree to find the children could be better in the future,
    // but might be more expensive
    return [...generationMap.values()]
      .filter((val) => val.parentId === id)
      .sort((a,b) => a.id.localeCompare(b.id)); // for determinism
  };

  /** Ancestor chain from the root generation down to (and including) id. */
  const getPath = (id: string): GenerationNode[] => {
    let currentNode = getGeneration(id);
    const nodePath = [currentNode];
    while(currentNode?.parentId) {      
      currentNode = getGeneration(currentNode!.parentId);      
      nodePath.push(currentNode);
    }
    return nodePath.reverse();
  };

  /** Initialization -- add a new generation, being the root */
  addGeneration(founders);

  return {
    addGeneration,
    goToGeneration,
    getActiveNodeId,
    getActiveGeneration,
    getGeneration,
    getChildren,
    getPath,
  };
};

export type GenerationTree = ReturnType<typeof createGenerationTree>;
