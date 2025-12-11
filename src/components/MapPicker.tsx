import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Location } from '../types';

// Fix for default marker icons in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapPickerProps {
  onLocationSelect: (location: Location) => void;
  initialLocation?: Location;
  searchRadius?: number;
}

const LocationMarker: React.FC<{
  position: [number, number];
  onPositionChange: (lat: number, lng: number) => void;
}> = ({ position, onPositionChange }) => {
  useMapEvents({
    click(e) {
      onPositionChange(e.latlng.lat, e.latlng.lng);
    },
  });

  return <Marker position={position} />;
};

const MapPicker: React.FC<MapPickerProps> = ({
  onLocationSelect,
  initialLocation,
  searchRadius = 100
}) => {
  const [position, setPosition] = useState<[number, number]>(
    initialLocation ? [initialLocation.lat, initialLocation.lng] : [-33.8688, 151.2093] // Default to Sydney
  );
  const [address, setAddress] = useState(initialLocation?.address || '');
  const [loading, setLoading] = useState(false);

  const handlePositionChange = async (lat: number, lng: number) => {
    setPosition([lat, lng]);
    setLoading(true);

    try {
      // Reverse geocoding using Nominatim (OpenStreetMap)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      const addressText = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

      setAddress(addressText);

      onLocationSelect({
        lat,
        lng,
        address: addressText,
        searchRadius
      });
    } catch (error) {
      console.error('Geocoding error:', error);
      const addressText = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      setAddress(addressText);

      onLocationSelect({
        lat,
        lng,
        address: addressText,
        searchRadius
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          handlePositionChange(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your current location. Please select a location on the map.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Location on Map
        </label>
        <p className="text-sm text-gray-500 mb-3">
          Click on the map to mark where you lost your item, or use your current location.
        </p>

        <button
          type="button"
          onClick={handleGetCurrentLocation}
          className="mb-3 inline-flex items-center px-4 py-2 border border-ocean-300 rounded-lg text-sm font-medium text-ocean-700 bg-white hover:bg-ocean-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ocean-500"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Use Current Location
        </button>
      </div>

      <div className="relative h-96 rounded-lg overflow-hidden border-2 border-gray-200">
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} onPositionChange={handlePositionChange} />
          <Circle
            center={position}
            radius={searchRadius}
            pathOptions={{ color: '#0ea5e9', fillColor: '#0ea5e9', fillOpacity: 0.1 }}
          />
        </MapContainer>
      </div>

      <div className="bg-sand-50 p-4 rounded-lg">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-ocean-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Selected Location</p>
            <p className="text-sm text-gray-600 mt-1">
              {loading ? 'Finding address...' : address || 'Click on the map to select a location'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Search radius: {searchRadius}m
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPicker;
