import type { SOS } from "sos-plugin-types";

export namespace SOSEmulator {
  export interface FrontendToBackendEvents {
    "send-packet": (packet: SOS.Packet) => void;
    "close-wss": () => void;
    "open-wss": () => void;
    "start-playback": (gameId: string) => void;
    "stop-playback": () => void;
    "get-playback-library": () => void;
    "start-recording": () => void;
    "stop-recording": () => void;
  }
  export interface BackendToFrontendEvents {
    "wss-closed": () => void;
    "wss-open": () => void;
    "playback-started": () => void;
    "playback-stopped": () => void;
    "playback-library": (library: string[]) => void;
    "recording-started": () => void;
    "recording-stopped": () => void;

    //for frontend only
    initial: () => void;
  }
}
