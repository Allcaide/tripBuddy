// frontend/src/components/mapTour.jsx
import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Fix para os ícones do Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const TourMap = ({ tour }) => {
  // Verificar se tem startLocation
  if (
    !tour?.startLocation?.coordinates ||
    !Array.isArray(tour.startLocation.coordinates) ||
    tour.startLocation.coordinates.length !== 2
  ) {
    return (
      <div className="bg-gray-100 h-96 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">
            No start location available for this tour
          </p>
        </div>
      </div>
    );
  }

  

  // Coordenadas: [longitude, latitude] -> [latitude, longitude] para Leaflet
  const center = [
    tour.startLocation.coordinates[1], // latitude
    tour.startLocation.coordinates[0], // longitude
  ];

  return (
    <div className="h-96 rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={center}>
          <Popup>
            <div className="text-center p-2">
              <h3 className="font-bold mb-1">Start Location</h3>
              <p className="text-sm font-medium">
                {tour.startLocation.description || "Tour starts here"}
              </p>
              {tour.startLocation.address && (
                <p className="text-xs text-gray-600 mt-1">
                  {tour.startLocation.address}
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default TourMap;
