import { pipe, identity } from "fp-ts/function";
import { set as S, array as A, either as E, ord as Ord } from "fp-ts";
import { getLogger } from "./logger";
import { loadGame } from "./recorder";
import { DatedPacket } from "./DatedPacket";
import { socketManager, startWSS } from "./wss";
import type { WebSocket } from "ws";
import { stringify } from "fp-ts/lib/Json";
import { Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { SOSEmulator } from "sos-emulator-types";
const log = getLogger({ filepath: "emulator-electron/src/lib/playback.ts" });

let timeout: NodeJS.Timeout;

export const stopPlayback = () => {
  clearTimeout(timeout);
};

export const startPlayback = async (
  socket: Socket<
    SOSEmulator.FrontendToBackendEvents,
    SOSEmulator.BackendToFrontendEvents,
    DefaultEventsMap,
    any
  >,
  gameId: string
) => {
  const packets = await loadGame(gameId)();

  if (!packets) {
    log.warn("No packets loaded to start playback");
    socket.emit("playback-stopped");
    return;
  }

  const playPacket = (i: number, packets: DatedPacket[]) => {
    if (!socketManager.wss) {
      log.error(
        `socketManager.wss is null, unable to send packet #${i}. Stopping playback.`
      );
      socket.emit("playback-stopped");
      return;
    }

    pipe(
      socketManager.wss.clients,
      S.toArray(Ord.trivial as Ord.Ord<WebSocket>),
      A.map((client) => {
        const { date, ...packet } = packets[i];
        const json = pipe(
          packet,
          stringify,
          E.fold((reason) => {
            log.warn("Unable to stringify packet", { reason, packet });
            return "";
          }, identity)
        );

        if (json) {
          client.send(json);
          log.info(`packet #${i} sent`);
        }
      })
    );

    const time = packets[i + 1].date.valueOf() - packets[i].date.valueOf();
    timeout = setTimeout(playPacket, time, i + 1, packets);
  };

  playPacket(1, packets);
};
