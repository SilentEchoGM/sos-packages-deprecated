import { getLogger } from "./logger";
import { io, Socket } from "socket.io-client";
import { type Writable, writable } from "svelte/store";
import type { SOSEmulator } from "sos-emulator-types";

type SocketIOFrontendToBackendPayload = {
  channel: keyof SOSEmulator.FrontendToBackendEvents;
  data: any;
};

type SocketIOBackendToFrontendPayload = {
  channel: keyof SOSEmulator.BackendToFrontendEvents;
  data: any;
};

const log = getLogger({ filepath: "svelte/src/lib/frontend/socket.ts" });

type SocketStore = Pick<
  Writable<SocketIOBackendToFrontendPayload>,
  "subscribe"
> & {
  set: ({ channel, data }: SocketIOFrontendToBackendPayload) => void;
  send: ({ channel, data }: SocketIOFrontendToBackendPayload) => void;
  socket: Socket;
  get connected(): boolean;
  history: SocketIOBackendToFrontendPayload[];
};

export const createSocketStore = (): SocketStore => {
  const { subscribe, set } = writable<SocketIOBackendToFrontendPayload>({
    channel: "initial",
    data: {},
  });

  const socket: Socket<
    SOSEmulator.BackendToFrontendEvents,
    SOSEmulator.FrontendToBackendEvents
  > = io("ws://localhost:34001", {
    query: {
      process: "frontend",
    },
  });

  const history: SocketIOBackendToFrontendPayload[] = [];

  const pushToHistory = (payload: SocketIOBackendToFrontendPayload) => {
    const cacheMax = 100;
    const newHistory = [payload, ...history.slice(0, cacheMax)];
    history.length = 0;
    history.push(...newHistory);
  };

  const send = ({ channel, data }: SocketIOFrontendToBackendPayload) => {
    log.verbose("Sending socket message", { channel, data });
    socket.emit(channel, data);
  };

  socket.on("connect", () => {
    log.info("Frontend connected to ioBackend.");
  });

  socket.onAny((channel, data) => {
    const payload = { channel, data } as SocketIOBackendToFrontendPayload;
    set(payload);
    pushToHistory(payload);
  });

  return {
    set: send,
    send,
    subscribe,
    socket,
    get connected() {
      return socket.connected;
    },
    history,
  };
};

export const socket = createSocketStore();
