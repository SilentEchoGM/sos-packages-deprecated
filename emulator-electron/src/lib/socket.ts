import { getLogger } from "./logger";
import { Server } from "socket.io";
import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import type { SOS } from "sos-plugin-types";
import type { DefaultEventsMap } from "socket.io/dist/typed-events";

interface FrontendToBackendEvents {
  "send-packet": (packet: SOS.Packet) => void;
  "close-wss": () => void;
  "open-wss": () => void;
}

interface BackendToFrontendEvents {
  "wss-closed": () => void;
  "wss-open": () => void;
}

const log = getLogger({ filepath: "svelte/src/lib/backend/socket.ts" });

export const httpServer = new http.Server();

httpServer.on("listening", () => {
  const address = httpServer.address();
  if (typeof address === "string" || !address) return;

  log.info(`HTTP Server listening on ${address.port}`, address);
});

export const ioBackend = new Server<
  FrontendToBackendEvents,
  BackendToFrontendEvents,
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

let sosEmulator: WebSocket.Server | null;

export const startWSS = (port: number = 49122) => {
  log.info("Starting SOS emulator");
  const wss = new WebSocketServer({
    port,
  });

  wss.on("connection", (ws) => {
    ws.on("message", (data) => {
      log.info("WS message", data);
    });
  });

  wss.on("error", (error) => {
    log.error("Error with SOS Emulator WSS", { error });
    setTimeout(startWSS, 200);
  });

  wss.on("listening", () => {
    sosEmulator = wss;
    log.info("WSS listening");
  });

  wss.on("close", () => {
    sosEmulator = null;
    log.info("WSS closed");
  });

  return wss;
};

ioBackend.on("connection", (socket) => {
  log.info("Client connected to ioBackend.", { ...socket.handshake.query });

  socket.on("send-packet", (packet) => {
    log.info('"send-packet" received.', packet);
    if (!sosEmulator) return;
    sosEmulator.clients.forEach((client) => {
      client.send(JSON.stringify(packet));
    });
  });

  socket.on("close-wss", () => {
    log.info("close-wss received");

    if (!sosEmulator) return log.info("WSS already closed");

    [...sosEmulator.clients].map((client) => client.close());
    sosEmulator.close(() => log.info("Closed WSS"));

    sosEmulator = null;
  });

  socket.on("open-wss", () => {
    log.info("open-wss received");

    startWSS();
    sosEmulator?.on("close", () => {
      socket.emit("wss-closed");
    });
    sosEmulator?.on("listening", () => {
      socket.emit("wss-open");
    });
  });
});
