# Street View Route Navigator

A web application that allows users to traverse a path on Google Maps using Street View, following every turn on the route.

## Features

- Enter start and end locations with autocomplete assistance
- Choose from multiple travel modes (driving, walking, bicycling, transit)
- Set route preferences (avoid highways, tolls, ferries)
- Automatic journey mode with adjustable speed
- Manual step-by-step navigation controls
- Visual progress indicator
- Responsive design for desktop and mobile

## Project Structure

- `index.html` - Main HTML structure
- `styles.css` - All CSS styles and responsive design rules
- `app.js` - Core application logic and Google Maps integration
- `config.js` - Configuration settings for the application
- `utils.js` - Utility functions for markers, routes, and UI elements

## Setup Instructions

1. **Get a Google Maps API Key**:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project (or select an existing one)
   - Enable the required APIs:
     - Maps JavaScript API
     - Directions API
     - Places API
     - Street View API
   - Create an API key
   - Restrict the API key to these APIs for security


3. **Deployment**:
   - Upload all files to your web server or host locally
   - Open `index.html` in your browser

## Usage

1. Enter start and end locations in the input fields
2. Choose your preferred travel mode and route options
3. Click "Calculate Route" to generate the path
4. Use the journey controls:
   - "Start Journey" to automatically move along the route
   - "Stop" to pause the journey
   - Step buttons to move forward or backward manually
   - Speed selector to adjust the pace of the automatic journey

## Customization

You can customize various aspects of the application:

- Default locations and map center in `config.js`
- Sampling density for each travel mode
- UI colors and styles in `styles.css`
- Journey speeds and timing parameters

## Browser Compatibility

- Chrome (recommended for best performance)
- Firefox
- Safari
- Edge

## License

MIT License - Feel free to use and modify for your own projects.

## Credits

Built with:
- Google Maps JavaScript API
- Google Directions API
- Google Places API
- Google Street View API

## Known Bugs

- App wont deploy on vite, > html error
- CSS stylesheet wont load