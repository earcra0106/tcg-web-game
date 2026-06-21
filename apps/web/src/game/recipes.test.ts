import { describe, expect, it } from 'vitest';
import {
  findCookableRecipe,
  findRecipeByOutput,
  findRecipesForMachine,
  getProcessForMachine,
  getRecipes,
  getServableRecipes,
  normalizeFoodIds,
} from './recipes.ts';

describe('recipes', () => {
  it('extracts only processed foods as recipes', () => {
    const recipes = getRecipes();

    expect(recipes).toContainEqual(
      expect.objectContaining({
        id: 'cooked-rice',
        process: 'heating',
        inputFoodIds: ['rice'],
        outputFoodId: 'cooked-rice',
      }),
    );
    expect(recipes.map((recipe) => recipe.id)).not.toContain('rice');
  });

  it('maps production machines to cooking processes', () => {
    expect(getProcessForMachine('cutter')).toBe('cutting');
    expect(getProcessForMachine('heater')).toBe('heating');
    expect(getProcessForMachine('mixer')).toBe('mixing');
    expect(getProcessForMachine('combiner')).toBe('combining');
    expect(getProcessForMachine('splitter')).toBeNull();
    expect(getProcessForMachine('trash-bin')).toBeNull();
  });

  it('returns recipes that a machine can process', () => {
    expect(findRecipesForMachine('heater')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'cooked-rice' }),
        expect.objectContaining({ id: 'toast' }),
      ]),
    );
    expect(findRecipesForMachine('splitter')).toEqual([]);
  });

  it('normalizes input food ids for order-independent comparison', () => {
    expect(normalizeFoodIds(['sliced-tomato', 'chopped-lettuce'])).toEqual([
      'chopped-lettuce',
      'sliced-tomato',
    ]);
  });

  it('finds a recipe from machine and unordered inputs', () => {
    expect(
      findCookableRecipe({
        machineId: 'combiner',
        inputFoodIds: ['sliced-tomato', 'chopped-lettuce'],
      }),
    ).toMatchObject({
      id: 'salad',
      outputFoodId: 'salad',
    });
  });

  it('prioritizes an explicitly requested recipe', () => {
    expect(
      findCookableRecipe({
        machineId: 'heater',
        inputFoodIds: ['egg'],
        recipeId: 'fried-egg',
      }),
    ).toMatchObject({
      id: 'fried-egg',
    });
  });

  it('rejects requested recipes that do not match machine or inputs', () => {
    expect(
      findCookableRecipe({
        machineId: 'cutter',
        inputFoodIds: ['egg'],
        recipeId: 'fried-egg',
      }),
    ).toBeNull();
  });

  it('filters recipes that can be served as stage goals', () => {
    const servableRecipes = getServableRecipes();

    expect(servableRecipes.every((recipe) => recipe.canBeServed)).toBe(true);
    expect(servableRecipes.map((recipe) => recipe.id)).not.toContain(
      'boiled-egg',
    );
  });

  it('finds recipes by output food id', () => {
    expect(findRecipeByOutput('toast')).toMatchObject({
      id: 'toast',
      name: 'トースト',
    });
  });
});
