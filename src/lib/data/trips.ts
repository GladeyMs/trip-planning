import { readJson, updateJson, initCollection } from './json';
import {
  Day,
  Activity,
  Transportation,
  TripWithData,
  TripsCollection,
  CreateTrip,
  UpdateTrip,
  CreateDay,
  CreateActivity,
  UpdateActivity,
  CreateTransportation,
  UpdateTransportation,
} from '../schemas';
import dayjs from 'dayjs';

const TRIPS_FILE = 'trips.json';

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Initialize trips file
 */
export async function initTripsFile(): Promise<TripsCollection> {
  return initCollection<TripsCollection>(TRIPS_FILE, {
    version: 1,
    items: [],
  });
}

/**
 * Get all trips
 */
export async function getAllTrips(): Promise<TripWithData[]> {
  const collection = await readJson<TripsCollection>(TRIPS_FILE);
  if (!collection) {
    await initTripsFile();
    return [];
  }
  return collection.items;
}

/**
 * Get trip by ID
 */
export async function getTripById(id: string): Promise<TripWithData | null> {
  const trips = await getAllTrips();
  return trips.find((t) => t.id === id) || null;
}

/**
 * Create a new trip
 */
export async function createTrip(data: CreateTrip): Promise<TripWithData> {
  const now = dayjs().toISOString();
  const trip: TripWithData = {
    ...data,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
    days: [],
    activities: [],
    transports: [],
  };

  await updateJson<TripsCollection>(TRIPS_FILE, (current) => {
    const collection = current || { version: 1, items: [] };
    return {
      version: collection.version + 1,
      items: [...collection.items, trip],
    };
  });

  return trip;
}

/**
 * Update a trip
 */
export async function updateTrip(
  id: string,
  updates: Partial<UpdateTrip>
): Promise<TripWithData | null> {
  let updatedTrip: TripWithData | null = null;

  await updateJson<TripsCollection>(TRIPS_FILE, (current) => {
    if (!current) return { version: 1, items: [] };

    const items = current.items.map((trip) => {
      if (trip.id === id) {
        updatedTrip = {
          ...trip,
          ...updates,
          id: trip.id, // Ensure ID doesn't change
          updatedAt: dayjs().toISOString(),
        };
        return updatedTrip;
      }
      return trip;
    });

    return {
      version: current.version + 1,
      items,
    };
  });

  return updatedTrip;
}

/**
 * Update full trip with nested data
 */
export async function updateTripWithData(
  id: string,
  tripData: Partial<TripWithData>
): Promise<TripWithData | null> {
  let updatedTrip: TripWithData | null = null;

  await updateJson<TripsCollection>(TRIPS_FILE, (current) => {
    if (!current) return { version: 1, items: [] };

    const items = current.items.map((trip) => {
      if (trip.id === id) {
        updatedTrip = {
          ...trip,
          ...tripData,
          id: trip.id,
          updatedAt: dayjs().toISOString(),
        };
        return updatedTrip;
      }
      return trip;
    });

    return {
      version: current.version + 1,
      items,
    };
  });

  return updatedTrip;
}

/**
 * Delete a trip
 */
export async function deleteTrip(id: string): Promise<boolean> {
  let deleted = false;

  await updateJson<TripsCollection>(TRIPS_FILE, (current) => {
    if (!current) return { version: 1, items: [] };

    const items = current.items.filter((trip) => {
      if (trip.id === id) {
        deleted = true;
        return false;
      }
      return true;
    });

    return {
      version: current.version + 1,
      items,
    };
  });

  return deleted;
}

/**
 * Add a day to a trip
 */
export async function addDay(tripId: string, data: Omit<CreateDay, 'tripId'>): Promise<Day | null> {
  const day: Day = {
    ...data,
    id: generateId(),
    tripId,
  };

  const trip = await getTripById(tripId);
  if (!trip) return null;

  await updateTripWithData(tripId, {
    days: [...trip.days, day],
  });

  return day;
}

/**
 * Delete a day
 */
export async function deleteDay(dayId: string): Promise<boolean> {
  const trips = await getAllTrips();
  const trip = trips.find((t) => t.days.some((d) => d.id === dayId));
  if (!trip) return false;

  const updatedDays = trip.days.filter((d) => d.id !== dayId);
  const updatedActivities = trip.activities.filter((a) => a.dayId !== dayId);
  const updatedTransports = trip.transports.filter((t) => t.dayId !== dayId);

  await updateTripWithData(trip.id, {
    days: updatedDays,
    activities: updatedActivities,
    transports: updatedTransports,
  });

  return true;
}

/**
 * Reorder days
 */
export async function reorderDays(tripId: string, dayIds: string[]): Promise<boolean> {
  const trip = await getTripById(tripId);
  if (!trip) return false;

  const reorderedDays = dayIds
    .map((id, index) => {
      const day = trip.days.find((d) => d.id === id);
      return day ? { ...day, index } : null;
    })
    .filter((d): d is Day => d !== null);

  await updateTripWithData(tripId, { days: reorderedDays });
  return true;
}

/**
 * Add an activity
 */
export async function addActivity(
  dayId: string,
  data: Omit<CreateActivity, 'dayId'>
): Promise<Activity | null> {
  const trips = await getAllTrips();
  const trip = trips.find((t) => t.days.some((d) => d.id === dayId));
  if (!trip) return null;

  const activity: Activity = {
    ...data,
    id: generateId(),
    dayId,
  };

  await updateTripWithData(trip.id, {
    activities: [...trip.activities, activity],
  });

  return activity;
}

/**
 * Update an activity
 */
export async function updateActivity(
  id: string,
  updates: Partial<UpdateActivity>
): Promise<Activity | null> {
  const trips = await getAllTrips();
  const trip = trips.find((t) => t.activities.some((a) => a.id === id));
  if (!trip) return null;

  const updatedActivities = trip.activities.map((activity) =>
    activity.id === id ? { ...activity, ...updates, id: activity.id } : activity
  );

  await updateTripWithData(trip.id, {
    activities: updatedActivities,
  });

  return updatedActivities.find((a) => a.id === id) || null;
}

/**
 * Delete an activity
 */
export async function deleteActivity(id: string): Promise<boolean> {
  const trips = await getAllTrips();
  const trip = trips.find((t) => t.activities.some((a) => a.id === id));
  if (!trip) return false;

  const updatedActivities = trip.activities.filter((a) => a.id !== id);
  const updatedTransports = trip.transports.filter(
    (t) => t.fromActivityId !== id && t.toActivityId !== id
  );

  await updateTripWithData(trip.id, {
    activities: updatedActivities,
    transports: updatedTransports,
  });

  return true;
}

/**
 * Reorder activities within a day
 */
export async function reorderActivities(dayId: string, activityIds: string[]): Promise<boolean> {
  const trips = await getAllTrips();
  const trip = trips.find((t) => t.days.some((d) => d.id === dayId));
  if (!trip) return false;

  const updatedActivities = trip.activities.map((activity) => {
    if (activity.dayId === dayId) {
      const newOrder = activityIds.indexOf(activity.id);
      return newOrder >= 0 ? { ...activity, order: newOrder } : activity;
    }
    return activity;
  });

  await updateTripWithData(trip.id, {
    activities: updatedActivities,
  });

  return true;
}

/**
 * Add transportation
 */
export async function addTransportation(
  dayId: string,
  data: Omit<CreateTransportation, 'dayId'>
): Promise<Transportation | null> {
  const trips = await getAllTrips();
  const trip = trips.find((t) => t.days.some((d) => d.id === dayId));
  if (!trip) return null;

  const transport: Transportation = {
    ...data,
    id: generateId(),
    dayId,
  };

  await updateTripWithData(trip.id, {
    transports: [...trip.transports, transport],
  });

  return transport;
}

/**
 * Update transportation
 */
export async function updateTransportation(
  id: string,
  updates: Partial<UpdateTransportation>
): Promise<Transportation | null> {
  const trips = await getAllTrips();
  const trip = trips.find((t) => t.transports.some((tr) => tr.id === id));
  if (!trip) return null;

  const updatedTransports = trip.transports.map((transport) =>
    transport.id === id ? { ...transport, ...updates, id: transport.id } : transport
  );

  await updateTripWithData(trip.id, {
    transports: updatedTransports,
  });

  return updatedTransports.find((t) => t.id === id) || null;
}

/**
 * Delete transportation
 */
export async function deleteTransportation(id: string): Promise<boolean> {
  const trips = await getAllTrips();
  const trip = trips.find((t) => t.transports.some((tr) => tr.id === id));
  if (!trip) return false;

  const updatedTransports = trip.transports.filter((t) => t.id !== id);

  await updateTripWithData(trip.id, {
    transports: updatedTransports,
  });

  return true;
}
