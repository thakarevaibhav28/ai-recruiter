import { useEffect, useRef } from "react";
import { socket } from "../utils/socket";

type EventHandler = (...args: any[]) => void;

/**
 * Connects to the Socket.IO server, joins the "admins" room,
 * and registers event listeners. Cleans up on unmount.
 *
 * @param events - Map of event names to handler functions
 */
export const useAdminSocket = (events: Record<string, EventHandler>) => {
  const eventsRef = useRef(events);
  eventsRef.current = events;

  useEffect(() => {
    // Connect if not already connected
    if (!socket.connected) {
      socket.connect();
    }

    // Join admins room
    socket.emit("admin-join-room");

    // Register listeners
    const entries = Object.entries(eventsRef.current);
    entries.forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    return () => {
      // Remove listeners on unmount
      entries.forEach(([event, handler]) => {
        socket.off(event, handler);
      });
    };
  }, []);
};
