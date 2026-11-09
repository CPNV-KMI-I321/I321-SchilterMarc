import { db } from '../config/database.js';

export function findAll() {
  return db.prepare(
      'SELECT * FROM ingredients ORDER BY id'
  ).all();
}

export function findById(id) {
  return db.prepare(
      'SELECT * FROM ingredients WHERE id = ?'
  ).get(id) ?? null;
}

export function create(data) {
  const result = db.prepare(`
    INSERT INTO ingredients (name, price)
    VALUES (?, ?)
  `).run(
      data.name,
      data.price
  );

  return findById(Number(result.lastInsertRowid));
}

export function update(id, data) {
  const result = db.prepare(`
    UPDATE ingredients
    SET name = ?,
        price = ?
    WHERE id = ?
  `).run(
      data.name,
      data.price,
      id
  );

  if (result.changes === 0) {
    return null;
  }

  return findById(id);
}

export function remove(id) {
  const result = db.prepare(
      'DELETE FROM ingredients WHERE id = ?'
  ).run(id);

  return result.changes > 0;
}