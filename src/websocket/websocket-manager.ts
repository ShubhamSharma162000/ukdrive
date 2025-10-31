/**
 * Global WebSocket Connection Manager
 * Provides separate singleton connections for drivers and passengers
 * Eliminates duplicate connections and improves performance
 */

interface GPSData {
  type: 'driver_gps' | 'passenger_gps' | 'driver_location_update';
  userId?: string;
  driverId?: string;
  latitude: number;
  longitude: number;
  timestamp: number;
}

interface ChatMessage {
  type: 'chat_message' | 'chat_message_driver' | 'chat_message_passenger';
  rideId: string;
  senderId: string;
  senderType: 'driver' | 'passenger';
  message: string;
  timestamp: number;
}

interface WebSocketManager {
  ws: WebSocket | null;
  isConnected: boolean;
  connectionError: string | null;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
  reconnectDelay: number;
  listeners: Map<string, Set<(data: any) => void>>;
  currentUserId: string | null;
  userType: 'driver' | 'passenger';
  heartbeatInterval: number | null;
}

// Singleton instances for driver and passenger connections
let driverWebSocketManager: WebSocketManager | null = null;
let passengerWebSocketManager: WebSocketManager | null = null;

function createWebSocketManager(
  userType: 'driver' | 'passenger',
): WebSocketManager {
  return {
    ws: null,
    isConnected: false,
    connectionError: null,
    reconnectAttempts: 0,
    maxReconnectAttempts: userType === 'driver' ? 10 : 15, // More attempts for both, passengers get more retries
    reconnectDelay: userType === 'driver' ? 1000 : 1500, // Faster reconnection for both
    listeners: new Map(),
    currentUserId: null,
    userType,
    heartbeatInterval: null,
  };
}

function getWebSocketManager(
  userType: 'driver' | 'passenger',
): WebSocketManager {
  if (userType === 'driver') {
    if (!driverWebSocketManager) {
      driverWebSocketManager = createWebSocketManager('driver');
    }
    return driverWebSocketManager;
  } else {
    if (!passengerWebSocketManager) {
      passengerWebSocketManager = createWebSocketManager('passenger');
    }
    return passengerWebSocketManager;
  }
}

function connect(manager: WebSocketManager, userId: string) {
  // CRITICAL FIX: Prevent duplicate connections from same user ID
  if (manager.ws && manager.currentUserId === userId) {
    if (manager.isConnected) {
      console.log(
        `✅ ${manager.userType} ${userId} ALREADY CONNECTED - BLOCKING duplicate connection attempt`,
      );
      return;
    }
  }

  // STORM PREVENTION: If switching users, clean up previous connection first
  if (manager.currentUserId && manager.currentUserId !== userId) {
    console.log(
      `🛑 STORM PREVENTION: Cleaning up previous ${manager.userType} connection before switching from ${manager.currentUserId} to ${userId}`,
    );
    disconnect(manager);
    // Add small delay to prevent rapid switching
    setTimeout(() => {
      connectInternal(manager, userId);
    }, 100);
    return;
  }

  connectInternal(manager, userId);
}

function connectInternal(manager: WebSocketManager, userId: string) {
  // 🚫 PHANTOM ID BLOCKER: Block non-existent user IDs permanently
  // Note: 4f25ccfd-8393-4d41-926b-2e39edb495b6 was a test phantom ID, now removed
  const phantomIds: string[] = []; // No phantom IDs to block currently
  if (phantomIds.includes(userId)) {
    console.log(
      `🚫 PHANTOM BLOCKED: ${manager.userType} ${userId} DOES NOT EXIST in database - permanently blocked`,
    );
    return;
  }

  // 🛑 EMERGENCY STORM PREVENTION: Block driver in passenger context
  if (
    manager.userType === 'passenger' &&
    userId === '759e45a4-163f-4b39-8f29-ad7fcf613ba7'
  ) {
    console.log(
      `🚫 CONTEXT ERROR: Driver ID ${userId} trying to connect as passenger - BLOCKED`,
    );
    return;
  }

  // Rate limit remaining valid IDs - MORE LENIENT for passengers
  const now = Date.now();
  const lastConnection = (manager as any).lastConnectionAttempt || 0;
  const cooldownTime = manager.userType === 'passenger' ? 500 : 3000; // 🔥 FIX: 0.5s for passengers, 3s for drivers
  if (now - lastConnection < cooldownTime) {
    console.log(
      `🚫 RATE LIMITED: ${manager.userType} ${userId} waiting ${
        cooldownTime / 1000
      }s...`,
    );
    return;
  }
  (manager as any).lastConnectionAttempt = now;

  // Close existing connection if needed
  if (manager.ws) {
    if (
      manager.ws.readyState === WebSocket.OPEN &&
      manager.currentUserId === userId
    ) {
      console.log(
        `✅ ${manager.userType} ${userId} already connected and stable`,
      );
      return;
    }

    // Clean up old connection
    console.log(`🔧 Cleaning up previous ${manager.userType} connection`);
    manager.ws.close();
    manager.ws = null;
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/ws`;

  console.log(
    `🔌 Connecting ${manager.userType} ${userId} to WebSocket: ${wsUrl}`,
  );

  const ws = new WebSocket(wsUrl);
  manager.ws = ws;
  manager.currentUserId = userId;

  ws.onopen = () => {
    console.log(
      `✅ ${manager.userType} ${userId} WebSocket connected (Global Manager)`,
    );
    manager.isConnected = true;
    manager.connectionError = null;
    manager.reconnectAttempts = 0;

    // Send connection type message
    ws.send(
      JSON.stringify({
        type: `${manager.userType}_connect`,
        [`${manager.userType}Id`]: userId,
      }),
    );

    // Start heartbeat for drivers to maintain connection
    if (manager.userType === 'driver') {
      manager.heartbeatInterval = window.setInterval(() => {
        if (manager.ws && manager.isConnected) {
          ws.send(
            JSON.stringify({
              type: 'heartbeat',
              driverId: userId,
            }),
          );
          // Reduce WebSocket heartbeat logging spam - only log occasionally
          if (Date.now() % 300000 < 5000) {
            // Log ~once every 5 minutes
            console.log(`💓 Driver ${userId} WebSocket heartbeat sent`);
          }
        }
      }, 30000); // Send heartbeat every 30 seconds for better connection stability
    }
  };

  ws.onmessage = event => {
    try {
      const data = JSON.parse(event.data);
      console.log(`📨 ${manager.userType} received WebSocket message:`, data);

      // Broadcast to all listeners based on message type
      const messageType = data.type;
      const listeners = manager.listeners.get(messageType);
      if (listeners) {
        listeners.forEach(callback => callback(data));
      }

      // Also broadcast to generic listeners
      const genericListeners = manager.listeners.get('*');
      if (genericListeners) {
        genericListeners.forEach(callback => callback(data));
      }
    } catch (error) {
      console.error(
        `❌ ${manager.userType} WebSocket message parse error:`,
        error,
      );
    }
  };

  ws.onclose = event => {
    console.log(
      `🔌 ${manager.userType} ${userId} WebSocket disconnected:`,
      event.code,
      event.reason,
    );
    manager.isConnected = false;

    // For drivers, ALWAYS attempt reconnection unless it's an intentional disconnect
    // For passengers, attempt reconnection on abnormal closures
    const shouldReconnect =
      manager.userType === 'driver'
        ? event.code !== 1000 &&
          manager.reconnectAttempts < manager.maxReconnectAttempts
        : event.code !== 1000 &&
          manager.reconnectAttempts < manager.maxReconnectAttempts;

    if (shouldReconnect) {
      setTimeout(() => {
        manager.reconnectAttempts++;
        console.log(
          `🔄 ${manager.userType} reconnection attempt ${manager.reconnectAttempts}/${manager.maxReconnectAttempts}`,
        );
        connect(manager, userId);
      }, manager.reconnectDelay);
    } else if (manager.userType === 'driver' && event.code !== 1000) {
      // For drivers, log when max attempts reached
      console.log(`❌ ${manager.userType} max reconnection attempts reached`);
    }
  };

  ws.onerror = error => {
    console.error(`❌ ${manager.userType} ${userId} WebSocket error:`, error);
    manager.connectionError = 'Connection failed';
    manager.isConnected = false;
  };
}

function disconnect(manager: WebSocketManager) {
  if (manager.ws) {
    console.log(
      `🔌 Disconnecting ${manager.userType} ${manager.currentUserId} WebSocket`,
    );

    // Clear heartbeat interval
    if (manager.heartbeatInterval) {
      clearInterval(manager.heartbeatInterval);
      manager.heartbeatInterval = null;
    }

    manager.ws.close(1000, 'User disconnect');
    manager.ws = null;
    manager.isConnected = false;
    manager.currentUserId = null;
  }
}

function sendMessage(manager: WebSocketManager, message: any) {
  if (manager.ws && manager.isConnected) {
    manager.ws.send(JSON.stringify(message));
    console.log(`📡 ${manager.userType} message sent via WebSocket:`, message);
    return true;
  } else {
    console.warn(
      `⚠️ ${manager.userType} WebSocket not connected, message not sent:`,
      message,
    );
    return false;
  }
}

function addListener(
  manager: WebSocketManager,
  messageType: string,
  callback: (data: any) => void,
) {
  if (!manager.listeners.has(messageType)) {
    manager.listeners.set(messageType, new Set());
  }
  manager.listeners.get(messageType)!.add(callback);
}

function removeListener(
  manager: WebSocketManager,
  messageType: string,
  callback: (data: any) => void,
) {
  const listeners = manager.listeners.get(messageType);
  if (listeners) {
    listeners.delete(callback);
    if (listeners.size === 0) {
      manager.listeners.delete(messageType);
    }
  }
}

// Public API for Driver WebSocket
export const DriverWebSocket = {
  connect: (userId: string) => {
    const manager = getWebSocketManager('driver');
    connect(manager, userId);
  },

  disconnect: () => {
    const manager = getWebSocketManager('driver');
    disconnect(manager);
  },

  sendGPS: (latitude: number, longitude: number) => {
    const manager = getWebSocketManager('driver');
    if (manager.currentUserId) {
      // FIX: Prevent duplicate GPS sends within 2 seconds
      const now = Date.now();
      const lastGPSSend = (manager as any).lastGPSSend || {
        lat: 0,
        lng: 0,
        timestamp: 0,
      };

      const timeDiff = now - lastGPSSend.timestamp;
      const distanceDiff = Math.sqrt(
        Math.pow(latitude - lastGPSSend.lat, 2) +
          Math.pow(longitude - lastGPSSend.lng, 2),
      );

      // Skip if same location and less than 1 second ago (faster updates for real-time tracking)
      if (timeDiff < 1000 && distanceDiff < 0.0001) {
        console.log(
          '🚫 [WEBSOCKET FIX] Skipping duplicate GPS send to prevent flickering',
        );
        return true; // Return true to avoid retry logic
      }

      // Update last send reference
      (manager as any).lastGPSSend = {
        lat: latitude,
        lng: longitude,
        timestamp: now,
      };

      const gpsData: GPSData = {
        type: 'driver_gps',
        userId: manager.currentUserId,
        latitude,
        longitude,
        timestamp: now,
      };
      return sendMessage(manager, gpsData);
    }
    return false;
  },

  sendChatMessage: (rideId: string, message: string) => {
    const manager = getWebSocketManager('driver');
    if (manager.currentUserId) {
      const chatData: ChatMessage = {
        type: 'chat_message',
        rideId,
        senderId: manager.currentUserId,
        senderType: 'driver',
        message,
        timestamp: Date.now(),
      };
      return sendMessage(manager, chatData);
    }
    return false;
  },

  onGPSUpdate: (callback: (data: GPSData) => void) => {
    const manager = getWebSocketManager('driver');
    addListener(manager, 'driver_gps', callback);
    addListener(manager, 'passenger_gps', callback);

    return () => {
      removeListener(manager, 'driver_gps', callback);
      removeListener(manager, 'passenger_gps', callback);
    };
  },

  onChatMessage: (callback: (data: ChatMessage) => void) => {
    const manager = getWebSocketManager('driver');
    addListener(manager, 'chat_message', callback);

    return () => {
      removeListener(manager, 'chat_message', callback);
    };
  },

  onRideUpdate: (callback: (data: any) => void) => {
    const manager = getWebSocketManager('driver');
    addListener(manager, 'ride_status_update', callback);
    addListener(manager, 'ride_cancellation', callback);

    return () => {
      removeListener(manager, 'ride_status_update', callback);
      removeListener(manager, 'ride_cancellation', callback);
    };
  },

  onWalletUpdate: (callback: (data: any) => void) => {
    const manager = getWebSocketManager('driver');
    addListener(manager, 'wallet_balance_update', callback);

    return () => {
      removeListener(manager, 'wallet_balance_update', callback);
    };
  },

  // Generic message listener for any message type
  onMessage: (messageType: string, callback: (data: any) => void) => {
    const manager = getWebSocketManager('driver');
    addListener(manager, messageType, callback);

    return () => {
      removeListener(manager, messageType, callback);
    };
  },

  getStatus: () => {
    const manager = getWebSocketManager('driver');
    return {
      isConnected: manager.isConnected,
      connectionError: manager.connectionError,
      currentUserId: manager.currentUserId,
    };
  },
};

// Public API for Passenger WebSocket
export const PassengerWebSocket = {
  connect: (userId: string) => {
    const manager = getWebSocketManager('passenger');
    connect(manager, userId);
  },

  disconnect: () => {
    const manager = getWebSocketManager('passenger');
    disconnect(manager);
  },

  sendGPS: (latitude: number, longitude: number) => {
    const manager = getWebSocketManager('passenger');
    if (manager.currentUserId) {
      const gpsData: GPSData = {
        type: 'passenger_gps',
        userId: manager.currentUserId,
        latitude,
        longitude,
        timestamp: Date.now(),
      };
      return sendMessage(manager, gpsData);
    }
    return false;
  },

  sendChatMessage: (rideId: string, message: string) => {
    const manager = getWebSocketManager('passenger');
    if (manager.currentUserId) {
      const chatData: ChatMessage = {
        type: 'chat_message',
        rideId,
        senderId: manager.currentUserId,
        senderType: 'passenger',
        message,
        timestamp: Date.now(),
      };
      return sendMessage(manager, chatData);
    }
    return false;
  },

  onGPSUpdate: (callback: (data: GPSData) => void) => {
    const manager = getWebSocketManager('passenger');
    addListener(manager, 'driver_location_update', callback);
    addListener(manager, 'passenger_gps', callback);

    return () => {
      removeListener(manager, 'driver_location_update', callback);
      removeListener(manager, 'passenger_gps', callback);
    };
  },

  onChatMessage: (callback: (data: ChatMessage) => void) => {
    const manager = getWebSocketManager('passenger');
    addListener(manager, 'chat_message', callback);

    return () => {
      removeListener(manager, 'chat_message', callback);
    };
  },

  onRideUpdate: (callback: (data: any) => void) => {
    const manager = getWebSocketManager('passenger');
    addListener(manager, 'ride_status_update', callback);
    addListener(manager, 'ride_cancellation', callback);

    return () => {
      removeListener(manager, 'ride_status_update', callback);
      removeListener(manager, 'ride_cancellation', callback);
    };
  },

  onWalletUpdate: (callback: (data: any) => void) => {
    const manager = getWebSocketManager('passenger');
    addListener(manager, 'wallet_balance_update', callback);

    return () => {
      removeListener(manager, 'wallet_balance_update', callback);
    };
  },

  getStatus: () => {
    const manager = getWebSocketManager('passenger');
    return {
      isConnected: manager.isConnected,
      connectionError: manager.connectionError,
      currentUserId: manager.currentUserId,
    };
  },
};
