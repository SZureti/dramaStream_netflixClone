import { readJSON, writeJSON } from '../lib/storage.js';

const KEY = 'dramastream:billboard:v1';
let thisVisit = null; // one pick per page load, so the billboard doesn't change mid-visit

/**
 * The billboard shows the database's featured title on a viewer's first
 * visit, then a different title each later visit, cycling through the
 * catalog the profile may see.
 */
export function pickBillboard(catalog, featuredId) {
  if (!catalog.length) return null;
  if (thisVisit === null) {
    const seen = readJSON(KEY, null);
    thisVisit = typeof seen === 'number' ? seen + 1 : 0;
    writeJSON(KEY, thisVisit);
  }
  if (thisVisit === 0) return catalog.find((t) => t.id === featuredId) ?? catalog[0];
  return catalog[thisVisit % catalog.length];
}
