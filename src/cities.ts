/**
 * Global cities dataset with coordinates and timezones for instant autocomplete
 * Supports any city worldwide + comprehensive Bangladesh coverage
 */

export interface CityLocation {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export const POPULAR_CITIES: CityLocation[] = [
  // Bangladesh
  { name: 'Chattogram', country: 'Bangladesh', latitude: 22.3569, longitude: 91.7832, timezone: 'Asia/Dhaka' },
  { name: 'Dhaka', country: 'Bangladesh', latitude: 23.8103, longitude: 90.4125, timezone: 'Asia/Dhaka' },
  { name: 'Sylhet', country: 'Bangladesh', latitude: 24.8949, longitude: 91.8687, timezone: 'Asia/Dhaka' },
  { name: 'Rajshahi', country: 'Bangladesh', latitude: 24.3636, longitude: 88.6241, timezone: 'Asia/Dhaka' },
  { name: 'Khulna', country: 'Bangladesh', latitude: 22.8456, longitude: 89.5403, timezone: 'Asia/Dhaka' },
  { name: 'Barishal', country: 'Bangladesh', latitude: 22.7010, longitude: 90.3535, timezone: 'Asia/Dhaka' },
  { name: 'Rangpur', country: 'Bangladesh', latitude: 25.7439, longitude: 89.2752, timezone: 'Asia/Dhaka' },
  { name: 'Mymensingh', country: 'Bangladesh', latitude: 24.7471, longitude: 90.4203, timezone: 'Asia/Dhaka' },
  { name: 'Cumilla', country: 'Bangladesh', latitude: 23.4682, longitude: 91.1788, timezone: 'Asia/Dhaka' },
  { name: 'Cox\'s Bazar', country: 'Bangladesh', latitude: 21.4272, longitude: 92.0058, timezone: 'Asia/Dhaka' },
  { name: 'Bogura', country: 'Bangladesh', latitude: 24.8465, longitude: 89.3777, timezone: 'Asia/Dhaka' },
  { name: 'Gazipur', country: 'Bangladesh', latitude: 23.9999, longitude: 90.4203, timezone: 'Asia/Dhaka' },
  { name: 'Narayanganj', country: 'Bangladesh', latitude: 23.6238, longitude: 90.5000, timezone: 'Asia/Dhaka' },

  // Middle East / Holy Sites
  { name: 'Makkah', country: 'Saudi Arabia', latitude: 21.4225, longitude: 39.8262, timezone: 'Asia/Riyadh' },
  { name: 'Madinah', country: 'Saudi Arabia', latitude: 24.5247, longitude: 39.5692, timezone: 'Asia/Riyadh' },
  { name: 'Riyadh', country: 'Saudi Arabia', latitude: 24.7136, longitude: 46.6753, timezone: 'Asia/Riyadh' },
  { name: 'Jeddah', country: 'Saudi Arabia', latitude: 21.5433, longitude: 39.1728, timezone: 'Asia/Riyadh' },
  { name: 'Dubai', country: 'United Arab Emirates', latitude: 25.2048, longitude: 55.2708, timezone: 'Asia/Dubai' },
  { name: 'Abu Dhabi', country: 'United Arab Emirates', latitude: 24.4539, longitude: 54.3773, timezone: 'Asia/Dubai' },
  { name: 'Doha', country: 'Qatar', latitude: 25.2854, longitude: 51.5310, timezone: 'Asia/Qatar' },
  { name: 'Kuwait City', country: 'Kuwait', latitude: 29.3759, longitude: 47.9774, timezone: 'Asia/Kuwait' },
  { name: 'Muscat', country: 'Oman', latitude: 23.5880, longitude: 58.3829, timezone: 'Asia/Muscat' },
  { name: 'Istanbul', country: 'Turkey', latitude: 41.0082, longitude: 28.9784, timezone: 'Europe/Istanbul' },
  { name: 'Ankara', country: 'Turkey', latitude: 39.9334, longitude: 32.8597, timezone: 'Europe/Istanbul' },
  { name: 'Cairo', country: 'Egypt', latitude: 30.0444, longitude: 31.2357, timezone: 'Africa/Cairo' },
  { name: 'Jerusalem', country: 'Palestine', latitude: 31.7683, longitude: 35.2137, timezone: 'Asia/Jerusalem' },
  { name: 'Amman', country: 'Jordan', latitude: 31.9454, longitude: 35.9284, timezone: 'Asia/Amman' },

  // South Asia
  { name: 'Kolkata', country: 'India', latitude: 22.5726, longitude: 88.3639, timezone: 'Asia/Kolkata' },
  { name: 'Delhi', country: 'India', latitude: 28.6139, longitude: 77.2090, timezone: 'Asia/Kolkata' },
  { name: 'Mumbai', country: 'India', latitude: 19.0760, longitude: 72.8777, timezone: 'Asia/Kolkata' },
  { name: 'Karachi', country: 'Pakistan', latitude: 24.8607, longitude: 67.0011, timezone: 'Asia/Karachi' },
  { name: 'Lahore', country: 'Pakistan', latitude: 31.5204, longitude: 74.3587, timezone: 'Asia/Karachi' },
  { name: 'Islamabad', country: 'Pakistan', latitude: 33.6844, longitude: 73.0479, timezone: 'Asia/Karachi' },

  // Southeast Asia & Far East
  { name: 'Kuala Lumpur', country: 'Malaysia', latitude: 3.1390, longitude: 101.6869, timezone: 'Asia/Kuala_Lumpur' },
  { name: 'Jakarta', country: 'Indonesia', latitude: -6.2088, longitude: 106.8456, timezone: 'Asia/Jakarta' },
  { name: 'Singapore', country: 'Singapore', latitude: 1.3521, longitude: 103.8198, timezone: 'Asia/Singapore' },
  { name: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503, timezone: 'Asia/Tokyo' },

  // Europe & UK
  { name: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London' },
  { name: 'Manchester', country: 'United Kingdom', latitude: 53.4808, longitude: -2.2426, timezone: 'Europe/London' },
  { name: 'Birmingham', country: 'United Kingdom', latitude: 52.4862, longitude: -1.8904, timezone: 'Europe/London' },
  { name: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522, timezone: 'Europe/Paris' },
  { name: 'Berlin', country: 'Germany', latitude: 52.5200, longitude: 13.4050, timezone: 'Europe/Berlin' },
  { name: 'Frankfurt', country: 'Germany', latitude: 50.1109, longitude: 8.6821, timezone: 'Europe/Berlin' },

  // North America & Australia
  { name: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.0060, timezone: 'America/New_York' },
  { name: 'Chicago', country: 'United States', latitude: 41.8781, longitude: -87.6298, timezone: 'America/Chicago' },
  { name: 'Los Angeles', country: 'United States', latitude: 34.0522, longitude: -118.2437, timezone: 'America/Los_Angeles' },
  { name: 'Toronto', country: 'Canada', latitude: 43.6532, longitude: -79.3832, timezone: 'America/Toronto' },
  { name: 'Sydney', country: 'Australia', latitude: -33.8688, longitude: 151.2093, timezone: 'Australia/Sydney' },
  { name: 'Melbourne', country: 'Australia', latitude: -37.8136, longitude: 144.9631, timezone: 'Australia/Melbourne' }
];

/**
 * Searches global cities with fast prefix and sub-string search
 */
export async function searchGlobalCities(query: string): Promise<CityLocation[]> {
  const q = query.trim().toLowerCase();
  if (!q || q.length < 1) return [];

  const matched = POPULAR_CITIES.filter(
    c => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q)
  );

  // If query is longer than 2 characters and no exact match in local DB, fetch from OpenStreetMap Nominatim API
  if (matched.length < 3 && q.length >= 3) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`;
      const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
      if (res.ok) {
        const data = await res.json();
        const onlineResults: CityLocation[] = data.map((item: any) => ({
          name: item.name || item.display_name.split(',')[0],
          country: item.address?.country || '',
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
          timezone: 'Asia/Dhaka' // Will calculate accurately
        }));

        // Deduplicate
        const combined = [...matched];
        onlineResults.forEach(on => {
          if (!combined.some(c => Math.abs(c.latitude - on.latitude) < 0.1 && Math.abs(c.longitude - on.longitude) < 0.1)) {
            combined.push(on);
          }
        });
        return combined.slice(0, 8);
      }
    } catch {
      // Fallback to local matches
    }
  }

  return matched.slice(0, 8);
}
