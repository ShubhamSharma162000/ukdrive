import { useEffect, useState, useCallback, useRef } from 'react';
import { PassengerWebSocket } from '../websocket/websocket-manager';
import * as Keychain from 'react-native-keychain';

interface DriverGPSUpdate {
  type: 'driver_location_update';
  driverId: string;
  latitude: number;
  longitude: number;
  timestamp: number;
}

interface DriverLocation {
  id: string;
  name: string;
  vehicleType: string;
  location: { lat: number; lng: number };
  rating: number;
  available: boolean;
  vehicleNumber: string;
  phone: string;
  distance: string;
  eta: string;
}

interface UseDriverGPSUpdatesOptions {
  disabled?: boolean;
  passengerLocation?: { lat: number; lng: number } | null; // For distance filtering
  maxDistance?: number; // Maximum distance in km to track drivers (default: 5km)
  passengerId?: string;
}

export function useDriverGPSUpdates(options: UseDriverGPSUpdatesOptions = {}) {
  const {
    disabled = false,
    passengerLocation = null,
    maxDistance = 5,
    passengerId = '',
  } = options;
  const [driverLocations, setDriverLocations] = useState<
    Map<string, DriverLocation>
  >(new Map());
  const [isConnected, setIsConnected] = useState(false);

  // STABILITY FIX: Track last known positions to prevent unnecessary updates
  const lastKnownPositions = useRef<
    Map<string, { lat: number; lng: number; timestamp: number }>
  >(new Map());

  // STABILITY FIX: Batch updates queue to prevent rapid state changes
  const updateQueue = useRef<DriverGPSUpdate[]>([]);
  const batchUpdateTimer = useRef<NodeJS.Timeout | null>(null);

  // Helper: Calculate distance between two points (Haversine formula)
  const calculateDistance = useCallback(
    (lat1: number, lng1: number, lat2: number, lng2: number): number => {
      const R = 6371; // Earth's radius in km
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLng = ((lng2 - lng1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    },
    [],
  );

  // STABILITY FIX: Process batched updates to reduce re-renders
  const processBatchedUpdates = useCallback(() => {
    if (updateQueue.current.length === 0) return;

    const updates = [...updateQueue.current];
    updateQueue.current = [];

    console.log(
      `🔄 [GPS BATCH] Processing ${updates.length} batched driver GPS updates`,
    );

    setDriverLocations(prev => {
      const newMap = new Map(prev);
      let hasChanges = false;

      updates.forEach(gpsData => {
        const { driverId, latitude, longitude, timestamp } = gpsData;

        // DISTANCE FILTER: Skip drivers too far from passenger
        if (passengerLocation) {
          const distance = calculateDistance(
            passengerLocation.lat,
            passengerLocation.lng,
            latitude,
            longitude,
          );

          if (distance > maxDistance) {
            console.log(
              `🚫 [GPS FILTER] Driver ${driverId.slice(
                -4,
              )} is ${distance.toFixed(
                2,
              )}km away, skipping (max: ${maxDistance}km)`,
            );
            return;
          }
        }

        // THROTTLE: Check if driver moved significantly (>30m)
        const lastPos = lastKnownPositions.current.get(driverId);
        if (lastPos) {
          const movedDistance =
            calculateDistance(lastPos.lat, lastPos.lng, latitude, longitude) *
            1000; // Convert to meters
          const timeSinceLastUpdate = timestamp - lastPos.timestamp;

          // Skip if driver hasn't moved much (<30m) and update was recent (<15s)
          if (movedDistance < 30 && timeSinceLastUpdate < 15000) {
            console.log(
              `🚫 [GPS THROTTLE] Driver ${driverId.slice(
                -4,
              )} moved only ${movedDistance.toFixed(1)}m in ${(
                timeSinceLastUpdate / 1000
              ).toFixed(1)}s, skipping`,
            );
            return;
          }
        }

        // Update last known position
        lastKnownPositions.current.set(driverId, {
          lat: latitude,
          lng: longitude,
          timestamp,
        });

        // Find existing driver or create new
        const existingDriver = Array.from(prev.values()).find(
          driver => driver.id === driverId,
        );

        if (existingDriver) {
          const updatedDriver = {
            ...existingDriver,
            location: { lat: latitude, lng: longitude },
          };
          newMap.set(driverId, updatedDriver);
          hasChanges = true;
        } else {
          const newDriver: DriverLocation = {
            id: driverId,
            name: `Driver ${driverId.slice(-4)}`,
            vehicleType: 'cab',
            location: { lat: latitude, lng: longitude },
            rating: 4.5,
            available: true,
            vehicleNumber: 'Unknown',
            phone: 'Unknown',
            distance: 'Unknown',
            eta: 'Unknown',
          };
          newMap.set(driverId, newDriver);
          hasChanges = true;
        }
      });

      // Only trigger re-render if there were actual changes
      return hasChanges ? newMap : prev;
    });
  }, [passengerLocation, maxDistance, calculateDistance]);

  // STABILITY FIX: Queue updates instead of processing immediately
  const updateDriverLocation = useCallback(
    (gpsData: DriverGPSUpdate) => {
      // Add to queue
      updateQueue.current.push(gpsData);

      // Clear existing timer
      if (batchUpdateTimer.current) {
        clearTimeout(batchUpdateTimer.current);
      }

      // BATCH: Process all queued updates after 2 seconds of inactivity
      batchUpdateTimer.current = setTimeout(() => {
        processBatchedUpdates();
      }, 2000); // Wait 2s to batch multiple updates
    },
    [processBatchedUpdates],
  );

  // Initialize WebSocket connection
  useEffect(() => {
    // Skip if disabled (e.g., in admin mode)
    if (disabled) {
      console.log('🔴 [DRIVER GPS] GPS listener DISABLED - skipping setup');
      return;
    }

    console.log('🔌 [DRIVER GPS] Setting up GPS update listener...');

    // Force connect WebSocket immediately
    PassengerWebSocket.connect(passengerId);

    // Set up GPS update listener (WebSocket connection is managed globally)
    const unsubscribe = PassengerWebSocket.onGPSUpdate((data: any) => {
      // 🔥 FIX: Only check driver_location_update (server sends this type)
      if (data.type === 'driver_location_update') {
        console.log('🔍 [DRIVER GPS] Received GPS data:', data);
        console.log(
          '🔍 [DRIVER GPS] driverId:',
          data.driverId,
          'userId:',
          data.userId,
        );

        // 🔥 FIX: Prioritize driverId over userId to avoid ID mismatch
        const driverId = data.driverId || data.userId;
        if (!driverId) {
          console.warn('⚠️ [DRIVER GPS] No driver ID found in GPS data:', data);
          return;
        }

        // 🔥 FIX: Normalize driver ID to prevent duplicates
        const normalizedDriverId = driverId.toString().trim();

        updateDriverLocation({
          type: 'driver_location_update',
          driverId: normalizedDriverId,
          latitude: data.latitude,
          longitude: data.longitude,
          timestamp: data.timestamp,
        });
      }
    });

    // Check WebSocket status and set up reconnection
    const checkConnection = () => {
      const status = PassengerWebSocket.getStatus();
      setIsConnected(status.isConnected);

      if (!status.isConnected) {
        console.log(
          '🔌 [DRIVER GPS] WebSocket disconnected, attempting reconnect...',
        );
        PassengerWebSocket.connect(passengerId);
      }
    };

    // Initial check
    checkConnection();

    // Force check connection after a delay to ensure WebSocket is ready
    setTimeout(() => {
      checkConnection();
    }, 2000);

    // Set up periodic connection check
    const connectionInterval = setInterval(checkConnection, 3000); // Check every 3 seconds

    console.log(
      '✅ [DRIVER GPS] GPS listener established, WebSocket status:',
      PassengerWebSocket.getStatus().isConnected,
    );

    return () => {
      console.log('🔌 [DRIVER GPS] Removing GPS listener...');
      unsubscribe();
      clearInterval(connectionInterval);

      // CLEANUP: Clear batch timer and process remaining updates
      if (batchUpdateTimer.current) {
        clearTimeout(batchUpdateTimer.current);
        batchUpdateTimer.current = null;
      }

      // Process any remaining queued updates before unmounting
      if (updateQueue.current.length > 0) {
        console.log(
          `🧹 [GPS CLEANUP] Processing ${updateQueue.current.length} remaining updates before unmount`,
        );
        processBatchedUpdates();
      }

      setIsConnected(false);
    };
  }, [updateDriverLocation, disabled, processBatchedUpdates]);

  // Convert Map to Array for easy use in components
  const getDriverLocationsArray = useCallback(() => {
    return Array.from(driverLocations.values());
  }, [driverLocations]);

  // Get specific driver location
  const getDriverLocation = useCallback(
    (driverId: string) => {
      return driverLocations.get(driverId);
    },
    [driverLocations],
  );

  // Clear all driver locations
  const clearDriverLocations = useCallback(() => {
    setDriverLocations(new Map());
  }, []);

  return {
    driverLocations: getDriverLocationsArray(),
    getDriverLocation,
    clearDriverLocations,
    isConnected,
    updateDriverLocation,
  };
}
