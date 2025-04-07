import './styles/style.css';
import { initMap } from './js/app.js';

// Load Google Maps API
const loadGoogleMapsAPI = () => {
  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=geometry,places&callback=initMap`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
};

// Expose initMap globally for Google Maps callback
window.initMap = initMap;

// Load Google Maps script when DOM is ready
document.addEventListener('DOMContentLoaded', loadGoogleMapsAPI);