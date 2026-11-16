import * as Ingredient from '../entities/Ingredient.js';
import * as PizzaComposition from '../entities/PizzaComposition.js';
import { fail, validateId, validateIngredient, validateIngredientIds } from '../validation.js';

export function list() {
  return Ingredient.findAll();
}

export function get(id) {
  const ingredient = Ingredient.findById(validateId(id));
  if (!ingredient) fail(404, 'Ingredient introuvable.');
  return ingredient;
}

export function create(body) {
  return Ingredient.create(validateIngredient(body));
}

export function update(id, body) {
  const ingredientId = validateId(id);
  if (!Ingredient.findById(ingredientId)) fail(404, 'Ingredient introuvable.');
  return Ingredient.update(ingredientId, validateIngredient(body));
}

export function remove(id) {
  const ingredientId = validateId(id);
  if (!Ingredient.findById(ingredientId)) fail(404, 'Ingredient introuvable.');
  if (PizzaComposition.isUsed(ingredientId)) {
    fail(409, 'Cet ingrédient est utilisé par une pizza.');
  }
  return Ingredient.remove(ingredientId);
}

export function ensureExist(ids) {
  const ingredientIds = validateIngredientIds(ids);
  if (ingredientIds.some(id => !Ingredient.findById(id))) {
    fail(400, 'Un ou plusieurs ingrédients sont introuvables.');
  }
  return ingredientIds;
}
