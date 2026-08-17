export const fetchNearbyPlaces = async (lat, lng, radius, category, pageToken = null) => {
  try {
    const response = await fetch('/api/places', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'searchNearby',
        lat,
        lng,
        radius: radius * 1000,
        category,
        pageToken
      })
    });
    const data = await response.json();
    return { ...data, status: response.status, ok: response.ok };
  } catch (error) {
    console.error("Error fetching places:", error);
    return { error: true, message: error.message };
  }
};

export const fetchTextSearch = async (query, lat, lng, radius, pageToken = null) => {
  try {
    const response = await fetch('/api/places', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'searchText',
        query,
        lat,
        lng,
        radius: radius ? radius * 1000 : null,
        pageToken
      })
    });
    const data = await response.json();
    return { ...data, status: response.status, ok: response.ok };
  } catch (error) {
    console.error("Error text search:", error);
    return { error: true, message: error.message };
  }
};

export const fetchMultiTextSearch = async (queries, lat, lng, radius, pageToken = null) => {
  try {
    const response = await fetch('/api/places', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'searchMultiText',
        queries,
        lat,
        lng,
        radius: radius ? radius * 1000 : null,
        pageToken
      })
    });
    const data = await response.json();
    return { ...data, status: response.status, ok: response.ok };
  } catch (error) {
    console.error("Error multi text search:", error);
    return { error: true, message: error.message };
  }
};
