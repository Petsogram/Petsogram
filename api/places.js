export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { action, lat, lng, radius, category, query, queries, pageToken } = req.body;
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: 'Live location data is not configured.' });
  }

  const fieldMask = 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.currentOpeningHours,places.regularOpeningHours,places.nationalPhoneNumber,places.internationalPhoneNumber,places.websiteUri,places.googleMapsUri,places.primaryType,places.types,places.businessStatus,nextPageToken';

  try {
    if (action === 'searchNearby') {
      const categoryMap = {
        'Vets': ['veterinary_care', 'animal_hospital'],
        'Veterinary': ['veterinary_care', 'animal_hospital'],
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
      if (!response.ok) {
        return res.status(response.status).json({ error: data.error?.message || 'Google API Error', details: data });
      }
      return res.status(200).json(data);
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
      if (!response.ok) {
        return res.status(response.status).json({ error: data.error?.message || 'Google API Error', details: data });
      }
      return res.status(200).json(data);
    }

    if (action === 'searchMultiText') {
      // Execute multiple queries concurrently
      const queryList = queries || [];
      if (queryList.length === 0) {
        return res.status(400).json({ error: 'No queries provided' });
      }

      const fetchPromises = queryList.map(async (q) => {
        const bodyParams = {
          textQuery: q,
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
        const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask': fieldMask
          },
          body: JSON.stringify(bodyParams)
        });
        return response.json();
      });

      const results = await Promise.all(fetchPromises);
      
      // Check for errors in any response
      const firstError = results.find(r => r.error);
      if (firstError) {
         return res.status(firstError.error.code || 500).json({ error: firstError.error.message, details: firstError });
      }

      // Aggregate and deduplicate places
      const allPlaces = [];
      const seenIds = new Set();
      
      for (const resData of results) {
        if (resData.places) {
          for (const place of resData.places) {
            if (!seenIds.has(place.id)) {
              seenIds.add(place.id);
              allPlaces.push(place);
            }
          }
        }
      }

      return res.status(200).json({ places: allPlaces });
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
       if (!response.ok) {
         return res.status(response.status).json({ error: data.error?.message || 'Google API Error', details: data });
       }
       return res.status(200).json(data);
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
