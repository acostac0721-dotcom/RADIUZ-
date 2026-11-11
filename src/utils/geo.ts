import { Coordinates } from '../types';

/**
 * Calculates distance in miles between two coordinates using the Haversine formula
 */
export function calculateDistanceMiles(coord1: Coordinates, coord2: Coordinates): number {
  const R = 3958.8; // Earth's radius in miles
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLon = toRad(coord2.lng - coord1.lng);
  const lat1 = toRad(coord1.lat);
  const lat2 = toRad(coord2.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Estimates walking time in minutes based on distance in miles (~20 min/mile average walking speed)
 */
export function estimateWalkMinutes(distanceMiles: number): number {
  const walkMinutes = Math.round(distanceMiles * 18);
  return Math.max(2, walkMinutes);
}

/**
 * Calculates initial bearing in degrees from point 1 to point 2
 */
export function calculateBearing(coord1: Coordinates, coord2: Coordinates): number {
  const y = Math.sin(toRad(coord2.lng - coord1.lng)) * Math.cos(toRad(coord2.lat));
  const x =
    Math.cos(toRad(coord1.lat)) * Math.sin(toRad(coord2.lat)) -
    Math.sin(toRad(coord1.lat)) * Math.cos(toRad(coord2.lat)) * Math.cos(toRad(coord2.lng - coord1.lng));
  const b = (Math.atan2(y, x) * 180) / Math.PI;
  return (b + 360) % 360;
}

export interface PresetLocation {
  id: string;
  name: string;
  neighborhood: string;
  city: string;
  coords: Coordinates;
}

export const PRESET_LOCATIONS: PresetLocation[] = [
  {
    id: 'soho-nyc',
    name: 'SoHo & Greenwich Village',
    neighborhood: 'Greenwich Village',
    city: 'New York, NY',
    coords: { lat: 40.7291, lng: -73.9982 },
  },
  {
    id: 'hayes-sf',
    name: 'Hayes Valley & Mission',
    neighborhood: 'Hayes Valley',
    city: 'San Francisco, CA',
    coords: { lat: 37.7762, lng: -122.4242 },
  },
  {
    id: 'silverlake-la',
    name: 'Silver Lake & Echo Park',
    neighborhood: 'Silver Lake',
    city: 'Los Angeles, CA',
    coords: { lat: 34.0862, lng: -118.2702 },
  },
  {
    id: 'shoreditch-ldn',
    name: 'Shoreditch & Hackney',
    neighborhood: 'Shoreditch',
    city: 'London, UK',
    coords: { lat: 51.5260, lng: -0.0782 },
  },
];
