<script lang="ts">
  import SendPacketButton from "./components/SendPacketButton.svelte";
  import Settings from "./components/Settings.svelte";
  import { getLogger } from "./logger";
  import { keys } from "fp-ts/Record";
  import { onDestroy, onMount } from "svelte";
  import { packetFactory } from "./packetFactory";
  import type { PacketFactory } from "./types";
  import { socket } from "./socket";
  import {
    matchBoolSettings,
    matchSettings,
    players,
    stat,
    target,
    wssOpen,
  } from "./stores";
  import { pipe } from "fp-ts/lib/function";
  import { record as R } from "fp-ts";
  import { trivial } from "fp-ts/Ord";
  import localForage from "localforage";
  import type { SOS } from "sos-plugin-types";
  import { get } from "svelte/store";
  const log = getLogger({ filepath: "svelte/src/routes/index.svelte" });

  const sendEvent = (type: keyof PacketFactory) => {
    log.info("sendEvent", type);

    const fn = packetFactory[type];

    const ids = keys($players);
    const scorer = $players[ids[Math.floor(Math.random() * ids.length)]];

    const assister = pipe(
      $players,
      R.filter(
        (player) => player.id !== scorer.id && player.team === scorer.team
      ),
      R.collect(trivial)((_, player) => player)
    )[Math.floor(Math.random() * 2)];

    const data = {
      ...$matchBoolSettings,
      ...$matchSettings,
      statType: $stat,
      players: $players,
      scorer: type === "game:goal_scored" ? scorer : null,
      assister:
        type === "game:goal_scored" && Math.random() < 0.5 ? assister : null,
      mainTarget: type === "game:statfeed_event" ? scorer : null,
      target: $target,
    };

    log.info("Packet data:", {
      data,
      raw: {
        scorer,
        assister,
      },
    });
    const packet = fn(data);
    $socket = { channel: "send-packet", data: packet };
  };

  $: if ($socket.channel === "wss-closed") {
    $wssOpen = false;
  } else if ($socket.channel === "wss-open") {
    $wssOpen = true;
  }

  $: if ($wssOpen) {
    socket.set({ channel: "open-wss", data: null });
  } else {
    socket.set({ channel: "close-wss", data: null });
  }

  console.log($players, $matchSettings, $matchBoolSettings);

  onMount(async () => {
    log.info("onMount");

    //persist stores
    localForage.getItem("players", (err, value: SOS.PlayersStore) => {
      if (!value) return;
      players.set(value);
    });
    localForage.getItem("bools", (err, value: any) => {
      if (!value) return;
      matchBoolSettings.set(value);
    });
    localForage.getItem("settings", (err, value: any) => {
      if (!value) return;
      matchSettings.set(value);
    });
  });
</script>

<svelte:head>
  <title>SOS Emulator</title>
</svelte:head>
<div class="container">
  <div class="column">
    <h3>Match Settings</h3>

    <Settings />
  </div>
  <div class="column">
    <h3>Send Packet</h3>
    <div class="column-content">
      {#each keys(packetFactory) as type}
        <SendPacketButton {type} on:sendEvent={() => sendEvent(type)} />
      {/each}
    </div>
  </div>
</div>

<style>
  .column {
    width: 200px;
    height: 100%;
    padding: 0;
    background-color: #636564;
  }

  .container {
    display: flex;
    justify-content: space-between;
  }
</style>
