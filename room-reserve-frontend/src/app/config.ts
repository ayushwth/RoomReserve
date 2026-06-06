declare global {
  interface Window {
    ROOM_RESERVE_API_BASE?: string;
  }
}

const configuredApiBase = window.ROOM_RESERVE_API_BASE || 'http://localhost:8080';

export const API_BASE = configuredApiBase.replace(/\/$/, '');
