import { useEffect, useRef, useState } from 'react';

interface GPSData {
  type: 'driver_gps' | 'passenger_gps';
  userId: string;
  latitude: number;
  longitude: number;
  timestamp: number;
}

interface WebSocketGPSOptions {
  userId: string;
  userType: 'driver' | 'passenger';
  onLocationUpdate?: (data: GPSData) => void;
  onRideCancellation?: (data: any) => void;
}

export function useWebSocketGPS({
  userId,
  userType,
  onLocationUpdate,
  onRideCancellation,
}: WebSocketGPSOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [locationData, setLocationData] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Send GPS data via WebSocket
  const sendGPSData = (latitude: number, longitude: number) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const gpsData: GPSData = {
        type: userType === 'driver' ? 'driver_gps' : 'passenger_gps',
        userId,
        latitude,
        longitude,
        timestamp: Date.now(),
      };

      wsRef.current.send(JSON.stringify(gpsData));
      console.log(`📡 ${userType} GPS sent via WebSocket:`, gpsData);
    }
  };

  useEffect(() => {
    if (!userId) return;

    // Create WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    console.log(`🔌 Connecting ${userType} ${userId} to WebSocket: ${wsUrl}`);

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log(`✅ ${userType} ${userId} WebSocket connected`);
      setIsConnected(true);
      setConnectionError(null);

      // Send connection type message
      ws.send(
        JSON.stringify({
          type: `${userType}_connect`,
          [`${userType}Id`]: userId,
        }),
      );
    };

    ws.onmessage = event => {
      try {
        const data = JSON.parse(event.data);
        console.log(`📨 ${userType} received WebSocket message:`, data);

        if (data.type === 'driver_gps' || data.type === 'passenger_gps') {
          // Store location data internally
          if (data.latitude !== undefined && data.longitude !== undefined) {
            setLocationData({ lat: data.latitude, lng: data.longitude });
          }

          // Call optional callback
          if (onLocationUpdate) {
            onLocationUpdate(data);
          }
        } else if (data.type === 'ride_cancelled') {
          // Handle ride cancellation messages
          console.log(`🚫 Ride cancelled message received:`, data);
          if (onRideCancellation) {
            onRideCancellation(data);
          }
        }
      } catch (error) {
        console.error('❌ WebSocket message parsing error:', error);
      }
    };

    ws.onerror = error => {
      console.error(`❌ ${userType} WebSocket error:`, error);
      setConnectionError('WebSocket connection failed');
      setIsConnected(false);
    };

    ws.onclose = event => {
      console.log(
        `🔌 ${userType} ${userId} WebSocket disconnected:`,
        event.reason,
      );
      setIsConnected(false);

      // Disable auto-reconnect to prevent map flicker from frequent reconnections
      console.log(
        `🔌 ${userType} WebSocket disconnected, auto-reconnect disabled to prevent flicker`,
      );
      // No auto-reconnection - user can manually refresh if needed
    };

    // Cleanup on unmount
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close(1000, `${userType} component unmounted`);
      }
    };
  }, [userId, userType, onLocationUpdate, onRideCancellation]);

  return {
    isConnected,
    connectionError,
    sendGPSData,
    lat: locationData?.lat,
    lng: locationData?.lng,
  };
}
