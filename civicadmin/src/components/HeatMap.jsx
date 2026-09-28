import React from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import L from 'leaflet';

// Fix for default marker icon issue with webpack
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;


const Heatmap = ({ issues, onMarkerClick }) => {
  const getMarkerColor = (priority) => {
    if (priority === 1) return 'red';
    if (priority === 2) return 'orange';
    if (priority === 3) return 'yellow';
    return 'grey';
  };

  const createCustomIcon = (priority) => {
    return L.divIcon({
      html: `<svg viewBox="0 0 24 24" width="32" height="32" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="${getMarkerColor(priority)}"/></svg>`,
      className: 'bg-transparent border-0',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });
  };

  return (
    <MapContainer center={[11.0168, 76.9558]} zoom={13} style={{ height: '100%', width: '100%' }} className="rounded-lg">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <MarkerClusterGroup>
        {issues.map(issue => (
          <Marker 
            key={issue._id} 
            position={[issue.location.coordinates[1], issue.location.coordinates[0]]}
            icon={createCustomIcon(issue.priority)}
            eventHandlers={{
              click: () => {
                onMarkerClick(issue);
              },
            }}
          />
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
};

export default Heatmap;

