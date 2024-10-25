import React, { createContext, useContext, useEffect, useRef } from "react";
import io, { Socket } from "socket.io-client";

const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io(
      "https://ecommerce-fagundes-13c7f6f3f0d3.herokuapp.com"
    );

    socketRef.current.on("connect", () => {
      console.log("Conectado ao servidor WebSocket:", socketRef.current?.id);
    });

    socketRef.current.on("disconnect", () => {
      console.log("Desconectado do servidor WebSocket");
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};
