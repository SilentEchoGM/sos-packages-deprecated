<script lang="ts">
  import type { SOS } from "sos-plugin-types";
  import { tweened } from "svelte/motion";
  import { state } from "../state";
  import { Color } from "./color";
  export let player: SOS.Player["id"];

  let color = $state.playersStore[player].team ? Color.orange : Color.blue;

  let rowNumber = 1;

  const boostStore = tweened($state.playersStore[player].boost, {
    duration: 0,
  });

  $: $state.playersStore[player].boost = Math.floor($boostStore);
  $: rowNumber =
    color === Color.blue
      ? $state.playersStore[player].shortcut + 1
      : $state.playersStore[player].shortcut % 3;
</script>

<div
  class="container column"
  style:grid-column-start={color === Color.orange ? 2 : 1}
  style:grid-row-start={rowNumber}
  style:border-color={color === Color.orange ? "var(--orange)" : "var(--blue)"}>
  <span
    >Name: <strong>{$state.playersStore[player].name}</strong><span class="fade"
      >_{$state.playersStore[player].shortcut}</span
    ></span>
  <span>Boost: <strong>{$state.playersStore[player].boost}</strong></span>
  <div class="break" />
  <div class="container">
    <button
      on:click={() => {
        boostStore.set(0, { duration: $boostStore * 20 });
      }}>Use Boost</button>
    <button
      on:click={() => {
        boostStore.set(Math.min(100, $boostStore + 12), {});
      }}>Give Pad</button>
    <button
      on:click={() => {
        boostStore.set(100);
      }}>Give Can</button>
  </div>
  <button
    on:click={() => {
      $state.gameState.target = player;
    }}>Set as Target</button>
</div>

<style>
  span {
    font-weight: normal;
  }
  strong {
    font-weight: bolder;
  }
  .break {
    flex-basis: 100%;
    height: 0;
  }
  .container {
    border-radius: 0.4em;
  }
  .column {
    flex-direction: column;
    border: solid 0.3em;
    padding: 0.5em;
  }
  button {
    font-size: medium;
  }
  .fade {
    opacity: 50%;
  }
</style>
