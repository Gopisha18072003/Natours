
export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiZ29waXNoYXciLCJhIjoiY2x2bzI3ajI4MGdrNzJpcDFndjljZmZodyJ9.idKwTpkG0d7X1nYeiqiT9A';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/gopishaw/clvo2rxxy017n01o0eht0aog4',
    scrollZoom: false,
    // center: [-118.113491,34.111754],
    // zoom: 10,
    // interactive: false
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    // create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // add marker
    new mapboxgl.Marker(el).setLngLat(loc.coordinates).addTo(map);
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p> Day ${loc.day}: ${loc.description} </p>`)
      .addTo(map);

    // extends the map bund to include the current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
