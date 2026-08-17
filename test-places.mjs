async function testPlaces() {
    console.log("[Test] Simulating API call for 'Veterinary' (nearby search)");
    const payload = {
        action: 'searchNearby',
        lat: 19.0441, // DY Patil
        lng: 73.0255, // DY Patil
        radius: 10000,
        category: 'veterinary_care'
    };

    console.log("[Test] Payload:", payload);
    
    // In dev, the Vite server is on 5173 and it proxies /api/places
    try {
        const response = await fetch('http://localhost:5173/api/places', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        console.log(`[Test] HTTP Status: ${response.status}`);
        const text = await response.text();
        console.log(`[Test] Response text: ${text}`);
    } catch (e) {
        console.error("[Test] Fetch failed:", e.message);
    }
}

testPlaces();
