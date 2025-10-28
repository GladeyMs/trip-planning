import { readJson, updateJson, initCollection } from './json';
import { Place, PlacesCache } from '../schemas';

const PLACES_FILE = 'places_cache.json';

export async function initPlacesCache(): Promise<PlacesCache> {
  return initCollection<PlacesCache>(PLACES_FILE, { version: 1, items: [] });
}

export async function getAllPlaces(): Promise<Place[]> {
  const cache = await readJson<PlacesCache>(PLACES_FILE);
  if (!cache) {
    await initPlacesCache();
    return [];
  }
  return cache.items;
}

export async function getPlaceById(id: string): Promise<Place | null> {
  const places = await getAllPlaces();
  return places.find((p) => p.id === id) || null;
}

export async function upsertPlace(place: Place): Promise<Place> {
  await updateJson<PlacesCache>(PLACES_FILE, (current) => {
    const cache = current || { version: 1, items: [] };
    const existingIndex = cache.items.findIndex((p) => p.id === place.id);
    if (existingIndex >= 0) {
      cache.items[existingIndex] = place;
    } else {
      cache.items.push(place);
    }
    return { version: cache.version + 1, items: cache.items };
  });
  return place;
}

export async function searchPlaces(query: string): Promise<Place[]> {
  const places = await getAllPlaces();
  const lowerQuery = query.toLowerCase();
  return places.filter(
    (p) =>
      p.name.toLowerCase().includes(lowerQuery) || p.address?.toLowerCase().includes(lowerQuery)
  );
}
