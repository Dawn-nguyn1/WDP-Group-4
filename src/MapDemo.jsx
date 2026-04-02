// File: MapDemo.jsx
import React from 'react';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';

// 1. MapContainer + TileLayer
<MapContainer center={[10.8231, 106.6297]} zoom={13}>
  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
</MapContainer>

// 2. useMapEvents
const MapClickHandler = () => {
  useMapEvents({
    click: (e) => console.log('Clicked:', e.latlng)
  });
  return null;
};

// 3. EditControl-tool
<EditControl
  position="topleft"
  onCreated={handleDrawCreated}
/>

// 4. Convert to GeoJSON
const handleDrawCreated = (e) => {
  const latlngs = e.layer.getLatLngs();
  const coordinates = latlngs[0].map(ll => [ll.lng, ll.lat]);
  
  const geoJson = {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [coordinates]
    }
  };
};