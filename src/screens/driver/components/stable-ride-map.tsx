import React, { useEffect, useRef, useState } from 'react';
import MapView, { Marker } from 'react-native-maps';
interface StableRideMapProps {
  className?: string;
  pickup?: string;
  destination?: string;
  driverLocation?: { lat: number; lng: number };
  passengerLocation?: { lat: number; lng: number };
  pickupCoordinates?: { lat: number; lng: number };
  destinationCoordinates?: { lat: number; lng: number };
  isLiveSharing?: boolean;
  vehicleType?: string;
  rideStatus?: string;
}

export function StableRideMap({
  className = '',
  driverLocation,
  passengerLocation,
  pickupCoordinates,
  destinationCoordinates,
  isLiveSharing = true,
  vehicleType = 'car',
  rideStatus = 'confirmed',
}: StableRideMapProps) {
  // Debug logging for props
  useEffect(() => {
    console.log('🗺️ [MAP PROPS] StableRideMap received:', {
      driverLocation: !!driverLocation,
      pickupCoordinates: !!pickupCoordinates,
      destinationCoordinates: !!destinationCoordinates,
      rideStatus: rideStatus,
      vehicleType: vehicleType,
      timestamp: new Date().toISOString(),
    });
  }, [
    driverLocation,
    pickupCoordinates,
    destinationCoordinates,
    rideStatus,
    vehicleType,
  ]);

  useEffect(() => {
    console.log(
      '🔄 [RIDE STATUS] Status changed to:',
      rideStatus,
      'at',
      new Date().toISOString(),
    );
    if (rideStatus === 'arrived_at_pickup') {
      console.log(
        '🚨 [DRIVER MAP ALERT] Should hide yellow line and change blue line origin!',
      );
    }
  }, [rideStatus]);

  const mapRef = useRef<MapView | null>(null);
  const googleMapRef = useRef<any>(null);
  const driverMarkerRef = useRef<any>(null);
  const passengerMarkerRef = useRef<any>(null); // Passenger marker reference
  const pickupMarkerRef = useRef<any>(null); // Pickup marker reference
  const destinationMarkerRef = useRef<any>(null); // Destination marker reference
  const yellowRouteRef = useRef<any>(null); // Driver to pickup route
  const blueRouteRef = useRef<any>(null); // Pickup to destination route
  const lastRouteUpdateRef = useRef<{ lat: number; lng: number } | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [lastPanTime, setLastPanTime] = useState(0);
  const prevRideStatusRef = useRef<string | undefined>(rideStatus);
  const lastRouteConfigRef = useRef<string>(''); // Cache route configuration
  const previousDriverLocationRef = useRef<{ lat: number; lng: number } | null>(
    null,
  ); // For bearing calculation
  const [driverBearing, setDriverBearing] = useState<number>(-90); // Current rotation (-90° because icon faces East by default)

  // Helper function to calculate bearing between two GPS coordinates
  const calculateBearing = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number => {
    const toRadians = (deg: number) => deg * (Math.PI / 180);
    const toDegrees = (rad: number) => rad * (180 / Math.PI);

    const dLng = toRadians(lng2 - lng1);
    const lat1Rad = toRadians(lat1);
    const lat2Rad = toRadians(lat2);

    const y = Math.sin(dLng) * Math.cos(lat2Rad);
    const x =
      Math.cos(lat1Rad) * Math.sin(lat2Rad) -
      Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);

    let bearing = toDegrees(Math.atan2(y, x));
    bearing = (bearing + 360) % 360; // Normalize to 0-360

    return bearing;
  };

  // Helper function to get vehicle icon like home page
  const getVehicleIcon = (vehicleType: string) => {
    const iconMap: { [key: string]: string } = {
      bike: '/bike.png',
      scooter: '/bike.png',
      erickshaw: '/auto.png',
      miniauto: '/auto.png',
      auto: '/auto.png',
      car: '/cab.png',
      cab: '/cab.png',
    };
    return iconMap[vehicleType?.toLowerCase()] || '/bike.png'; // Default to bike icon
  };

  const getInitialRegion = () => {
    if (pickupCoordinates) {
      return {
        latitude: pickupCoordinates.lat,
        longitude: pickupCoordinates.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }

    if (destinationCoordinates) {
      return {
        latitude: destinationCoordinates.lat,
        longitude: destinationCoordinates.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }

    if (driverLocation) {
      return {
        latitude: driverLocation.lat,
        longitude: driverLocation.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }
    return {
      latitude: 29.7461,
      longitude: 78.5206,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  };

  return (
    <MapView
      ref={mapRef}
      style={{ flex: 1 }}
      initialRegion={getInitialRegion()}
    >
      {pickupCoordinates && (
        <Marker
          coordinate={{
            latitude: pickupCoordinates.lat,
            longitude: pickupCoordinates.lng,
          }}
          title="Pickup Location"
          // image={require('../assets/')}
          anchor={{ x: 0.5, y: 1 }}
        />
      )}
    </MapView>
  );
}
