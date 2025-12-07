
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v12', // style URL
    center: [77.2090, 28.6139], // starting position [lng, lat]
    zoom: 9 // starting zoom
});
