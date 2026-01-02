import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import * as WebSocketManager from '../websocket/websocket-manager';
import * as Keychain from 'react-native-keychain';

interface ChatMessage {
  id: string;
  senderId: string;
  senderType: 'passenger' | 'driver';
  message: string;
  timestamp: number;
  rideId: string;
}

interface DriverWebSocketContextType {
  isConnected: boolean;
  connectionError: string | null;
  messages: ChatMessage[];
  sendMessage: (message: string, rideId: string) => void;
  clearMessages: () => void;
}

const DriverWebSocketContext = createContext<DriverWebSocketContextType | null>(
  null,
);

interface DriverWebSocketProviderProps {
  children: ReactNode;
}

export function DriverWebSocketProvider({
  children,
}: DriverWebSocketProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [driverId, setDriverId] = useState('');

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const credentials = await Keychain.getGenericPassword();
        if (credentials) {
          const storedData = JSON.parse(credentials.password);
          console.log(storedData);
          setDriverId(storedData?.id);
        }
      } catch (e) {
        console.error('Failed to load user data:', e);
      } finally {
      }
    };

    loadUserData();
  }, []);

  const sendMessage = (message: string, rideId: string) => {
    console.log('💬 [DRIVER-CHAT] Sending message via global WebSocket:', {
      message,
      rideId,
    });

    // Use global WebSocket manager to send message
    if (WebSocketManager.DriverWebSocket.sendChatMessage(rideId, message)) {
      // Add message to local state immediately (optimistic update)
      const newMessage: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        senderId: driverId,
        senderType: 'driver',
        message: message.trim(),
        timestamp: Date.now(),
        rideId,
      };

      setMessages(prev => {
        if (prev.some(msg => msg.id === newMessage.id)) {
          return prev;
        }
        return [...prev, newMessage].sort((a, b) => a.timestamp - b.timestamp);
      });
    } else {
      console.error(
        ' [DRIVER-CHAT] Cannot send message - WebSocket not connected',
      );
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  useEffect(() => {
    if (!driverId) {
      console.log(' [DRIVER-CHAT] No driverId provided');
      return;
    }

    console.log(
      ' [DRIVER-CHAT] Connecting to global WebSocket manager for:',
      driverId,
    );

    // Connect via global WebSocket manager
    WebSocketManager.DriverWebSocket.connect(driverId);

    // Set connected status optimistically
    setIsConnected(true);
    setConnectionError(null);

    // Listen for chat messages
    const chatUnsubscribe = WebSocketManager.DriverWebSocket.onChatMessage(
      (data: any) => {
        console.log(
          ' [DRIVER-CHAT] Received message from global WebSocket:',
          data,
        );

        const newMessage: ChatMessage = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          senderId: data.senderId,
          senderType: data.senderType,
          message: data.message,
          timestamp: data.timestamp,
          rideId: data.rideId,
        };

        setMessages(prev => {
          // Avoid duplicate messages based on content and timestamp
          if (
            prev.some(
              msg =>
                msg.timestamp === newMessage.timestamp &&
                msg.senderId === newMessage.senderId &&
                msg.message === newMessage.message,
            )
          ) {
            return prev;
          }
          return [...prev, newMessage].sort(
            (a, b) => a.timestamp - b.timestamp,
          );
        });
      },
    );

    return () => {
      chatUnsubscribe?.();
    };
  }, [driverId]);

  const contextValue: DriverWebSocketContextType = {
    isConnected,
    connectionError,
    messages,
    sendMessage,
    clearMessages,
  };

  return (
    <DriverWebSocketContext.Provider value={contextValue}>
      {children}
    </DriverWebSocketContext.Provider>
  );
}

export function useDriverWebSocket() {
  const context = useContext(DriverWebSocketContext);
  if (!context) {
    throw new Error(
      'useDriverWebSocket must be used within DriverWebSocketProvider',
    );
  }
  return context;
}
