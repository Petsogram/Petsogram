const fs = require('fs');
const path = require('path');

const apiPlacesPath = path.join(__dirname, 'api', 'places.js');
const placesApiJsPath = path.join(__dirname, 'src', 'services', 'placesApi.js');

const apiPlacesCode = `export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { action, lat, lng, radius, category, query, pageToken } = req.body;
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: 'Live location data is not configured.' });
  }

  const fieldMask = 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.regularOpeningHours,places.nationalPhoneNumber,places.googleMapsUri,places.primaryType,nextPageToken';

  try {
    if (action === 'searchNearby') {
      const categoryMap = {
        'Vets': ['veterinary_care'],
        'Groomers': ['pet_store', 'veterinary_care'],
        'Pet Services': ['pet_boarding_service', 'pet_store'],
        'Shelters': ['animal_shelter'],
        'NGOs': ['animal_shelter'],
        'Rescuers': ['animal_shelter', 'veterinary_care']
      };
      const includedTypes = categoryMap[category] || ['veterinary_care'];

      const bodyParams = {
        includedTypes: includedTypes,
        maxResultCount: 20,
        locationRestriction: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: radius // meters
          }
        },
        rankPreference: 'DISTANCE'
      };
      if (pageToken) bodyParams.pageToken = pageToken;

      const response = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': fieldMask
        },
        body: JSON.stringify(bodyParams)
      });
      
      const data = await response.json();
      return res.status(response.ok ? 200 : response.status).json(data);
    }
    
    if (action === 'searchText') {
      const bodyParams = {
        textQuery: query,
        maxResultCount: 20
      };
      if (lat && lng && radius) {
        bodyParams.locationBias = {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: radius
          }
        };
      }
      if (pageToken) bodyParams.pageToken = pageToken;

      const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': fieldMask
        },
        body: JSON.stringify(bodyParams)
      });

      const data = await response.json();
      return res.status(response.ok ? 200 : response.status).json(data);
    }
    
    if (action === 'autocomplete') {
       const bodyParams = { input: query };
       const response = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           'X-Goog-Api-Key': apiKey,
         },
         body: JSON.stringify(bodyParams)
       });
       const data = await response.json();
       return res.status(response.ok ? 200 : response.status).json(data);
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
`;

fs.writeFileSync(apiPlacesPath, apiPlacesCode);

const placesApiJsCode = `export async function fetchNearbyPlaces(lat, lng, radiusKm, category, pageToken = null) {
  try {
    const radiusMeters = Math.min(Math.round(radiusKm * 1000), 50000); 
    const response = await fetch('/api/places', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'searchNearby', lat, lng, radius: radiusMeters, category, pageToken })
    });
    if (!response.ok) throw new Error('API returned an error');
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch nearby places', error);
    return { error: true };
  }
}

export async function fetchTextSearch(query, lat, lng, radiusKm, pageToken = null) {
  try {
    const radiusMeters = radiusKm ? Math.min(Math.round(radiusKm * 1000), 50000) : undefined;
    const response = await fetch('/api/places', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'searchText', query, lat, lng, radius: radiusMeters, pageToken })
    });
    if (!response.ok) throw new Error('API returned an error');
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch text search places', error);
    return { error: true };
  }
}
`;

fs.writeFileSync(placesApiJsPath, placesApiJsCode);
console.log("Backend places API and client wrapper updated.");
