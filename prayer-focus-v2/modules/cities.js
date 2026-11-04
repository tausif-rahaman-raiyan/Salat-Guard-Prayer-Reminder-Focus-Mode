/**
 * Global cities dataset with coordinates and timezones for instant autocomplete
 * Supports any city worldwide + comprehensive Bangladesh coverage
 */

export const POPULAR_CITIES = [
  // Bangladesh (All Divisions & Major Districts)
  { name: 'Chattogram', country: 'Bangladesh', latitude: 22.3569, longitude: 91.7832, timezone: 'Asia/Dhaka' },
  { name: 'Dhaka', country: 'Bangladesh', latitude: 23.8103, longitude: 90.4125, timezone: 'Asia/Dhaka' },
  { name: 'Sylhet', country: 'Bangladesh', latitude: 24.8949, longitude: 91.8687, timezone: 'Asia/Dhaka' },
  { name: 'Rajshahi', country: 'Bangladesh', latitude: 24.3636, longitude: 88.6241, timezone: 'Asia/Dhaka' },
  { name: 'Khulna', country: 'Bangladesh', latitude: 22.8456, longitude: 89.5403, timezone: 'Asia/Dhaka' },
  { name: 'Barishal', country: 'Bangladesh', latitude: 22.7010, longitude: 90.3535, timezone: 'Asia/Dhaka' },
  { name: 'Rangpur', country: 'Bangladesh', latitude: 25.7439, longitude: 89.2752, timezone: 'Asia/Dhaka' },
  { name: 'Mymensingh', country: 'Bangladesh', latitude: 24.7471, longitude: 90.4203, timezone: 'Asia/Dhaka' },
  { name: 'Cumilla', country: 'Bangladesh', latitude: 23.4682, longitude: 91.1788, timezone: 'Asia/Dhaka' },
  { name: "Cox's Bazar", country: 'Bangladesh', latitude: 21.4272, longitude: 92.0058, timezone: 'Asia/Dhaka' },
  { name: 'Bogura', country: 'Bangladesh', latitude: 24.8465, longitude: 89.3777, timezone: 'Asia/Dhaka' },
  { name: 'Gazipur', country: 'Bangladesh', latitude: 23.9999, longitude: 90.4203, timezone: 'Asia/Dhaka' },
  { name: 'Narayanganj', country: 'Bangladesh', latitude: 23.6238, longitude: 90.5000, timezone: 'Asia/Dhaka' },
  { name: 'Feni', country: 'Bangladesh', latitude: 23.0159, longitude: 91.3976, timezone: 'Asia/Dhaka' },
  { name: 'Noakhali', country: 'Bangladesh', latitude: 22.8696, longitude: 91.0997, timezone: 'Asia/Dhaka' },
  { name: 'Brahmanbaria', country: 'Bangladesh', latitude: 23.9608, longitude: 91.1115, timezone: 'Asia/Dhaka' },
  { name: 'Jessore', country: 'Bangladesh', latitude: 23.1664, longitude: 89.2081, timezone: 'Asia/Dhaka' },
  { name: 'Tangail', country: 'Bangladesh', latitude: 24.2513, longitude: 89.9167, timezone: 'Asia/Dhaka' },
  { name: 'Pabna', country: 'Bangladesh', latitude: 24.0064, longitude: 89.2372, timezone: 'Asia/Dhaka' },
  { name: 'Dinajpur', country: 'Bangladesh', latitude: 25.6217, longitude: 88.6355, timezone: 'Asia/Dhaka' },

  // Middle East / Holy Sites
  { name: 'Makkah', country: 'Saudi Arabia', latitude: 21.4225, longitude: 39.8262, timezone: 'Asia/Riyadh' },
  { name: 'Madinah', country: 'Saudi Arabia', latitude: 24.5247, longitude: 39.5692, timezone: 'Asia/Riyadh' },
  { name: 'Riyadh', country: 'Saudi Arabia', latitude: 24.7136, longitude: 46.6753, timezone: 'Asia/Riyadh' },
  { name: 'Jeddah', country: 'Saudi Arabia', latitude: 21.5433, longitude: 39.1728, timezone: 'Asia/Riyadh' },
  { name: 'Dubai', country: 'United Arab Emirates', latitude: 25.2048, longitude: 55.2708, timezone: 'Asia/Dubai' },
  { name: 'Abu Dhabi', country: 'United Arab Emirates', latitude: 24.4539, longitude: 54.3773, timezone: 'Asia/Dubai' },
  { name: 'Sharjah', country: 'United Arab Emirates', latitude: 25.3463, longitude: 55.4209, timezone: 'Asia/Dubai' },
  { name: 'Doha', country: 'Qatar', latitude: 25.2854, longitude: 51.5310, timezone: 'Asia/Qatar' },
  { name: 'Kuwait City', country: 'Kuwait', latitude: 29.3759, longitude: 47.9774, timezone: 'Asia/Kuwait' },
  { name: 'Muscat', country: 'Oman', latitude: 23.5880, longitude: 58.3829, timezone: 'Asia/Muscat' },
  { name: 'Manama', country: 'Bahrain', latitude: 26.2285, longitude: 50.5860, timezone: 'Asia/Bahrain' },
  { name: 'Istanbul', country: 'Turkey', latitude: 41.0082, longitude: 28.9784, timezone: 'Europe/Istanbul' },
  { name: 'Ankara', country: 'Turkey', latitude: 39.9334, longitude: 32.8597, timezone: 'Europe/Istanbul' },
  { name: 'Cairo', country: 'Egypt', latitude: 30.0444, longitude: 31.2357, timezone: 'Africa/Cairo' },
  { name: 'Alexandria', country: 'Egypt', latitude: 31.2001, longitude: 29.9187, timezone: 'Africa/Cairo' },
  { name: 'Jerusalem', country: 'Palestine', latitude: 31.7683, longitude: 35.2137, timezone: 'Asia/Jerusalem' },
  { name: 'Amman', country: 'Jordan', latitude: 31.9454, longitude: 35.9284, timezone: 'Asia/Amman' },

  // South Asia
  { name: 'Kolkata', country: 'India', latitude: 22.5726, longitude: 88.3639, timezone: 'Asia/Kolkata' },
  { name: 'Delhi', country: 'India', latitude: 28.6139, longitude: 77.2090, timezone: 'Asia/Kolkata' },
  { name: 'Mumbai', country: 'India', latitude: 19.0760, longitude: 72.8777, timezone: 'Asia/Kolkata' },
  { name: 'Hyderabad', country: 'India', latitude: 17.3850, longitude: 78.4867, timezone: 'Asia/Kolkata' },
  { name: 'Bengaluru', country: 'India', latitude: 12.9716, longitude: 77.5946, timezone: 'Asia/Kolkata' },
  { name: 'Chennai', country: 'India', latitude: 13.0827, longitude: 80.2707, timezone: 'Asia/Kolkata' },
  { name: 'Karachi', country: 'Pakistan', latitude: 24.8607, longitude: 67.0011, timezone: 'Asia/Karachi' },
  { name: 'Lahore', country: 'Pakistan', latitude: 31.5204, longitude: 74.3587, timezone: 'Asia/Karachi' },
  { name: 'Islamabad', country: 'Pakistan', latitude: 33.6844, longitude: 73.0479, timezone: 'Asia/Karachi' },
  { name: 'Colombo', country: 'Sri Lanka', latitude: 6.9271, longitude: 79.8612, timezone: 'Asia/Colombo' },

  // Southeast Asia & Far East
  { name: 'Kuala Lumpur', country: 'Malaysia', latitude: 3.1390, longitude: 101.6869, timezone: 'Asia/Kuala_Lumpur' },
  { name: 'Jakarta', country: 'Indonesia', latitude: -6.2088, longitude: 106.8456, timezone: 'Asia/Jakarta' },
  { name: 'Bandung', country: 'Indonesia', latitude: -6.9175, longitude: 107.6191, timezone: 'Asia/Jakarta' },
  { name: 'Surabaya', country: 'Indonesia', latitude: -7.2575, longitude: 112.7521, timezone: 'Asia/Jakarta' },
  { name: 'Singapore', country: 'Singapore', latitude: 1.3521, longitude: 103.8198, timezone: 'Asia/Singapore' },
  { name: 'Bangkok', country: 'Thailand', latitude: 13.7563, longitude: 100.5018, timezone: 'Asia/Bangkok' },
  { name: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503, timezone: 'Asia/Tokyo' },
  { name: 'Seoul', country: 'South Korea', latitude: 37.5665, longitude: 126.9780, timezone: 'Asia/Seoul' },

  // Europe & UK
  { name: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London' },
  { name: 'Manchester', country: 'United Kingdom', latitude: 53.4808, longitude: -2.2426, timezone: 'Europe/London' },
  { name: 'Birmingham', country: 'United Kingdom', latitude: 52.4862, longitude: -1.8904, timezone: 'Europe/London' },
  { name: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522, timezone: 'Europe/Paris' },
  { name: 'Berlin', country: 'Germany', latitude: 52.5200, longitude: 13.4050, timezone: 'Europe/Berlin' },
  { name: 'Frankfurt', country: 'Germany', latitude: 50.1109, longitude: 8.6821, timezone: 'Europe/Berlin' },
  { name: 'Amsterdam', country: 'Netherlands', latitude: 52.3676, longitude: 4.9041, timezone: 'Europe/Amsterdam' },
  { name: 'Brussels', country: 'Belgium', latitude: 50.8503, longitude: 4.3517, timezone: 'Europe/Brussels' },
  { name: 'Madrid', country: 'Spain', latitude: 40.4168, longitude: -3.7038, timezone: 'Europe/Madrid' },
  { name: 'Rome', country: 'Italy', latitude: 41.9028, longitude: 12.4964, timezone: 'Europe/Rome' },
  { name: 'Vienna', country: 'Austria', latitude: 48.2082, longitude: 16.3738, timezone: 'Europe/Vienna' },
  { name: 'Stockholm', country: 'Sweden', latitude: 59.3293, longitude: 18.0686, timezone: 'Europe/Stockholm' },
  { name: 'Oslo', country: 'Norway', latitude: 59.9139, longitude: 10.7522, timezone: 'Europe/Oslo' },

  // North America & Australia
  { name: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.0060, timezone: 'America/New_York' },
  { name: 'Chicago', country: 'United States', latitude: 41.8781, longitude: -87.6298, timezone: 'America/Chicago' },
  { name: 'Los Angeles', country: 'United States', latitude: 34.0522, longitude: -118.2437, timezone: 'America/Los_Angeles' },
  { name: 'Houston', country: 'United States', latitude: 29.7604, longitude: -95.3698, timezone: 'America/Chicago' },
  { name: 'Toronto', country: 'Canada', latitude: 43.6532, longitude: -79.3832, timezone: 'America/Toronto' },
  { name: 'Montreal', country: 'Canada', latitude: 45.5017, longitude: -73.5673, timezone: 'America/Toronto' },
  { name: 'Vancouver', country: 'Canada', latitude: 49.2827, longitude: -123.1207, timezone: 'America/Vancouver' },
  { name: 'Sydney', country: 'Australia', latitude: -33.8688, longitude: 151.2093, timezone: 'Australia/Sydney' },
  { name: 'Melbourne', country: 'Australia', latitude: -37.8136, longitude: 144.9631, timezone: 'Australia/Melbourne' },
  { name: 'Auckland', country: 'New Zealand', latitude: -36.8485, longitude: 174.7633, timezone: 'Pacific/Auckland' }
];

/**
 * Searches global cities with fast prefix, sub-string, and online API lookup
 */
export async function searchGlobalCities(query) {
  const q = (query || '').trim().toLowerCase();
  if (!q || q.length < 1) return [];

  const matched = POPULAR_CITIES.filter(
    c => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q)
  );

  // If query is 3+ characters and local results are sparse, search OpenStreetMap
  if (matched.length < 4 && q.length >= 3) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`;
      const res = await fetch(url, { signal: controller.signal, headers: { 'Accept': 'application/json' } });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const onlineResults = data.map((item) => ({
          name: item.name || item.display_name.split(',')[0].trim(),
          country: item.address?.country || '',
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
          timezone: guessTimezoneFromCoords(parseFloat(item.lat), parseFloat(item.lon))
        }));

        const combined = [...matched];
        onlineResults.forEach(on => {
          if (!combined.some(c => Math.abs(c.latitude - on.latitude) < 0.1 && Math.abs(c.longitude - on.longitude) < 0.1)) {
            combined.push(on);
          }
        });
        return combined.slice(0, 8);
      }
    } catch {
      // Fallback gracefully to local matches
    }
  }

  return matched.slice(0, 8);
}

function guessTimezoneFromCoords(lat, lng) {
  // Rough geographic timezone estimator when offline
  if (lat >= 20 && lat <= 27 && lng >= 88 && lng <= 93) return 'Asia/Dhaka';
  if (lat >= 16 && lat <= 32 && lng >= 34 && lng <= 56) return 'Asia/Riyadh';
  if (lat >= 8 && lat <= 37 && lng >= 68 && lng <= 97) return 'Asia/Kolkata';
  if (lat >= 23 && lat <= 37 && lng >= 60 && lng <= 78) return 'Asia/Karachi';
  if (lat >= 49 && lat <= 61 && lng >= -11 && lng <= 2) return 'Europe/London';
  if (lat >= 24 && lat <= 50 && lng >= -125 && lng <= -66) return 'America/New_York';
  return 'Asia/Dhaka';
}
