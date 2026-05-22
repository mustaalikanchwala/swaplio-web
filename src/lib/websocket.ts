'use client';
// ─────────────────────────────────────────────────────────────────────────────
// STOMP over SockJS WebSocket connector
// Browser-only. Reads token from localStorage at connect time.
// ─────────────────────────────────────────────────────────────────────────────

import { Client, type StompSubscription, type messageCallbackType } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { clearAuth, getToken } from './auth';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'https://swaplio-backend.onrender.com';

let stompClient: Client | null = null;
let reconnectDelay = 1000; // start at 1s, max 30s
const MAX_RECONNECT_DELAY = 30000;

export function getStompClient(): Client | null {
  return stompClient;
}

export function connectStomp(callbacks: {
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: unknown) => void;
}): Client {
  if (stompClient?.active) return stompClient;

  const token = getToken();

  stompClient = new Client({
    webSocketFactory: () => new SockJS(`${BASE_URL}/ws`),
    connectHeaders: {
      Authorization: `Bearer ${token ?? ''}`,
    },
    reconnectDelay: 0, // We handle our own backoff
    onConnect: () => {
      reconnectDelay = 1000; // reset backoff on successful connect
      callbacks.onConnected?.();
    },
    onDisconnect: () => {
      callbacks.onDisconnected?.();
    },
    onStompError: (frame) => {
      callbacks.onError?.(frame);
      handleReconnect(callbacks);
    },
    onWebSocketClose: () => {
      handleReconnect(callbacks);
    },
  });

  stompClient.activate();
  return stompClient;
}

function handleReconnect(callbacks: Parameters<typeof connectStomp>[0]) {
  const token = getToken();
  if (!token) {
    // Token gone — session ended, redirect to login
    clearAuth();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return;
  }

  // Exponential backoff reconnect
  const delay = Math.min(reconnectDelay, MAX_RECONNECT_DELAY);
  reconnectDelay = Math.min(reconnectDelay * 2, MAX_RECONNECT_DELAY);

  setTimeout(() => {
    if (stompClient) {
      stompClient.deactivate();
      stompClient = null;
    }
    connectStomp(callbacks);
  }, delay);
}

export function disconnectStomp(): void {
  stompClient?.deactivate();
  stompClient = null;
  reconnectDelay = 1000;
}

export function subscribeToTopic(
  destination: string,
  callback: messageCallbackType
): StompSubscription | null {
  if (!stompClient?.connected) return null;
  return stompClient.subscribe(destination, callback);
}

export function sendMessage(destination: string, body: object): void {
  if (!stompClient?.connected) {
    console.warn('[STOMP] Cannot send — not connected');
    return;
  }
  stompClient.publish({
    destination,
    body: JSON.stringify(body),
  });
}
