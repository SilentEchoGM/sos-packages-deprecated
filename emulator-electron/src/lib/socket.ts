import { getLogger } from "./logger";
import { Server } from "socket.io";
import http from "http";
import type { DefaultEventsMap } from "socket.io/dist/typed-events";
import { handlers } from "./socketHandlers";
import { SOSEmulator } from "sos-emulator-types";

export const log = getLogger({ filepath: "svelte/src/lib/backend/socket.ts" });

export const httpServer = new http.Server();

httpServer.on("listening", () => {
  const address = httpServer.address();
  if (typeof address === "string" || !address) return;

  log.info(`HTTP Server listening on ${address.port}`, address);
});

export const ioBackend = new Server<
  SOSEmulator.FrontendToBackendEvents,
  SOSEmulator.BackendToFrontendEvents,
  DefaultEventsMap
>(httpServer, {
  cors: {
    origin: "http://localhost:34952",
  },
});

ioBackend.on("listening", () => {
  log.info("ioBackend now listening.");
});

export const startSocketIOListening = () => {
  log.info("Trying to start the HTTP Server listening");
  httpServer.listen({
    port: 34001,
    ipv6Only: false,
  });
};

const reconnectTimeout = 500;
let reconnectTries = 0;
let reconnectTimer: NodeJS.Timeout;

httpServer.on("error", (err: Record<string, any>) => {
  if (err.code === "EADDRINUSE") {
    const tries = ++reconnectTries < 15 ? reconnectTries : 15;
    const timeout = tries * reconnectTimeout;

    log.error(
      `ioBackend address in use. Tried ${reconnectTries} time${
        reconnectTries === 1 ? "" : "s"
      }. Retrying in ${timeout}ms.`
    );

    if (reconnectTimer) clearTimeout(reconnectTimer);
    if (reconnectTries > 20)
      reconnectTimer = setTimeout(startSocketIOListening, timeout);

    return;
  }

  log.error("ioBackend error", {
    err: err.message,
    stack: err.stack,
    code: err.code,
  });
});

ioBackend.on("connection", (socket) => {
  log.info("Client connected to ioBackend.", { ...socket.handshake.query });

  const {
    sendPacketHandler,
    closeWSSHandler,
    stopRecordingHandler,
    startRecordingHandler,
    startPlaybackHandler,
    stopPlaybackHandler,
    openWSSHandler,
    getPlaybackLibraryHandler,
  } = handlers(socket);

  socket.on("send-packet", sendPacketHandler);
  socket.on("close-wss", closeWSSHandler);
  socket.on("open-wss", openWSSHandler);
  socket.on("start-playback", startPlaybackHandler);
  socket.on("stop-playback", stopPlaybackHandler);
  socket.on("get-playback-library", getPlaybackLibraryHandler);
  socket.on("start-recording", startRecordingHandler);
  socket.on("stop-recording", stopRecordingHandler);
});
