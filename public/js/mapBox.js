console.log('Hello from mapBox.js');

export const displayMap = (locations) => {
  // console.log('Locations:', locations);

  // Initialize Leaflet map
  const map = L.map('map', {
    center: [34.0522, -118.2437],
    zoom: 10,
    scrollWheelZoom: false,
    zoomControl: false,
  });

  // Add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  const bounds = L.latLngBounds();

  // Add markers for each location
  locations.forEach((loc) => {
    const el = document.createElement('div');
    el.className = 'marker';
    const [longitude, latitude] = loc.coordinates; // Adjust as per your data format

    var myIcon = L.icon({
      iconUrl: '../img/pin.png',
      iconSize: [32, 40], // Match the width and height from CSS
      iconAnchor: [16, 40], // Adjust as needed
      popupAnchor: [0, -20],
    });
    const marker = L.marker([latitude, longitude], { icon: myIcon })
      .addTo(map)
      .bindPopup(
        `<p class="mapboxgl-popup-content">Day ${loc.day}: ${loc.description}</p>`
      );

    // Extend the bounds to include this marker
    bounds.extend([latitude, longitude]);
  });

  // Fit the map to the bounds with padding
  map.fitBounds(bounds, {
    padding: [200, 150, 100, 100],
  });
};
