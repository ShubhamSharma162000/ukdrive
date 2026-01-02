import { useEffect, useState, useCallback } from 'react';
import { PassengerWebSocket } from '../websocket/websocket-manager';

interface PassengerGPSData {
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

interface PassengerWebSocketOptions {
  passengerId: string;
  autoConnect?: boolean;
}

export function usePassengerWebSocket({
  passengerId,
  autoConnect = true,
}: PassengerWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [lastGPSData, setLastGPSData] = useState<PassengerGPSData | null>(null);
  const [lastChatMessage, setLastChatMessage] = useState<ChatMessage | null>(
    null,
  );

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (passengerId) {
      PassengerWebSocket.connect(passengerId);
      updateConnectionStatus();
    }
  }, [passengerId]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    PassengerWebSocket.disconnect();
    setIsConnected(false);
    setConnectionError(null);
  }, []);

  // Update connection status
  const updateConnectionStatus = useCallback(() => {
    const status = PassengerWebSocket.getStatus();
    setIsConnected(status.isConnected);
    setConnectionError(status.connectionError);
  }, []);

  // Send GPS coordinates
  const sendGPS = useCallback((latitude: number, longitude: number) => {
    const success = PassengerWebSocket.sendGPS(latitude, longitude);
    if (success) {
      setLastGPSData({ lat: latitude, lng: longitude, timestamp: Date.now() });
    }
    return success;
  }, []);

  // Send chat message
  const sendChatMessage = useCallback((rideId: string, message: string) => {
    return PassengerWebSocket.sendChatMessage(rideId, message);
  }, []);

  // Set up WebSocket connection and listeners
  useEffect(() => {
    if (!passengerId) return;

    // Auto-connect if enabled
    if (autoConnect) {
      connect();
    }

    // Set up GPS update listener
    const unsubscribeGPS = PassengerWebSocket.onGPSUpdate(data => {
      setLastGPSData({
        lat: data.latitude,
        lng: data.longitude,
        timestamp: data.timestamp,
      });
    });

    // Set up chat message listener
    const unsubscribeChat = PassengerWebSocket.onChatMessage(data => {
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
  }, [passengerId, autoConnect, connect, updateConnectionStatus]);

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
    passengerId,
  };
}
