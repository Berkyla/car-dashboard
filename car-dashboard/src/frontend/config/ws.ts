declare global {
  interface Window {
    __ENV__?: { WS_URL?: string };
  }
}

export const WS_URL = window.__ENV__?.WS_URL || "ws://localhost:8080";