import { z } from 'zod'

// Base schemas
export const TripSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  destination: z.string().min(1, 'Destination is required'),
  startDate: z.string(), // ISO date string
  endDate: z.string(), // ISO date string
  currency: z.string().default('USD'),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const DaySchema = z.object({
  id: z.string(),
  tripId: z.string(),
  date: z.string(), // ISO date string
  index: z.number(),
})

export const TransportModeSchema = z.enum([
  'walk',
  'bike',
  'scooter',
  'car',
  'taxi',
  'bus',
  'train',
  'metro',
  'ferry',
  'flight',
  'other',
])

export const ActivitySchema = z.object({
  id: z.string(),
  dayId: z.string(),
  title: z.string().min(1, 'Title is required'),
  notes: z.string().optional(),
  startTime: z.string().optional(), // HH:mm format
  endTime: z.string().optional(), // HH:mm format
  cost: z.number().optional(),
  category: z.string().optional(),
  placeId: z.string().optional(),
  order: z.number(),
  // Location information
  location: z
    .object({
      name: z.string().optional(),
      lat: z.number().optional(),
      lng: z.number().optional(),
      address: z.string().optional(),
      mapLink: z.string().optional(), // Google Maps or other map URL
    })
    .optional(),
  // Transport to this activity (from previous activity or location)
  transport: z
    .object({
      mode: TransportModeSchema.optional(),
      provider: z.string().optional(),
      departTime: z.string().optional(), // HH:mm format
      arriveTime: z.string().optional(), // HH:mm format
      distanceKm: z.number().optional(),
      durationMin: z.number().optional(),
      cost: z.number().optional(),
      notes: z.string().optional(),
    })
    .optional(),
})

export const TransportationSchema = z.object({
  id: z.string(),
  dayId: z.string(),
  fromActivityId: z.string().optional(),
  toActivityId: z.string().optional(),
  mode: TransportModeSchema,
  provider: z.string().optional(),
  departTime: z.string().optional(), // HH:mm format
  arriveTime: z.string().optional(), // HH:mm format
  distanceKm: z.number().optional(),
  durationMin: z.number().optional(),
  cost: z.number().optional(),
  notes: z.string().optional(),
})

export const PlaceProviderSchema = z.enum(['opentripmap', 'custom'])

export const PlaceSchema = z.object({
  id: z.string(),
  externalId: z.string().optional(),
  name: z.string(),
  lat: z.number(),
  lng: z.number(),
  address: z.string().optional(),
  provider: PlaceProviderSchema,
  metadata: z.any().optional(),
})

// Full trip with nested data
export const TripWithDataSchema = TripSchema.extend({
  days: z.array(DaySchema),
  activities: z.array(ActivitySchema),
  transports: z.array(TransportationSchema),
})

// Collection wrapper
export const TripsCollectionSchema = z.object({
  version: z.number(),
  items: z.array(TripWithDataSchema),
})

export const PlacesCacheSchema = z.object({
  version: z.number(),
  items: z.array(PlaceSchema),
})

export const SettingsSchema = z.object({
  version: z.number(),
  defaultCurrency: z.string().default('USD'),
  mapboxToken: z.string().optional(),
})

// TypeScript types
export type Trip = z.infer<typeof TripSchema>
export type Day = z.infer<typeof DaySchema>
export type Activity = z.infer<typeof ActivitySchema>
export type Transportation = z.infer<typeof TransportationSchema>
export type TransportMode = z.infer<typeof TransportModeSchema>
export type Place = z.infer<typeof PlaceSchema>
export type PlaceProvider = z.infer<typeof PlaceProviderSchema>
export type TripWithData = z.infer<typeof TripWithDataSchema>
export type TripsCollection = z.infer<typeof TripsCollectionSchema>
export type PlacesCache = z.infer<typeof PlacesCacheSchema>
export type Settings = z.infer<typeof SettingsSchema>

// Create/Update DTOs
export const CreateTripSchema = TripSchema.omit({ id: true, createdAt: true, updatedAt: true })
export const UpdateTripSchema = TripSchema.partial().required({ id: true })
export const CreateDaySchema = DaySchema.omit({ id: true })
export const CreateActivitySchema = ActivitySchema.omit({ id: true })
export const UpdateActivitySchema = ActivitySchema.partial().required({ id: true })
export const CreateTransportationSchema = TransportationSchema.omit({ id: true })
export const UpdateTransportationSchema = TransportationSchema.partial().required({ id: true })

export type CreateTrip = z.infer<typeof CreateTripSchema>
export type UpdateTrip = z.infer<typeof UpdateTripSchema>
export type CreateDay = z.infer<typeof CreateDaySchema>
export type CreateActivity = z.infer<typeof CreateActivitySchema>
export type UpdateActivity = z.infer<typeof UpdateActivitySchema>
export type CreateTransportation = z.infer<typeof CreateTransportationSchema>
export type UpdateTransportation = z.infer<typeof UpdateTransportationSchema>
