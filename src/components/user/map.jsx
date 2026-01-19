import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function Map() {
  return (
    <MapContainer
      center={[10.7769, 106.7009]}
      zoom={13}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  attribution="&copy; OpenStreetMap contributors"
/>

      <Marker position={[10.7769, 106.7009]}>
        <Popup>TP.HCM</Popup>
      </Marker>
    </MapContainer>
  );
}