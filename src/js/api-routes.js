// Server-side API route for securely providing the Google Maps API key
// This file would be on your server, not exposed to the client

// Load environment variables from .env file
require('dotenv').config();

// Express.js route example
module.exports = function(app) {
  
  // Route to get the Maps API key
  app.get('/api/maps-api-key', (req, res) => {
    // Return the API key from environment variables
    res.json({ 
      apiKey: process.env.GOOGLE_MAPS_API_KEY 
    });
  });
  
};