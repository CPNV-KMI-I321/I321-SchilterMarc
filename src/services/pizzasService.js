import { db } from '../config/database.js';
import * as Pizza from '../entities/Pizza.js';
import * as PizzaComposition from '../entities/PizzaComposition.js';
import * as IngredientsService from './ingredientsService.js';
import { fail, validateId, validatePizza } from '../validation.js';

function withComposition(pizza) {
  return { ...pizza, ingredientIds: PizzaComposition.ingredientIds(pizza.id) };
}

function inTransaction(operation) {
  db.exec('BEGIN IMMEDIATE');
  try {
    const result = operation();
    db.exec('COMMIT');
    return result;
  } catch (error) {
    try {
      db.exec('ROLLBACK');
    } catch {
      // Keep the original database or validation error.
    }
    if (/UNIQUE constraint failed: pizzas\.name/i.test(error.message)) {
      fail(409, 'Une pizza porte déjà ce nom.');
    }
    throw error;
  }
}

function validatedPizza(body) {
  return { ...validatePizza(body), ingredientIds: body?.ingredientIds };
}

export function list() {
  return Pizza.findAll().map(withComposition);
}

export function get(id) {
  const pizza = Pizza.findById(validateId(id));
  if (!pizza) fail(404, 'Pizza introuvable.');
  return withComposition(pizza);
}

export function create(body) {
  const input = validatedPizza(body);
  return inTransaction(() => {
    IngredientsService.ensureExist(input.ingredientIds);
    if (Pizza.findByName(input.name)) fail(409, 'Une pizza porte déjà ce nom.');
    const pizza = Pizza.create(input);
    PizzaComposition.replace(pizza.id, input.ingredientIds);
    return withComposition(pizza);
  });
}

export function update(id, body) {
  const pizzaId = validateId(id);
  if (!Pizza.findById(pizzaId)) fail(404, 'Pizza introuvable.');
  const input = validatedPizza(body);
  return inTransaction(() => {
    IngredientsService.ensureExist(input.ingredientIds);
    const existing = Pizza.findByName(input.name);
    if (existing && existing.id !== pizzaId) fail(409, 'Une pizza porte déjà ce nom.');
    const pizza = Pizza.update(pizzaId, input);
    PizzaComposition.replace(pizzaId, input.ingredientIds);
    return withComposition(pizza);
  });
}

export function remove(id) {
  const pizzaId = validateId(id);
  if (!Pizza.remove(pizzaId)) fail(404, 'Pizza introuvable.');
  return true;
}
