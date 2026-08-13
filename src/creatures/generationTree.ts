import type { Creature } from "./Creature";

export type GenerationNode = {
  id: string;
  friendlyName: string;
  creatures: Creature[];
  parentId: string | null;
};

export const createGenerationTree = (founders: Creature[]) => {
  const generationMap = new Map<string, GenerationNode>();
  
    /**
   * Adds a new generation as a child of the currently active generation and
   * makes it active. Does not touch sibling branches.
   */
  const addGeneration = (offspring: Creature[]): GenerationNode => {
    throw new Error("not implemented");
  };

  /**
   * Moves the active pointer to an existing generation. Does not delete or
   * otherwise modify any branch.
   */
  const goToGeneration = (id: string): void => {
    throw new Error("not implemented");
  };

  const getActiveNodeId = (): string => {
    throw new Error("not implemented");
  };

  const getActiveGeneration = (): GenerationNode => {
    throw new Error("not implemented");
  };

  const getGeneration = (id: string): GenerationNode | undefined => {
    throw new Error("not implemented");
  };

  /** Direct children of the given generation, in breed order. */
  const getChildren = (id: string): GenerationNode[] => {
    throw new Error("not implemented");
  };

  /** Ancestor chain from the root generation down to (and including) id. */
  const getPath = (id: string): GenerationNode[] => {
    throw new Error("not implemented");
  };

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
