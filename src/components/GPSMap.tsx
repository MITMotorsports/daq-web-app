import React from "react";

import { MapContainer, TileLayer, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const GPSMap: React.FC<{ coords: L.LatLng[] }> = ({ coords }) => {
  return (
    <div style={{ height: "300px", width: "300px" }}>
      <MapContainer
        bounds={L.latLngBounds(coords)}
        scrollWheelZoom={false}
        style={{ position: "static", height: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polyline positions={coords} />
      </MapContainer>
    </div>
  );
};

export default GPSMap;
