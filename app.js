function updateProgressBar() {
    const progress = (currentPointIndex / (routePoints.length - 1)) * 100;
    document.getElementById('progress-bar').style.width = `${progress}%`;
  }
  
  function updateJourneyInfo(index) {
    // Calculate percentage completed
    const percentComplete = Math.round((index / (routePoints.length - 1)) * 100);
    
    // Update progress text if available
    const progressText = document.getElementById('progress-text');
    if (progressText) {
      progressText.innerHTML = `${percentComplete}% completed | Point ${index + 1} of ${routePoints.length}`;
    }
  }
  
  // Make sure initMap is available globally
  window.initMap = initMap;// Variables to store our objects
  let map;
  let panorama;
  let directionsService;
  let directionsRenderer;
  let route;
  let currentPointIndex = 0;
  let routePoints = [];
  let isJourneyActive = false;
  let journeyInterval;
  let headingToNextPoint;
  
  // Fetch the API key and initialize the map
  document.addEventListener('DOMContentLoaded', () => {
    // First fetch the API key from the server
    fetchMapsApiKey()
      .then(apiKey => {
        // Once we have the API key, load the Google Maps script
        loadGoogleMapsScript(apiKey);
      })
      .catch(error => {
        console.error('Error fetching Maps API key:', error);
        document.body.innerHTML = `
          <div style="text-align: center; padding: 50px; color: red;">
            <h2>Error Loading Maps</h2>
            <p>Could not load Google Maps API. Please try again later.</p>
            <p>Error details: ${error.message}</p>
          </div>
        `;
      });
  });
  
  /**
   * Fetches the Google Maps API key from the server
   */
  async function fetchMapsApiKey() {
    try {
      const response = await fetch('/api/maps-api-key');
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      return data.apiKey;
    } catch (error) {
      console.error('Error fetching API key:', error);
      throw error;
    }
  }
  
  /**
   * Dynamically loads the Google Maps API script
   */
  function loadGoogleMapsScript(apiKey) {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,places&callback=initMap`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      console.error('Failed to load Google Maps API script');
      document.body.innerHTML = `
        <div style="text-align: center; padding: 50px; color: red;">
          <h2>Error Loading Maps</h2>
          <p>Could not load Google Maps API. Please try again later.</p>
        </div>
      `;
    };
    document.head.appendChild(script);
  }
  
  function initMap() {
    // Initialize the map
    map = new google.maps.Map(document.getElementById('map'), {
      center: { lat: 40.758896, lng: -73.985130 }, // Times Square
      zoom: 14,
      mapTypeId: 'roadmap'
    });
    
    // Initialize Street View panorama
    panorama = new google.maps.StreetViewPanorama(
      document.getElementById('street-view'),
      {
        position: { lat: 40.758896, lng: -73.985130 },
        pov: {
          heading: 270,
          pitch: 0
        },
        visible: true
      }
    );
    
    // Connect the map with the panorama
    map.setStreetView(panorama);
    
    // Initialize directions service and renderer
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
      map: map,
      draggable: false
    });
    
    // Initialize the autocomplete functionality
    initAutocomplete();
    
    // Add event listeners
    document.getElementById('calculate-route').addEventListener('click', calculateRoute);
    document.getElementById('start-journey').addEventListener('click', startJourney);
    document.getElementById('stop-journey').addEventListener('click', stopJourney);
    document.getElementById('prev-step').addEventListener('click', goToPreviousPoint);
    document.getElementById('next-step').addEventListener('click', goToNextPoint);
  }
  
  function initAutocomplete() {
    // Create autocomplete objects for both input fields
    const startAutocomplete = new google.maps.places.Autocomplete(
      document.getElementById('start-location'),
      { types: ['geocode', 'establishment'] }
    );
    
    const endAutocomplete = new google.maps.places.Autocomplete(
      document.getElementById('end-location'),
      { types: ['geocode', 'establishment'] }
    );
    
    // Add place_changed listeners to recenter the map when a place is selected
    startAutocomplete.addListener('place_changed', function() {
      const place = startAutocomplete.getPlace();
      if (!place.geometry || !place.geometry.location) {
        // User entered the name of a place that was not suggested
        window.alert("No details available for input: '" + place.name + "'");
        return;
      }
      
      // Recenter the map on the selected location
      map.setCenter(place.geometry.location);
      map.setZoom(15);
      
      // Move Street View to this location
      panorama.setPosition(place.geometry.location);
      
      // Add a marker
      new google.maps.Marker({
        position: place.geometry.location,
        map: map,
        title: place.name,
        animation: google.maps.Animation.DROP
      });
    });
    
    endAutocomplete.addListener('place_changed', function() {
      const place = endAutocomplete.getPlace();
      if (!place.geometry || !place.geometry.location) {
        window.alert("No details available for input: '" + place.name + "'");
        return;
      }
      
      // We don't automatically recenter on the end location,
      // but we'll add a marker to show it on the map
      new google.maps.Marker({
        position: place.geometry.location,
        map: map,
        title: place.name,
        animation: google.maps.Animation.DROP,
        icon: {
          url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
        }
      });
      
      // If we already have a start location selected, calculate the route
      const startLocation = document.getElementById('start-location').value;
      if (startLocation) {
        calculateRoute();
      }
    });
    
    // Prevent form submission when Enter key is pressed in input fields
    document.getElementById('start-location').addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
      }
    });
    
    document.getElementById('end-location').addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
      }
    });
  }
  
  function calculateRoute() {
    const startLocation = document.getElementById('start-location').value;
    const endLocation = document.getElementById('end-location').value;
    
    if (!startLocation || !endLocation) {
      alert('Please enter both start and end locations.');
      return;
    }
    
    // Get travel mode
    const travelMode = document.getElementById('travel-mode').value;
    
    // Get route preferences
    const avoidHighways = document.getElementById('avoid-highways').checked;
    const avoidTolls = document.getElementById('avoid-tolls').checked;
    const avoidFerries = document.getElementById('avoid-ferries').checked;
    
    const request = {
      origin: startLocation,
      destination: endLocation,
      travelMode: travelMode
    };
    
    // Add avoidance preferences if checked
    if (avoidHighways || avoidTolls || avoidFerries) {
      request.avoidances = [];
      if (avoidHighways) request.avoidances.push('highways');
      if (avoidTolls) request.avoidances.push('tolls');
      if (avoidFerries) request.avoidances.push('ferries');
    }
    
    // For transit mode, we can add additional parameters
    if (travelMode === 'TRANSIT') {
      request.transitOptions = {
        departureTime: new Date()
      };
    }
    
    // Update UI to show route is being calculated
    const calculateButton = document.getElementById('calculate-route');
    calculateButton.textContent = 'Calculating...';
    calculateButton.disabled = true;
    
    directionsService.route(request, (result, status) => {
      // Reset button state
      calculateButton.textContent = 'Calculate Route';
      calculateButton.disabled = false;
      
      if (status === 'OK') {
        // Display the route on the map
        directionsRenderer.setDirections(result);
        route = result;
        
        // Display route information
        displayRouteInfo(result);
        
        // Extract points along the route for Street View
        const path = result.routes[0].overview_path;
        processRoutePoints(path);
        
        // Enable journey controls
        document.getElementById('start-journey').disabled = false;
        document.getElementById('prev-step').disabled = false;
        document.getElementById('next-step').disabled = false;
        
        // Reset journey state
        currentPointIndex = 0;
        updateProgressBar();
        
        // Move Street View to the starting point
        if (routePoints.length > 0) {
          moveToPoint(0);
        }
      } else {
        alert('Could not calculate directions: ' + status);
      }
    });
  }
  
  function displayRouteInfo(result) {
    const route = result.routes[0];
    const leg = route.legs[0];
    
    // Create info window with route details
    const routeInfoContent = `
      <div style="padding: 16px; font-family: 'Inter', sans-serif; max-width: 300px;">
        <h3 style="margin-top: 0; color: #1E293B; font-weight: 600; font-size: 16px;">Route Information</h3>
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span style="color: #334155; font-weight: 500;">Duration: </span>
          <span style="margin-left: 4px; color: #475569;">${leg.duration.text}</span>
        </div>
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
            <path d="M18 6L6 18"></path>
            <path d="M6 6l12 12"></path>
          </svg>
          <span style="color: #334155; font-weight: 500;">Distance: </span>
          <span style="margin-left: 4px; color: #475569;">${leg.distance.text}</span>
        </div>
        <div style="margin-top: 12px; font-size: 13px; color: #64748B;">
          <div style="margin-bottom: 4px;"><strong>Start:</strong> ${leg.start_address}</div>
          <div><strong>End:</strong> ${leg.end_address}</div>
        </div>
      </div>
    `;
    
    // Display info window
    const infoWindow = new google.maps.InfoWindow({
      content: routeInfoContent,
      position: leg.start_location,
      pixelOffset: new google.maps.Size(0, -5),
      maxWidth: 320
    });
    
    infoWindow.open(map);
    
    // Close info window after 10 seconds
    setTimeout(() => {
      infoWindow.close();
    }, 10000);
  }
  
  function processRoutePoints(path) {
    routePoints = [];
    
    // Sample points along the path
    // For a smoother experience, we'll sample more points
    for (let i = 0; i < path.length; i++) {
      routePoints.push(path[i]);
      
      // If distance to next point is large, add intermediate points
      if (i < path.length - 1) {
        const p1 = path[i];
        const p2 = path[i + 1];
        const distance = google.maps.geometry.spherical.computeDistanceBetween(p1, p2);
        
        // Adjust sampling density based on travel mode
        const travelMode = document.getElementById('travel-mode').value;
        let samplingDistance = 50; // Default for driving
        
        if (travelMode === 'WALKING' || travelMode === 'BICYCLING') {
          samplingDistance = 20; // More points for walking/biking for smoother experience
        } else if (travelMode === 'TRANSIT') {
          samplingDistance = 100; // Fewer points for transit as it might have longer segments
        }
        
        // If distance is greater than sampling distance, add intermediate points
        if (distance > samplingDistance) {
          const steps = Math.ceil(distance / samplingDistance);
          for (let j = 1; j < steps; j++) {
            const fraction = j / steps;
            const lat = p1.lat() + (p2.lat() - p1.lat()) * fraction;
            const lng = p1.lng() + (p2.lng() - p1.lng()) * fraction;
            routePoints.push(new google.maps.LatLng(lat, lng));
          }
        }
      }
    }
    
    console.log(`Route has ${routePoints.length} points`);
  }
  
  function startJourney() {
    if (isJourneyActive) return;
    if (routePoints.length === 0) {
      alert('Please calculate a route first.');
      return;
    }
    
    isJourneyActive = true;
    document.getElementById('start-journey').disabled = true;
    document.getElementById('stop-journey').disabled = false;
    
    // Start the automatic journey
    const speed = parseFloat(document.getElementById('speed-selector').value);
    journeyInterval = setInterval(() => {
      if (currentPointIndex < routePoints.length - 1) {
        goToNextPoint();
      } else {
        stopJourney();
      }
    }, 2000 / speed); // Adjust the interval based on speed
  }
  
  function stopJourney() {
    isJourneyActive = false;
    clearInterval(journeyInterval);
    document.getElementById('start-journey').disabled = false;
    document.getElementById('stop-journey').disabled = true;
  }
  
  function goToNextPoint() {
    if (currentPointIndex < routePoints.length - 1) {
      currentPointIndex++;
      moveToPoint(currentPointIndex);
    }
  }
  
  function goToPreviousPoint() {
    if (currentPointIndex > 0) {
      currentPointIndex--;
      moveToPoint(currentPointIndex);
    }
  }
  
  function moveToPoint(index) {
    const point = routePoints[index];
    
    // Calculate heading to the next point
    if (index < routePoints.length - 1) {
      const nextPoint = routePoints[index + 1];
      headingToNextPoint = google.maps.geometry.spherical.computeHeading(point, nextPoint);
    }
    
    // Check if Street View is available at this point
    const streetViewService = new google.maps.StreetViewService();
    streetViewService.getPanorama({
      location: point,
      radius: 50,
      source: google.maps.StreetViewSource.OUTDOOR
    }, (data, status) => {
      if (status === 'OK') {
        // Move to this Street View panorama
        panorama.setPosition(data.location.latLng);
        
        // Set the heading toward the next point in the route
        if (headingToNextPoint !== undefined) {
          panorama.setPov({
            heading: headingToNextPoint,
            pitch: 0
          });
        }
        
        // Update progress bar
        updateProgressBar();
        
        // Center the map on the current position
        map.setCenter(point);
        
        // Remove previous markers if they exist
        if (window.currentPositionMarker) {
          window.currentPositionMarker.setMap(null);
        }
        
        // Add a marker for the current position
        window.currentPositionMarker = new google.maps.Marker({
          position: point,
          map: map,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#3B82F6',
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: '#FFFFFF'
          },
          animation: google.maps.Animation.DROP,
          zIndex: 5
        });
        
        // Add a glowing effect
        const pulseMarker = new google.maps.Marker({
          position: point,
          map: map,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 16,
            fillColor: '#3B82F6',
            fillOpacity: 0.3,
            strokeWeight: 0
          },
          zIndex: 4
        });
        
        // Remove the pulse marker after a short delay
        setTimeout(() => {
          pulseMarker.setMap(null);
        }, 2000);
        
        // Update journey progress info
        updateJourneyInfo(index);
      } else {
        console.log('No Street View available at this point. Skipping to next point.');
        if (isJourneyActive && currentPointIndex < routePoints.length - 1) {
          goToNextPoint();
        }
      }
    });
  }