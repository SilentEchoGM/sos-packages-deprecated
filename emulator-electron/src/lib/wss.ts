import { Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { SOSEmulator } from "sos-emulator-types";
import WebSocket, { WebSocketServer } from "ws";
import { startRecording } from "./recorder";
import { log } from "./socket";

export let socketManager: {
  wss: WebSocket.Server | null;
  ws: WebSocket | null;
} = {
  wss: null,
  ws: null,
};

export const startWSS = (
  socket: Socket<
    SOSEmulator.FrontendToBackendEvents,
    SOSEmulator.BackendToFrontendEvents,
    DefaultEventsMap,
    any
  >,
  port: number = 49122
) =>
  new Promise((resolve, reject) => {
    log.info("Starting SOS emulator");
    const wss = new WebSocketServer({
      port,
    });

    wss.on("connection", (ws) => {
      ws.on("message", (data) => {
        log.info("SOS Emulator WS message", data);
      });
    });

    wss.on("error", (error) => {
      log.error("Error with SOS Emulator WSS", { error });
    });

    wss.on("listening", () => {
      socketManager.wss = wss;
      log.info("SOS Emulator WSS open");
      socket.emit("wss-open");
      resolve(true);
    });

    wss.on("close", () => {
      socketManager.wss = null;
      log.info("SOS Emulator WSS closed");
      socket.emit("wss-closed");
    });
  });

export const startListener = (
  socket: Socket<
    SOSEmulator.FrontendToBackendEvents,
    SOSEmulator.BackendToFrontendEvents,
    DefaultEventsMap,
    any
  >,
  port: number = 49122
) => {
  log.info("Starting SOS listener");

  const ws = new WebSocket(`ws://localhost:${port}`);
  const recorder = startRecording();

  ws.on("open", () => {
    log.info("Connected to SOS");
    socketManager.ws = ws;
  });

  ws.on("error", (err) => {
    log.error("SOS listener error", err);
    socket.emit("recording-stopped");
  });

  ws.on("message", (data) => {
    const parsed = JSON.parse(data.toString());
    recorder.push(parsed);
  });

  ws.on("close", (code, reason) => {
    log.warn("SOS listener closed", { code, reason });
    socket.emit("recording-stopped");
    socketManager.ws = null;
  });
};
