import { createCreature } from "./Creature";
import { genotypeFromString } from "./genetics";
import { createGenerationTree } from "./generationTree";

const founders = [
  createCreature(genotypeFromString("AaBb"), "c1"),
  createCreature(genotypeFromString("aabb"), "c2"),
];

describe("createGenerationTree", () => {
  it("starts with the seeded creatures as the active generation", () => {
    const tree = createGenerationTree(founders);

    const active = tree.getActiveGeneration();
    expect(active.creatures).toEqual(founders);
    expect(active.parentId).toBeNull();
    expect(tree.getActiveNodeId()).toBe(active.id);
  });

  it("adds a new generation as a child of the active generation and makes it active", () => {
    const tree = createGenerationTree(founders);
    const rootId = tree.getActiveNodeId();
    const offspring = [createCreature(genotypeFromString("AaBb"), "c3")];

    const child = tree.addGeneration(offspring);

    expect(child.creatures).toEqual(offspring);
    expect(child.parentId).toBe(rootId);
    expect(tree.getActiveNodeId()).toBe(child.id);
  });

  it("moves the active pointer with goToGeneration without deleting anything", () => {
    const tree = createGenerationTree(founders);
    const rootId = tree.getActiveNodeId();
    expect(rootId).not.toBeNull();
    tree.addGeneration([createCreature(genotypeFromString("AaBb"), "c3")]);

    tree.goToGeneration(rootId!);

    expect(tree.getActiveNodeId()).toBe(rootId);
    expect(tree.getActiveGeneration().creatures).toEqual(founders);
  });

  it("keeps both branches when breeding again after going back", () => {
    const tree = createGenerationTree(founders);
    const rootId = tree.getActiveNodeId();
    expect(rootId).not.toBeNull();
    const firstChild = tree.addGeneration([createCreature(genotypeFromString("AaBb"), "c3")]);

    tree.goToGeneration(rootId!);
    const secondChild = tree.addGeneration([createCreature(genotypeFromString("aabb"), "c4")]);

    expect(tree.getChildren(rootId!)).toEqual(
      expect.arrayContaining([firstChild, secondChild])
    );
    expect(tree.getGeneration(firstChild.id)).toEqual(firstChild);
  });

  it("returns the ancestor chain from root to the given generation via getPath", () => {
    const tree = createGenerationTree(founders);
    const root = tree.getActiveGeneration();
    const child = tree.addGeneration([createCreature(genotypeFromString("AaBb"), "c3")]);
    const grandchild = tree.addGeneration([createCreature(genotypeFromString("aabb"), "c4")]);

    expect(tree.getPath(grandchild.id)).toEqual([root, child, grandchild]);
  });

  it("throws when going to a generation id that doesn't exist", () => {
    const tree = createGenerationTree(founders);

    expect(() => tree.goToGeneration("does-not-exist")).toThrow();
  });

  it("throws when looking up a generation id that doesn't exist", async () => {
    const tree = createGenerationTree(founders);

    expect(() => tree.getGeneration("does-not-exist")).toThrow();
  });

  it("returns an empty array of children for a generation with no offspring yet", () => {
    const tree = createGenerationTree(founders);
    const rootId = tree.getActiveNodeId();

    expect(tree.getChildren(rootId!)).toEqual([]);
  });

  it("throws when computing the path for a generation id that doesn't exist", () => {
    const tree = createGenerationTree(founders);

    expect(() => tree.getPath("does-not-exist")).toThrow();
  });
});
