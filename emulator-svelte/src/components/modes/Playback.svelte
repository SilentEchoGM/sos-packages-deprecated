<script lang="ts">
  import { onDestroy, onMount, tick } from "svelte";
  import { socket } from "../../socket";
  import { state } from "../../state";
  import SelectInput from "../inputs/SelectInput.svelte";

  onMount(async () => {
    $socket = {
      channel: "get-playback-library",
      data: {},
    };

    await tick();

    $socket = {
      channel: "open-wss",
      data: {},
    };
    if (!$state.emulatorState.listOfGameIds?.length) {
      $state.emulatorState.listOfGameIds = [];
      $state.emulatorState.selectedGameId = "No games found!";
    }
  });

  $: if ($socket.channel === "playback-library") {
    $state.emulatorState.listOfGameIds = $socket.data;
  }
  $: if ($socket.channel === "playback-started") {
    $state.emulatorState.playing = true;
  }
  $: if ($socket.channel === "playback-stopped") {
    $state.emulatorState.playing = false;
  }
</script>

<div class="grid">
  <SelectInput
    bind:value={$state.emulatorState.selectedGameId}
    label="Selected Game"
    options={$state.emulatorState.listOfGameIds}
    code />
  {#if $state.emulatorState.playing}
    <button
      on:click={() => {
        $socket = {
          channel: "stop-playback",
          data: {},
        };
      }}>Stop Playing</button>
  {:else}
    <button
      on:click={() => {
        $socket = {
          channel: "start-playback",
          data: $state.emulatorState.selectedGameId,
        };
      }}>Start Playing</button>
  {/if}
</div>

<style>
  .grid {
    padding-top: 1em;
    grid-template-columns: 10em 25em 10em;
    align-items: baseline;
  }
  button {
    position: relative;
    top: 0.15em;
  }
</style>
