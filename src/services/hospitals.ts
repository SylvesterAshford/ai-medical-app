// Hospital Service — Supabase queries + offline caching + distance calculation

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { Hospital } from '../types';

const HOSPITALS_CACHE_KEY = '@hospitals_cache';
const CACHE_TIMESTAMP_KEY = '@hospitals_cache_timestamp';
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

// ─── Haversine Distance Calculation ────────────────────────────────────

function toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

export function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371; // Earth's radius in km
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10; // Round to 1 decimal
}

// ─── Supabase Queries ──────────────────────────────────────────────────

export async function fetchHospitals(): Promise<Hospital[]> {
    const { data, error } = await supabase
        .from('hospitals')
        .select('*')
        .order('name');

    if (error) {
        throw new Error(`Failed to fetch hospitals: ${error.message}`);
    }

    return (data || []) as Hospital[];
}

export async function getNearbyHospitals(
    userLat: number,
    userLon: number,
    radiusKm: number = 10
): Promise<Hospital[]> {
    const hospitals = await fetchHospitals();

    const withDistance = hospitals.map(hospital => ({
        ...hospital,
        distance: calculateDistance(userLat, userLon, hospital.latitude, hospital.longitude),
    }));

    return withDistance
        .filter(h => h.distance <= radiusKm)
        .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
}

// ─── AsyncStorage Caching ──────────────────────────────────────────────

export async function cacheHospitals(hospitals: Hospital[]): Promise<void> {
    try {
        await AsyncStorage.setItem(HOSPITALS_CACHE_KEY, JSON.stringify(hospitals));
        await AsyncStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
        console.warn('Failed to cache hospitals:', error);
    }
}

export async function getCachedHospitals(): Promise<Hospital[] | null> {
    try {
        const cached = await AsyncStorage.getItem(HOSPITALS_CACHE_KEY);
        const timestamp = await AsyncStorage.getItem(CACHE_TIMESTAMP_KEY);

        if (!cached || !timestamp) return null;

        const age = Date.now() - parseInt(timestamp, 10);
        if (age > CACHE_EXPIRY_MS) return null;

        return JSON.parse(cached) as Hospital[];
    } catch (error) {
        console.warn('Failed to read cached hospitals:', error);
        return null;
    }
}

export async function getHospitalsWithFallback(
    userLat: number,
    userLon: number,
    radiusKm: number = 10
): Promise<{ hospitals: Hospital[]; fromCache: boolean }> {
    try {
        const hospitals = await getNearbyHospitals(userLat, userLon, radiusKm);

        // Cache successful results
        if (hospitals.length > 0) {
            await cacheHospitals(hospitals);
        }

        return { hospitals, fromCache: false };
    } catch {
        // Fallback to cached data
        const cached = await getCachedHospitals();

        if (cached) {
            // Recalculate distances for cached hospitals
            const withDistance = cached.map(hospital => ({
                ...hospital,
                distance: calculateDistance(userLat, userLon, hospital.latitude, hospital.longitude),
            }));

            return {
                hospitals: withDistance
                    .filter(h => (h.distance ?? 0) <= radiusKm)
                    .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0)),
                fromCache: true,
            };
        }

        return { hospitals: [], fromCache: true };
    }
}

// ─── Google Maps Deep Link ─────────────────────────────────────────────

export function getGoogleMapsDirectionsUrl(
    destLat: number,
    destLon: number,
    destName: string
): string {
    const encodedName = encodeURIComponent(destName);
    return `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLon}&destination_place_id=${encodedName}&travelmode=driving`;
}
