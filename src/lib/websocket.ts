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

// ── Multi-listener support ────────────────────────────────────────────────────
// Multiple hook instances (e.g. global Providers + chat page) can each register
// their own callbacks. When the STOMP client connects it fires all of them.
type StompCallbacks = {
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: unknown) => void;
};

const registeredCallbacks = new Set<StompCallbacks>();

export function getStompClient(): Client | null {
  return stompClient;
}

export function connectStomp(callbacks: StompCallbacks): Client {
  // Always register — even if already connected
  registeredCallbacks.add(callbacks);

  // If already connected, immediately invoke this caller's onConnected so it
  // can subscribe to its topics right away.
  if (stompClient?.connected) {
    callbacks.onConnected?.();
    return stompClient;
  }

  // If the client is activating (not yet connected), let onConnect handle it
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
      // Notify ALL registered listeners
      registeredCallbacks.forEach((cb) => cb.onConnected?.());
    },
    onDisconnect: () => {
      registeredCallbacks.forEach((cb) => cb.onDisconnected?.());
    },
    onStompError: (frame) => {
      registeredCallbacks.forEach((cb) => cb.onError?.(frame));
      handleReconnect();
    },
    onWebSocketClose: () => {
      handleReconnect();
    },
  });

  stompClient.activate();
  return stompClient;
}

export function removeStompCallbacks(callbacks: StompCallbacks): void {
  registeredCallbacks.delete(callbacks);
}

function handleReconnect() {
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
    // Re-create client — existing registeredCallbacks will be re-notified on connect
    const token = getToken();
    if (!token) return;

    stompClient = new Client({
      webSocketFactory: () => new SockJS(`${BASE_URL}/ws`),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 0,
      onConnect: () => {
        reconnectDelay = 1000;
        registeredCallbacks.forEach((cb) => cb.onConnected?.());
      },
      onDisconnect: () => {
        registeredCallbacks.forEach((cb) => cb.onDisconnected?.());
      },
      onStompError: () => handleReconnect(),
      onWebSocketClose: () => handleReconnect(),
    });
    stompClient.activate();
  }, delay);
}

export function disconnectStomp(): void {
  stompClient?.deactivate();
  stompClient = null;
  reconnectDelay = 1000;
  registeredCallbacks.clear();
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
