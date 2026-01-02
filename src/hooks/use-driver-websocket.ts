import { useEffect, useState, useCallback } from 'react';
import { DriverWebSocket } from '../websocket/websocket-manager';

interface DriverGPSData {
  lat: number;
  lng: number;
  timestamp: number;
}

interface ChatMessage {
  rideId: string;
  senderId: string;
  senderType: 'driver' | 'passenger';
  message: string;
  timestamp: number;
}

interface DriverWebSocketOptions {
  driverId: string;
  autoConnect?: boolean;
}

export function useDriverWebSocket({
  driverId,
  autoConnect = true,
}: DriverWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [lastGPSData, setLastGPSData] = useState<DriverGPSData | null>(null);
  const [lastChatMessage, setLastChatMessage] = useState<ChatMessage | null>(
    null,
  );

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (driverId) {
      DriverWebSocket.connect(driverId);
      updateConnectionStatus();
    }
  }, [driverId]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    DriverWebSocket.disconnect();
    setIsConnected(false);
    setConnectionError(null);
  }, []);

  // Update connection status
  const updateConnectionStatus = useCallback(() => {
    const status = DriverWebSocket.getStatus();
    setIsConnected(status.isConnected);
    setConnectionError(status.connectionError);
  }, []);

  // Send GPS coordinates
  const sendGPS = useCallback((latitude: number, longitude: number) => {
    const success = DriverWebSocket.sendGPS(latitude, longitude);
    if (success) {
      setLastGPSData({ lat: latitude, lng: longitude, timestamp: Date.now() });
    }
    return success;
  }, []);

  // Send chat message
  const sendChatMessage = useCallback((rideId: string, message: string) => {
    return DriverWebSocket.sendChatMessage(rideId, message);
  }, []);

  // Set up WebSocket connection and listeners
  useEffect(() => {
    if (!driverId) return;

    // Auto-connect if enabled
    if (autoConnect) {
      connect();
    }

    // Set up GPS update listener
    const unsubscribeGPS = DriverWebSocket.onGPSUpdate(data => {
      setLastGPSData({
        lat: data.latitude,
        lng: data.longitude,
        timestamp: data.timestamp,
      });
    });

    // Set up chat message listener
    const unsubscribeChat = DriverWebSocket.onChatMessage(data => {
      setLastChatMessage({
        rideId: data.rideId,
        senderId: data.senderId,
        senderType: data.senderType,
        message: data.message,
        timestamp: data.timestamp,
      });
    });

    // Update connection status periodically
    const statusInterval = setInterval(updateConnectionStatus, 5000);

    return () => {
      unsubscribeGPS();
      unsubscribeChat();
      clearInterval(statusInterval);
    };
  }, [driverId, autoConnect, connect, updateConnectionStatus]);

  return {
    // Connection management
    connect,
    disconnect,
    isConnected,
    connectionError,

    // GPS functionality
    sendGPS,
    lastGPSData,

    // Chat functionality
    sendChatMessage,
    lastChatMessage,

    // Utility
    driverId,
  };
}
