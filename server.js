// Basic Express server to serve the application and provide the API key

// Load dependencies
const express = require('express');
const path = require('path');
require('dotenv').config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// API route to provide the Maps API key
app.get('/api/maps-api-key', (req, res) => {
  // Check if we have the API key in the environment
  if (!process.env.GOOGLE_MAPS_API_KEY) {
    return res.status(500).json({ 
      error: 'API key is not configured. Please set GOOGLE_MAPS_API_KEY in your .env file.' 
    });
  }
  
  // Return the API key
  res.json({ 
    apiKey: process.env.GOOGLE_MAPS_API_KEY 
  });
});

// Catch-all route to serve the main HTML file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});