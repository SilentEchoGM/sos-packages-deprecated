<script lang="ts">
  import { onMount } from "svelte";

  import { socket } from "../../socket";
  import { state } from "../../state";

  $: if ($socket.channel === "recording-started")
    $state.emulatorState.recording = true;
  $: if ($socket.channel === "recording-stopped")
    $state.emulatorState.recording = false;

  onMount(() => {
    $socket = {
      channel: "close-wss",
      data: {},
    };
  });
</script>

<div class="grid">
  {#if $state.emulatorState.recording}
    <button
      on:click={() => {
        $socket = {
          channel: "stop-recording",
          data: {},
        };
      }}>Stop Recording</button>
  {:else}
    <button
      on:click={() => {
        $socket = {
          channel: "start-recording",
          data: {},
        };
      }}>Start Recording</button>
  {/if}
</div>

<style>
  .grid {
    padding-top: 1em;
    grid-template-columns: 15em;
  }
</style>
