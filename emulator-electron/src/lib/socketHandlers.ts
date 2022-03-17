import { SOS } from "sos-plugin-types";
import { socketManager, startListener, startWSS } from "./wss";
import { log } from "./socket";
import { startPlayback, stopPlayback } from "./playback";
import { Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { getListOfPlaybackGames } from "./recorder";
import { SOSEmulator } from "sos-emulator-types";

export const handlers = (
  socket: Socket<
    SOSEmulator.FrontendToBackendEvents,
    SOSEmulator.BackendToFrontendEvents,
    DefaultEventsMap,
    any
  >
) => {
  const sendPacketHandler = (packet: SOS.Packet) => {
    log.info('"send-packet" received.', packet);
    if (!socketManager.wss) {
      log.info("unable to send packet");
      return;
    }
    socketManager.wss.clients.forEach((client) => {
      client.send(JSON.stringify(packet));
    });
  };

  const closeWSSHandler = () => {
    log.info("close-wss received");

    if (!socketManager.wss) return log.info("WSS already closed");

    [...socketManager.wss.clients].map((client) => client.close());
    socketManager.wss.close(() => log.info("Closed WSS"));

    socketManager.wss = null;
  };

  const openWSSHandler = () => {
    log.info("open-wss received");

    if (socketManager.wss) {
      log.info("wss already open");
    } else {
      startWSS(socket);
    }
  };

  const stopRecordingHandler = () => {
    log.info("stop-recording");
    socketManager.ws?.close();
    socket.emit("recording-stopped");
  };

  const startRecordingHandler = () => {
    log.info("start-recording");
    startListener(socket);
    socket.emit("recording-started");
  };

  const stopPlaybackHandler = () => {
    log.info("stop-playback");
    stopPlayback();
    socket.emit("playback-stopped");
  };

  const startPlaybackHandler = (gameId: string) => {
    log.info("start-playback");
    startPlayback(socket, gameId);
    socket.emit("playback-started");
  };

  const getPlaybackLibraryHandler = () => {
    log.info("get-playback-library");
    const library = getListOfPlaybackGames();
    socket.emit("playback-library", library);
  };

  return {
    sendPacketHandler,
    closeWSSHandler,
    stopRecordingHandler,
    startRecordingHandler,
    stopPlaybackHandler,
    startPlaybackHandler,
    openWSSHandler,
    getPlaybackLibraryHandler,
  };
};
