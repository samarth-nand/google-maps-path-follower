// Configuration settings for Street View Route Navigator
const config = {
    // Maps Configuration
    maps: {
      // API key will be fetched from the server
      defaultCenter: {
        lat: 40.758896, 
        lng: -73.985130 // Times Square, New York
      },
      defaultZoom: 14
    },
    
    // Street View Configuration
    streetView: {
      defaultPosition: {
        lat: 40.758896, 
        lng: -73.985130 // Times Square, New York
      },
      defaultPOV: {
        heading: 270,
        pitch: 0
      }
    },
    
    // Route Sampling Configuration
    routeSampling: {
      driving: 50,   // meters between points
      walking: 20,   // meters between points
      bicycling: 20, // meters between points
      transit: 100   // meters between points
    },
    
    // Journey Configuration
    journey: {
      speeds: {
        slow: 0.5,
        normal: 1,
        fast: 2,
        veryFast: 4
      },
      baseInterval: 2000, // milliseconds
      pulseMarkerDuration: 2000 // milliseconds
    },
    
    // UI Configuration
    ui: {
      infoWindowDuration: 10000, // milliseconds
      defaultLocations: {
        start: 'Times Square, New York, NY',
        end: 'Empire State Building, New York, NY'
      }
    }
  };