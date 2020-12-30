/* eslint-disable */
const locations = JSON.parse(document.getElementById('map').dataset.locations);
mapboxgl.accessToken =
  'pk.eyJ1IjoiZWxhdmFnbmkiLCJhIjoiY2tqOHc0ZnM1NDRwZDMwcnd4MHJsNDRzNiJ9.mR3V2r2C8XpZXqqfBwmgaQ';

var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/elavagni/ckj8xa8q9265o1ao2a0qnxuay',
  scrollZoom: false
  //mapbox requires longitute first and latitute second
  // center: [-118.113491, 34.111745],
  // zoom: 10,
  // interactive: false
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach(location => {
  //Create marker
  const element = document.createElement('div');
  element.className = 'marker';

  //Add marker
  new mapboxgl.Marker({
    element: element,
    anchor: 'bottom'
  })
    .setLngLat(location.coordinates)
    .addTo(map);

  //Add popup
  new mapboxgl.Popup({
    offset: 30
  })
    .setLngLat(location.coordinates)
    .setHTML(`<p>Day ${location.day}: ${location.description}</p>`)
    .addTo(map);

  //Extend map bounds to include current location
  bounds.extend(location.coordinates);
});

map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 150,
    left: 100,
    right: 100
  }
});
