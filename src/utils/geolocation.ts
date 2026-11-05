import { REGIONS } from '../data/categories';

export interface DetectedLocation {
  city: string;
  region: string;
  country: string;
  matchedRegionValue: string;
  displayName: string;
  isGhanaRegion: boolean;
  latitude: number;
  longitude: number;
}

// Known centers and keyword aliases for Ghanaian regions
const GHANA_REGIONS_DATA = [
  {
    regionValue: 'Greater Accra (Accra, Tema, Legon)',
    name: 'Greater Accra',
    keywords: [
      'greater accra', 'accra', 'tema', 'legon', 'madina', 'adenta',
      'osu', 'dansoman', 'spintex', 'teshie', 'nungua', 'kasoa',
      'cantonments', 'airport residential', 'east legon', 'achimota'
    ],
    lat: 5.6037,
    lng: -0.1870
  },
  {
    regionValue: 'Ashanti (Kumasi, Obuasi)',
    name: 'Ashanti',
    keywords: [
      'ashanti', 'asante', 'kumasi', 'obuasi', 'ejisu', 'mampong',
      'konongo', 'bekwai', 'asokwa', 'bantama', 'tafo', 'kwadaso'
    ],
    lat: 6.6885,
    lng: -1.6244
  },
  {
    regionValue: 'Western (Takoradi, Sekondi, Tarkwa)',
    name: 'Western',
    keywords: [
      'western', 'western region', 'takoradi', 'sekondi', 'tarkwa',
      'ahanta', 'axim', 'elubo', 'shama', 'prestea'
    ],
    lat: 4.8986,
    lng: -1.7584
  },
  {
    regionValue: 'Central (Cape Coast, Winneba)',
    name: 'Central',
    keywords: [
      'central', 'central region', 'cape coast', 'winneba', 'elmina',
      'mankessim', 'swedru', 'saltpond', 'agona'
    ],
    lat: 5.1054,
    lng: -1.2466
  },
  {
    regionValue: 'Eastern (Koforidua, Akuapem)',
    name: 'Eastern',
    keywords: [
      'eastern', 'eastern region', 'koforidua', 'akuapem', 'akropong',
      'aburi', 'nkawkaw', 'oda', 'asowase', 'suhum', 'somanya'
    ],
    lat: 6.0945,
    lng: -0.2609
  },
  {
    regionValue: 'Northern (Tamale, Yendi)',
    name: 'Northern',
    keywords: [
      'northern', 'northern region', 'tamale', 'yendi', 'savelugu',
      'bimbilla', 'kumbungu'
    ],
    lat: 9.4008,
    lng: -0.8393
  },
  {
    regionValue: 'Volta (Ho, Keta)',
    name: 'Volta',
    keywords: [
      'volta', 'volta region', 'ho', 'keta', 'kpando', 'sogakope',
      'hohoe', 'anloga', 'aflao', 'dzodze'
    ],
    lat: 6.6101,
    lng: 0.4786
  },
  {
    regionValue: 'Bono (Sunyani, Techiman)',
    name: 'Bono',
    keywords: [
      'bono', 'sunyani', 'techiman', 'dormaa', 'berkum', 'wenchi',
      'kintampo', 'bono east', 'ahafo', 'berekum'
    ],
    lat: 7.3399,
    lng: -2.3268
  },
  {
    regionValue: 'Upper East (Bolgatanga)',
    name: 'Upper East',
    keywords: [
      'upper east', 'bolgatanga', 'navrongo', 'bawku', 'paga', 'zerilla'
    ],
    lat: 10.7856,
    lng: -0.8514
  },
  {
    regionValue: 'Upper West (Wa)',
    name: 'Upper West',
    keywords: [
      'upper west', 'wa', 'jirapa', 'lawra', 'nandom', 'tumu'
    ],
    lat: 10.0601,
    lng: -2.5099
  }
];

// Approximate distance in kilometers
function getHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Find closest Ghana region based on coordinate distance
function findClosestGhanaRegion(lat: number, lng: number) {
  let closest = GHANA_REGIONS_DATA[0];
  let minDistance = Infinity;

  for (const item of GHANA_REGIONS_DATA) {
    const dist = getHaversineDistanceKm(lat, lng, item.lat, item.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = item;
    }
  }

  return { closest, distanceKm: minDistance };
}

// Attempt reverse geocoding via public endpoints
async function reverseGeocode(lat: number, lng: number): Promise<{
  city: string;
  region: string;
  country: string;
}> {
  // 1. Try BigDataCloud reverse geocode client API (CORS friendly, fast, free, no auth required)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const city = data.city || data.locality || data.localityInfo?.administrative?.[3]?.name || '';
      const region = data.principalSubdivision || data.localityInfo?.administrative?.[1]?.name || '';
      const country = data.countryName || '';

      if (city || region) {
        return { city, region, country };
      }
    }
  } catch {
    // Fallback below
  }

  // 2. Try OpenStreetMap Nominatim reverse geocoding
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
      {
        signal: controller.signal,
        headers: {
          Accept: 'application/json'
        }
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const city = addr.city || addr.town || addr.municipality || addr.village || addr.suburb || '';
      const region = addr.state || addr.region || addr.county || '';
      const country = addr.country || '';

      if (city || region) {
        return { city, region, country };
      }
    }
  } catch {
    // Fallback below
  }

  return { city: '', region: '', country: '' };
}

/**
 * Request user's current GPS position using the HTML5 Geolocation API,
 * then auto-detect their city and region.
 */
export function getCurrentCoordinates(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error('Location access was denied. Please allow location permissions in your browser.'));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error('Location information is unavailable on your device.'));
            break;
          case error.TIMEOUT:
            reject(new Error('Location detection timed out. Please try again.'));
            break;
          default:
            reject(new Error('An unexpected error occurred while detecting your location.'));
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 9000,
        maximumAge: 60000,
      }
    );
  });
}

/**
 * Auto-detect user's city or region using Geolocation API and reverse geocoding.
 */
export async function detectUserCityOrRegion(): Promise<DetectedLocation> {
  const coords = await getCurrentCoordinates();
  const { latitude, longitude } = coords;

  const geo = await reverseGeocode(latitude, longitude);
  const textToInspect = `${geo.city} ${geo.region} ${geo.country}`.toLowerCase();

  // Check if it matches any predefined Ghanaian region keywords
  let matchedGhana = GHANA_REGIONS_DATA.find((r) =>
    r.keywords.some((kw) => textToInspect.includes(kw))
  );

  // If text match failed, check if coordinates are within Ghana / close to a Ghana hub
  const { closest, distanceKm } = findClosestGhanaRegion(latitude, longitude);

  // If closest Ghana hub is within ~350km or country is Ghana
  if (!matchedGhana && (distanceKm < 350 || textToInspect.includes('ghana'))) {
    matchedGhana = closest;
  }

  if (matchedGhana) {
    const cityName = geo.city || matchedGhana.name;
    const regionName = matchedGhana.name;
    const displayName = geo.city && geo.city.toLowerCase() !== regionName.toLowerCase()
      ? `${geo.city}, ${regionName}`
      : regionName;

    return {
      city: cityName,
      region: regionName,
      country: geo.country || 'Ghana',
      matchedRegionValue: matchedGhana.regionValue,
      displayName,
      isGhanaRegion: true,
      latitude,
      longitude,
    };
  }

  // Location is outside Ghana or unlisted region
  const cityName = geo.city || (geo.region ? geo.region : `Location (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`);
  const regionName = geo.region || geo.country || 'Detected Location';
  const displayName = geo.city && geo.region && geo.city !== geo.region
    ? `${geo.city}, ${geo.region}`
    : cityName;

  // For the filter, we can use the detected region name or city
  const customRegionValue = displayName;

  return {
    city: cityName,
    region: regionName,
    country: geo.country || '',
    matchedRegionValue: customRegionValue,
    displayName,
    isGhanaRegion: false,
    latitude,
    longitude,
  };
}
