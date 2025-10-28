import { TransportMode } from '../schemas';

export function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

const DEFAULT_SPEEDS: Record<TransportMode, number> = {
  walk: 4,
  bike: 15,
  scooter: 20,
  car: 35,
  taxi: 35,
  bus: 25,
  train: 50,
  metro: 50,
  ferry: 25,
  flight: 700,
  other: 30,
};

const FIXED_OVERHEAD: Partial<Record<TransportMode, number>> = {
  flight: 120,
  ferry: 30,
};

export function estimateDurationMin(mode: TransportMode, distanceKm: number): number {
  const speed = DEFAULT_SPEEDS[mode] || 30;
  const travelTimeMin = (distanceKm / speed) * 60;
  const overhead = FIXED_OVERHEAD[mode] || 0;
  return Math.round(travelTimeMin + overhead);
}

export function getDefaultSpeed(mode: TransportMode): number {
  return DEFAULT_SPEEDS[mode] || 30;
}

export function calculateArriveTime(departTime: string, durationMin: number): string {
  const [hours, minutes] = departTime.split(':').map(Number);
  const departMinutes = hours * 60 + minutes;
  const arriveMinutes = departMinutes + durationMin;
  const arriveHours = Math.floor(arriveMinutes / 60) % 24;
  const arriveMin = arriveMinutes % 60;
  return `${String(arriveHours).padStart(2, '0')}:${String(arriveMin).padStart(2, '0')}`;
}

export function calculateDepartTime(arriveTime: string, durationMin: number): string {
  const [hours, minutes] = arriveTime.split(':').map(Number);
  const arriveMinutes = hours * 60 + minutes;
  const departMinutes = arriveMinutes - durationMin;
  const departHours = Math.floor((departMinutes + 24 * 60) / 60) % 24;
  const departMin = ((departMinutes % 60) + 60) % 60;
  return `${String(departHours).padStart(2, '0')}:${String(departMin).padStart(2, '0')}`;
}
