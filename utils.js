/**
 * Utility functions for Street View Route Navigator
 */

// Marker utilities
const MarkerUtils = {
    /**
     * Creates a position marker with animation
     * @param {google.maps.Map} map - The map instance
     * @param {google.maps.LatLng} position - The marker position
     * @param {Object} options - Marker configuration options
     * @returns {google.maps.Marker} - The created marker
     */
    createPositionMarker: function(map, position, options = {}) {
      const defaultOptions = {
        scale: 8,
        fillColor: '#3B82F6',
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: '#FFFFFF',
        zIndex: 5,
        animation: google.maps.Animation.DROP
      };
      
      const markerOptions = { ...defaultOptions, ...options };
      
      return new google.maps.Marker({
        position: position,
        map: map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: markerOptions.scale,
          fillColor: markerOptions.fillColor,
          fillOpacity: markerOptions.fillOpacity,
          strokeWeight: markerOptions.strokeWeight,
          strokeColor: markerOptions.strokeColor
        },
        animation: markerOptions.animation,
        zIndex: markerOptions.zIndex
      });
    },
    
    /**
     * Creates a pulse effect around a marker
     * @param {google.maps.Map} map - The map instance
     * @param {google.maps.LatLng} position - The marker position
     * @param {number} duration - Duration in milliseconds before removing the pulse
     */
    createPulseEffect: function(map, position, duration = 2000) {
      const pulseMarker = new google.maps.Marker({
        position: position,
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
      
      // Remove the pulse marker after the specified duration
      setTimeout(() => {
        pulseMarker.setMap(null);
      }, duration);
      
      return pulseMarker;
    }
  };
  
  // Route utilities
  const RouteUtils = {
    /**
     * Calculates intermediate points between two positions
     * @param {google.maps.LatLng} start - Start position
     * @param {google.maps.LatLng} end - End position
     * @param {number} maxDistance - Maximum distance between points in meters
     * @returns {Array<google.maps.LatLng>} - Array of intermediate points including start and end
     */
    calculateIntermediatePoints: function(start, end, maxDistance) {
      const points = [start];
      const distance = google.maps.geometry.spherical.computeDistanceBetween(start, end);
      
      if (distance > maxDistance) {
        const steps = Math.ceil(distance / maxDistance);
        
        for (let i = 1; i < steps; i++) {
          const fraction = i / steps;
          const lat = start.lat() + (end.lat() - start.lat()) * fraction;
          const lng = start.lng() + (end.lng() - start.lng()) * fraction;
          points.push(new google.maps.LatLng(lat, lng));
        }
      }
      
      points.push(end);
      return points;
    },
    
    /**
     * Gets the appropriate sampling distance based on travel mode
     * @param {string} travelMode - The travel mode (DRIVING, WALKING, BICYCLING, TRANSIT)
     * @returns {number} - The sampling distance in meters
     */
    getSamplingDistanceForMode: function(travelMode) {
      const distances = {
        'DRIVING': 50,
        'WALKING': 20,
        'BICYCLING': 20,
        'TRANSIT': 100
      };
      
      return distances[travelMode] || 50;
    }
  };
  
  // UI utilities
  const UIUtils = {
    /**
     * Creates an info window with styled content
     * @param {google.maps.Map} map - The map instance
     * @param {google.maps.LatLng} position - The info window position
     * @param {string} content - HTML content for the info window
     * @param {number} duration - Auto-close duration in milliseconds
     * @returns {google.maps.InfoWindow} - The created info window
     */
    createInfoWindow: function(map, position, content, duration = 10000) {
      const infoWindow = new google.maps.InfoWindow({
        content: content,
        position: position,
        pixelOffset: new google.maps.Size(0, -5),
        maxWidth: 320
      });
      
      infoWindow.open(map);
      
      // Auto-close after the specified duration
      if (duration > 0) {
        setTimeout(() => {
          infoWindow.close();
        }, duration);
      }
      
      return infoWindow;
    },
    
    /**
     * Formats a route leg into an HTML info window content
     * @param {Object} leg - The route leg object from directions API
     * @returns {string} - Formatted HTML content
     */
    formatRouteInfoContent: function(leg) {
      return `
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
    }
  };