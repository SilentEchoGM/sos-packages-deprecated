import type { SOS } from "sos-plugin-types";
export declare namespace SOSEmulator {
    interface FrontendToBackendEvents {
        "send-packet": (packet: SOS.Packet) => void;
        "close-wss": () => void;
        "open-wss": () => void;
        "start-playback": (gameId: string) => void;
        "stop-playback": () => void;
        "get-playback-library": () => void;
        "start-recording": () => void;
        "stop-recording": () => void;
    }
    interface BackendToFrontendEvents {
        "wss-closed": () => void;
        "wss-open": () => void;
        "playback-started": () => void;
        "playback-stopped": () => void;
        "playback-library": (library: string[]) => void;
        "recording-started": () => void;
        "recording-stopped": () => void;
        initial: () => void;
    }
}
//# sourceMappingURL=index.d.ts.map