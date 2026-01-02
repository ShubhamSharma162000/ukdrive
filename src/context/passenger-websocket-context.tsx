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

interface NotificationMessage {
  id: string;
  title: string;
  body: string;
  timestamp: number;
}

interface PassengerWebSocketContextType {
  isConnected: boolean;
  connectionError: string | null;
  messages: ChatMessage[];
  notifications: NotificationMessage[];

  sendMessage: (message: string, rideId: string) => void;
  clearMessages: () => void;
  clearNotifications: () => void;
}

const PassengerWebSocketContext =
  createContext<PassengerWebSocketContextType | null>(null);

interface PassengerWebSocketProviderProps {
  children: ReactNode;
}

export function PassengerWebSocketProvider({
  children,
}: PassengerWebSocketProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);

  const [passengerId, setPassengerId] = useState(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const credentials = await Keychain.getGenericPassword();
        if (credentials) {
          const storedData = JSON.parse(credentials.password);
          console.log(storedData);
          setPassengerId(storedData?.id);
        }
      } catch (e) {
        console.error('Failed to load user data:', e);
      } finally {
      }
    };

    loadUserData();
  }, []);

  const sendMessage = (message: string, rideId: string) => {
    console.log(' [PASSENGER-CHAT] Sending message via global WebSocket:', {
      message,
      rideId,
    });

    if (WebSocketManager.PassengerWebSocket.sendChatMessage(rideId, message)) {
      const newMessage: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        senderId: passengerId || '',
        senderType: 'passenger',
        message: message.trim(),
        timestamp: Date.now(),
        rideId,
      };

      setMessages(prev => [...prev, newMessage]);
    } else {
      console.error(
        '❌ [PASSENGER-CHAT] Cannot send message - WebSocket not connected',
      );
    }
  };

  const clearMessages = () => setMessages([]);
  const clearNotifications = () => setNotifications([]);

  useEffect(() => {
    if (!passengerId) {
      console.log('❌ [PASSENGER-CHAT] No passengerId provided');
      return;
    }

    console.log(
      '💬 [PASSENGER-CHAT] Connecting to global WebSocket manager for:',
      passengerId,
    );

    // Connect WebSocket
    WebSocketManager.PassengerWebSocket.connect(passengerId);

    setIsConnected(true);
    setConnectionError(null);

    // CHAT listener
    const chatUnsubscribe = WebSocketManager.PassengerWebSocket.onChatMessage(
      (data: any) => {
        const newMessage: ChatMessage = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          senderId: data.senderId,
          senderType: data.senderType,
          message: data.message,
          timestamp: data.timestamp,
          rideId: data.rideId,
        };

        setMessages(prev => [...prev, newMessage]);
      },
    );

    // 🔔 NOTIFICATION listener
    const notificationUnsubscribe =
      WebSocketManager.PassengerWebSocket.onNotification((data: any) => {
        console.log('🔔 Notification received:', data);

        const notif: NotificationMessage = {
          id: `notif_${Date.now()}_${Math.random().toString(36).substring(2)}`,
          title: data.title ?? 'Notification',
          body: data.body ?? '',
          timestamp: Date.now(),
        };

        setNotifications(prev => [...prev, notif]);
      });

    return () => {
      chatUnsubscribe?.();
      notificationUnsubscribe?.();
    };
  }, [passengerId]);

  const contextValue: PassengerWebSocketContextType = {
    isConnected,
    connectionError,
    messages,
    notifications,
    sendMessage,
    clearMessages,
    clearNotifications,
  };

  return (
    <PassengerWebSocketContext.Provider value={contextValue}>
      {children}
    </PassengerWebSocketContext.Provider>
  );
}

export function usePassengerWebSocket() {
  const context = useContext(PassengerWebSocketContext);
  if (!context) {
    throw new Error(
      'usePassengerWebSocket must be used within PassengerWebSocketProvider',
    );
  }
  return context;
}
