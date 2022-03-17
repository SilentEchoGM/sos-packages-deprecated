import syncedStore, { getYjsValue } from "@syncedstore/core";
import { svelteSyncedStore } from "@syncedstore/svelte";
import type { SOS } from "sos-plugin-types";
import { IndexeddbPersistence } from "y-indexeddb";
import type { Doc } from "yjs";

const defaultGameState = {
  match_guid: "",
  blueName: "",
  blueScore: 0,
  orangeName: "",
  orangeScore: 0,
  time: 0,
  arena: "",
  target: "",
  statEvent: "",
  isOT: false,
  isReplay: false,
  statType: "Shot on Goal",
};

export type GameState = Omit<typeof defaultGameState, "statType"> & {
  statType: SOS.StatFeedEvent;
};

export type UIState = {
  gameStateOpen: boolean;
  playersOpen: boolean;
  emulatorModeOpen: boolean;
};

export enum EmulatorMode {
  manual,
  recording,
  playback,
}

export type EmulatorState = {
  mode: EmulatorMode;
  selectedGameId: string | null;
  recording: boolean;
  playing: boolean;
  listOfGameIds: string[];
};

const rawState = syncedStore({
  emulatorState: {} as EmulatorState,
  gameState: {} as GameState,
  playersStore: {} as SOS.PlayersStore,
  ui: {} as UIState,
});

export const state = svelteSyncedStore(rawState);

const stateDoc = getYjsValue(rawState) as Doc;

const localProvider = new IndexeddbPersistence("state", stateDoc);
