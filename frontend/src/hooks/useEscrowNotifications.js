/**
 * Phase 3 — useEscrowNotifications
 *
 * A React hook that subscribes to the Spring Boot STOMP WebSocket broker.
 * Consumers choose which channel to listen on:
 *
 *   useEscrowNotifications()          → /topic/escrows  (global feed)
 *   useEscrowNotifications(escrowId)  → /topic/escrows/{id}
 *
 * Returns: { lastNotification }
 *   lastNotification — the most recent EscrowNotification payload (or null)
 *
 * Dependencies (already in package.json):
 *   @stomp/stompjs    ^7
 *   sockjs-client     ^1.6
 */
import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const WS_URL = import.meta.env.VITE_WS_URL || "http://localhost:8080/ws";

export default function useEscrowNotifications(escrowId = null) {
  const [lastNotification, setLastNotification] = useState(null);
  const clientRef = useRef(null);

  useEffect(() => {
    const topic = escrowId
      ? `/topic/escrows/${escrowId}`
      : "/topic/escrows";

    const stompClient = new Client({
      // SockJS factory — falls back gracefully if native WS is blocked
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      onConnect: () => {
        stompClient.subscribe(topic, (message) => {
          try {
            const notification = JSON.parse(message.body);
            setLastNotification(notification);
          } catch (e) {
            console.warn("[WS] Failed to parse notification:", e);
          }
        });
      },
      onStompError: (frame) => {
        console.warn("[WS] STOMP error:", frame.headers?.message);
      },
    });

    stompClient.activate();
    clientRef.current = stompClient;

    return () => {
      stompClient.deactivate();
    };
  }, [escrowId]);

  return { lastNotification };
}
