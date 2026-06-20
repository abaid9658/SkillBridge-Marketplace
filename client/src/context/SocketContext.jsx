import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineStatus, setOnlineStatus] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (user && token) {
      const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
      
      // Initialize Socket connection
      const socketInstance = io(socketUrl, {
        auth: { token },
        transports: ['websocket'],
      });

      socketRef.current = socketInstance;
      setSocket(socketInstance);

      socketInstance.on('connect', () => {
        setIsConnected(true);
        console.log('🔌 Connected to real-time socket server');
      });

      socketInstance.on('disconnect', () => {
        setIsConnected(false);
        console.log('🔌 Disconnected from real-time socket server');
      });

      // Handle user status events
      socketInstance.on('user_status', ({ userId, status }) => {
        setOnlineStatus((prev) => ({
          ...prev,
          [userId]: status,
        }));
      });

      return () => {
        socketInstance.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      };
    } else {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [user, token]);

  const checkUserOnline = (userIds) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('check_online', userIds, (statuses) => {
        setOnlineStatus((prev) => ({
          ...prev,
          ...statuses,
        }));
      });
    }
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, onlineStatus, checkUserOnline }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
