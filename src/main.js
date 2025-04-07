import './styles/style.css';
import { initMap } from './js/app.js';

// Assign the imported function to window.initMap
window.initMap = initMap;

// Wait for DOM content to be loaded
document.addEventListener('DOMContentLoaded', () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Load Google Maps script
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,places&callback=initMap`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
});