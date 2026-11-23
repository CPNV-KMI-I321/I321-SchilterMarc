import { fail } from '../validation.js';

export async function ensureExist(ids) {
  const baseUrl = (
    process.env.INGREDIENTS_API_URL || 'http://localhost:3002'
  ).replace(/\/+$/, '');

  const configuredTimeout = Number(process.env.HTTP_TIMEOUT_MS);
  const timeoutMs = Number.isFinite(configuredTimeout) && configuredTimeout > 0
    ? configuredTimeout
    : 2000;

  for (const id of ids) {
    let response;

    // Appel HTTP vers l'API Ingrédients
    try {
      response = await fetch(`${baseUrl}/api/ingredients/${id}`, {
        signal: AbortSignal.timeout(timeoutMs)
      });
    } catch {
      fail(503, 'Le service Ingrédients est indisponible.');
    }

    // Un ingrédient inexistant est une erreur métier
    if (response.status === 404) {
      fail(400, `L'ingrédient ${id} n'existe pas.`);
    }

    // Toute autre réponse HTTP non réussie indique un problème du service
    if (!response.ok) {
      fail(503, 'Le service Ingrédients est indisponible.');
    }

    // Vérifier que la réponse contient un JSON valide
    let ingredient;

    try {
      ingredient = await response.json();
    } catch {
      fail(503, 'Réponse JSON invalide du service Ingrédients.');
    }

    // Vérifier que l'identifiant reçu correspond à celui demandé
    if (
      !ingredient ||
      typeof ingredient !== 'object' ||
      Array.isArray(ingredient) ||
      ingredient.id !== id
    ) {
      fail(503, 'Réponse invalide du service Ingrédients.');
    }
  }
}