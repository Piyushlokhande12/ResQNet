// const axios = require("axios");

// const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// /**
//  * Find nearby emergency services using Google Places API
//  * @param {number} lat
//  * @param {number} lng
//  * @param {string} type - "hospital" | "police" | "fire_station"
//  * @param {number} radius - in meters (default 5000)
//  */
// const findNearbyServices = async (lat, lng, type = "hospital", radius = 5000) => {
//   try {
//     const response = await axios.get(
//       "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
//       {
//         params: {
//           location: `${lat},${lng}`,
//           radius,
//           type,
//           key: GOOGLE_API_KEY,
//         },
//       }
//     );

//     const results = response.data.results.map((place) => ({
//       placeId: place.place_id,
//       name: place.name,
//       address: place.vicinity,
//       location: place.geometry.location,
//       rating: place.rating,
//       isOpen: place.opening_hours?.open_now,
//     }));

//     return results;
//   } catch (error) {
//     console.error("Places API Error:", error.message);
//     throw error;
//   }
// };

// const reverseGeocode = async (lat, lng) => {
//   try {
//     const response = await axios.get(
//       "https://maps.googleapis.com/maps/api/geocode/json",
//       {
//         params: {
//           latlng: `${lat},${lng}`,
//           key: GOOGLE_API_KEY,
//         },
//       }
//     );
//     return response.data.results[0]?.formatted_address || "Unknown location";
//   } catch (error) {
//     console.error("Geocode Error:", error.message);
//     return "Unknown location";
//   }
// };

// const calculateDistance = (lat1, lng1, lat2, lng2) => {
//   const R = 6371;
//   const dLat = ((lat2 - lat1) * Math.PI) / 180;
//   const dLng = ((lng2 - lng1) * Math.PI) / 180;
//   const a =
//     Math.sin(dLat / 2) ** 2 +
//     Math.cos((lat1 * Math.PI) / 180) *
//       Math.cos((lat2 * Math.PI) / 180) *
//       Math.sin(dLng / 2) ** 2;
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return R * c; 
// };

// module.exports = { findNearbyServices, reverseGeocode, calculateDistance };

const axios = require("axios");

/**
 * Find nearby emergency services
 * Uses OpenStreetMap Overpass API (FREE)
 */
const findNearbyServices = async (
  lat,
  lng,
  type = "hospital",
  radius = 5000
) => {
  try {
    const amenityMap = {
      hospital: "hospital",
      police: "police",
      fire_station: "fire_station",
      pharmacy: "pharmacy"
    };

    const amenity = amenityMap[type];

    if (!amenity) {
      throw new Error(`Invalid service type: ${type}`);
    }

    console.log("Searching nearby services...");
    console.log({
      lat,
      lng,
      type,
      amenity,
      radius
    });

    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="${amenity}"](around:${radius},${lat},${lng});
        way["amenity"="${amenity}"](around:${radius},${lat},${lng});
        relation["amenity"="${amenity}"](around:${radius},${lat},${lng});
      );
      out center;
    `;

    const response = await axios.post(
      "https://overpass-api.de/api/interpreter",
      query,
      {
        headers: {
          "Content-Type": "text/plain",
          "User-Agent": "SafeAlert-App"
        },
        timeout: 30000
      }
    );

    const elements = response.data.elements || [];

    console.log(`Found ${elements.length} nearby ${type}`);

    const results = elements.map((place) => ({
      placeId: place.id,
      name: place.tags?.name || "Unknown",
      address:
        place.tags?.["addr:full"] ||
        place.tags?.["addr:street"] ||
        place.tags?.["addr:housenumber"] ||
        "Address not available",

      location: {
        lat: place.lat || place.center?.lat,
        lng: place.lon || place.center?.lon
      },

      type: amenity
    }));

    return results;
  } catch (error) {
    console.error(
      "Overpass API Error:",
      error.response?.data || error.message
    );

    return [];
  }
};


/**
 * Reverse geocode coordinates -> address
 */
const reverseGeocode = async (lat, lng) => {
  try {
    const response = await axios.get(
      "https://nominatim.openstreetmap.org/reverse",
      {
        params: {
          lat,
          lon: lng,
          format: "json"
        },
        headers: {
          "User-Agent": "SafeAlert-App"
        },
        timeout: 10000
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
 * Calculate distance between two coordinates
 */
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(
    Math.sqrt(a),
    Math.sqrt(1 - a)
  );

  return R * c;
};

module.exports = {
  findNearbyServices,
  reverseGeocode,
  calculateDistance
};