const axios = require("axios");

/**
 * OSM tag config — each type has multiple tag combos (OR logic)
 * so we catch all ways OSM mappers might have tagged the place.
 */
const SERVICE_CONFIG = {
  hospital: {
    queries: [
      { key: "amenity", value: "hospital" },
      { key: "amenity", value: "clinic" },
      { key: "amenity", value: "doctors" },
      { key: "healthcare", value: "hospital" },
    ],
    fallbackName: "Hospital / Clinic",
  },
  police: {
    queries: [
      { key: "amenity", value: "police" },
      { key: "office", value: "police" },
    ],
    fallbackName: "Police Station",
  },
  fire_station: {
    queries: [
      { key: "amenity", value: "fire_station" },
      { key: "emergency", value: "fire_station" },
    ],
    fallbackName: "Fire Station",
  },
  pharmacy: {
    queries: [
      { key: "amenity", value: "pharmacy" },
      { key: "healthcare", value: "pharmacy" },
      { key: "shop", value: "chemist" },
      { key: "shop", value: "pharmacy" },
    ],
    fallbackName: "Pharmacy / Medical Store",
  },
  ambulance: {
    queries: [
      { key: "emergency", value: "ambulance_station" },
      { key: "amenity", value: "hospital" },
    ],
    fallbackName: "Ambulance Station",
  },
  dentist: {
    queries: [
      { key: "amenity", value: "dentist" },
      { key: "healthcare", value: "dentist" },
    ],
    fallbackName: "Dental Clinic",
  },
  veterinary: {
    queries: [
      { key: "amenity", value: "veterinary" },
      { key: "healthcare", value: "veterinary" },
    ],
    fallbackName: "Veterinary Clinic",
  },
  school: {
    queries: [
      { key: "amenity", value: "school" },
      { key: "amenity", value: "college" },
      { key: "amenity", value: "university" },
    ],
    fallbackName: "School / College",
  },
  bank: {
    queries: [
      { key: "amenity", value: "bank" },
      { key: "office", value: "bank" },
    ],
    fallbackName: "Bank",
  },
  atm: {
    queries: [
      { key: "amenity", value: "atm" },
      { key: "banking", value: "atm" },
    ],
    fallbackName: "ATM",
  },
  fuel: {
    queries: [
      { key: "amenity", value: "fuel" },
      { key: "shop", value: "fuel" },
    ],
    fallbackName: "Petrol / Fuel Station",
  },
  restaurant: {
    queries: [
      { key: "amenity", value: "restaurant" },
      { key: "amenity", value: "fast_food" },
      { key: "amenity", value: "food_court" },
    ],
    fallbackName: "Restaurant",
  },
  supermarket: {
    queries: [
      { key: "shop", value: "supermarket" },
      { key: "shop", value: "grocery" },
      { key: "shop", value: "general" },
      { key: "amenity", value: "marketplace" },
    ],
    fallbackName: "Supermarket / Grocery",
  },
  post_office: {
    queries: [
      { key: "amenity", value: "post_office" },
      { key: "office", value: "post_office" },
    ],
    fallbackName: "Post Office",
  },
};

/**
 * Build Overpass QL query for multiple tag key/value pairs (OR logic).
 */
const buildOverpassQuery = (queries, radius, lat, lng) => {
  const unions = queries
    .map(
      ({ key, value }) => `
    node["${key}"="${value}"](around:${radius},${lat},${lng});
    way["${key}"="${value}"](around:${radius},${lat},${lng});
    relation["${key}"="${value}"](around:${radius},${lat},${lng});`
    )
    .join("\n");

  return `[out:json][timeout:30];\n(\n${unions}\n);\nout center;`;
};

/**
 * Build a human-readable address from OSM tags.
 */
const buildAddress = (tags = {}) => {
  const parts = [
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:suburb"],
    tags["addr:city"] || tags["addr:town"] || tags["addr:village"],
    tags["addr:state"],
    tags["addr:postcode"],
  ].filter(Boolean);

  if (parts.length > 0) return parts.join(", ");
  if (tags["addr:full"]) return tags["addr:full"];
  return "Address not available";
};

/**
 * Call Overpass API with given query, return parsed elements.
 */
const callOverpass = async (query) => {
  const response = await axios.post(
    "https://overpass-api.de/api/interpreter",
    query,
    {
      headers: {
        "Content-Type": "text/plain",
        "User-Agent": "SafeAlert-App/1.0",
      },
      timeout: 35000,
    }
  );
  return response.data.elements || [];
};

/**
 * Parse raw OSM elements into clean result objects.
 */
const parseElements = (elements, type, fallbackName, userLat, userLng) => {
  const seen = new Set();
  const results = [];

  for (const place of elements) {
    const placeLat = place.lat ?? place.center?.lat;
    const placeLng = place.lon ?? place.center?.lon;

    if (placeLat == null || placeLng == null) continue;

    // De-duplicate by rounded coordinates
    const key = `${placeLat.toFixed(4)}_${placeLng.toFixed(4)}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const distance = calculateDistance(userLat, userLng, placeLat, placeLng);

    results.push({
      placeId: String(place.id),
      name:
        place.tags?.name ||
        place.tags?.["name:en"] ||
        place.tags?.["name:hi"] ||
        fallbackName,
      address: buildAddress(place.tags),
      phone:
        place.tags?.phone ||
        place.tags?.["contact:phone"] ||
        place.tags?.["contact:mobile"] ||
        null,
      website:
        place.tags?.website || place.tags?.["contact:website"] || null,
      openingHours: place.tags?.opening_hours || null,
      location: {
        lat: placeLat,
        lng: placeLng,
      },
      type,
      distanceKm: parseFloat(distance.toFixed(2)),
    });
  }

  // Sort nearest first
  results.sort((a, b) => a.distanceKm - b.distanceKm);
  return results;
};

/**
 * Find nearby services using OpenStreetMap Overpass API (FREE).
 * Automatically retries with a larger radius if no results are found.
 *
 * @param {number} lat      - User latitude
 * @param {number} lng      - User longitude
 * @param {string} type     - Service type (see SERVICE_CONFIG keys)
 * @param {number} radius   - Initial search radius in meters (default 15000)
 * @returns {Promise<Array>}
 */
const findNearbyServices = async (
  lat,
  lng,
  type = "hospital",
  radius = 15000
) => {
  try {
    const config = SERVICE_CONFIG[type];

    if (!config) {
      throw new Error(
        `Invalid service type: "${type}". Valid types: ${Object.keys(SERVICE_CONFIG).join(", ")}`
      );
    }

    // ✅ KEY FIX: if nothing found at initial radius, retry with bigger ones
    const radiiToTry = [radius, 25000, 50000];

    for (const currentRadius of radiiToTry) {
      console.log(
        `Searching "${type}" within ${currentRadius / 1000}km of (${lat}, ${lng})...`
      );

      const query = buildOverpassQuery(config.queries, currentRadius, lat, lng);
      const elements = await callOverpass(query);

      console.log(
        `  → ${elements.length} raw result(s) found at ${currentRadius / 1000}km radius`
      );

      if (elements.length > 0) {
        const results = parseElements(
          elements,
          type,
          config.fallbackName,
          lat,
          lng
        );
        console.log(`  → Returning ${results.length} unique result(s)`);
        return results;
      }
    }

    console.warn(`No "${type}" found within 50km of (${lat}, ${lng})`);
    return [];
  } catch (error) {
    console.error(
      "Overpass API Error:",
      error.response?.data || error.message
    );
    return [];
  }
};

/**
 * Reverse geocode — convert (lat, lng) → human-readable address.
 */
const reverseGeocode = async (lat, lng) => {
  try {
    const response = await axios.get(
      "https://nominatim.openstreetmap.org/reverse",
      {
        params: { lat, lon: lng, format: "json", addressdetails: 1 },
        headers: { "User-Agent": "SafeAlert-App/1.0" },
        timeout: 10000,
      }
    );
    return response.data.display_name || "Unknown location";
  } catch (error) {
    console.error(
      "Reverse Geocode Error:",
      error.response?.data || error.message
    );
    return "Unknown location";
  }
};

/**
 * Haversine distance between two coordinates.
 * @returns {number} Distance in kilometers
 */
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * Get all supported service type keys.
 */
const getSupportedTypes = () => Object.keys(SERVICE_CONFIG);

module.exports = {
  findNearbyServices,
  reverseGeocode,
  calculateDistance,
  getSupportedTypes,
};