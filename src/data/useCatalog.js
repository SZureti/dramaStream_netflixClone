import { useSyncExternalStore } from 'react';
import { getCatalogSnapshot, subscribeCatalog } from './catalog.js';

/** Re-renders the caller whenever the catalog is swapped (local → Supabase). */
export default function useCatalog() {
  return useSyncExternalStore(subscribeCatalog, getCatalogSnapshot);
}
