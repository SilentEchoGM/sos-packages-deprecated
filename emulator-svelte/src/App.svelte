<script lang="ts">
  import TextInput from "./components/inputs/TextInput.svelte";
  import Panel from "./components/Panel.svelte";
  import { Color } from "./components/color";
  import NumberInput from "./components/inputs/NumberInput.svelte";
  import BooleanInput from "./components/inputs/BooleanInput.svelte";
  import CollapsiblePanel from "./components/CollapsiblePanel.svelte";
  import { EmulatorMode, state } from "./state";
  import { v4 } from "uuid";
  import Player from "./components/PlayerCard.svelte";
  import { keys } from "fp-ts/lib/Record";
  import { onMount } from "svelte";
  import { getPlayerStore } from "./packetFactory/utils/getPlayerStore";
  import GameState from "./components/settings/GameState.svelte";
  import Manual from "./components/modes/Manual.svelte";
  import Playback from "./components/modes/Playback.svelte";
  import Recording from "./components/modes/Recording.svelte";
  $: console.log("state", $state, state);

  onMount(() => {
    if (keys($state.playersStore).length === 0) {
      const playerStore = getPlayerStore();
      for (let player in playerStore) {
        $state.playersStore[player] = playerStore[player];
      }
    }

    if (!$state.emulatorState.mode)
      $state.emulatorState.mode = EmulatorMode.manual;
  });
</script>

<CollapsiblePanel header="Emulator Controls" uiKey="emulatorModeOpen">
  <button
    class="mode"
    disabled={$state.emulatorState.mode === EmulatorMode.manual}
    on:click={() => ($state.emulatorState.mode = EmulatorMode.manual)}
    >Manual</button>
  <button
    class="mode"
    disabled={$state.emulatorState.mode === EmulatorMode.recording}
    on:click={() => ($state.emulatorState.mode = EmulatorMode.recording)}
    >Recording</button>
  <button
    class="mode"
    disabled={$state.emulatorState.mode === EmulatorMode.playback}
    on:click={() => ($state.emulatorState.mode = EmulatorMode.playback)}
    >Playback</button>

  {#if $state.emulatorState.mode === EmulatorMode.manual}
    <Manual />
  {/if}
  {#if $state.emulatorState.mode === EmulatorMode.playback}
    <Playback />
  {/if}
  {#if $state.emulatorState.mode === EmulatorMode.recording}
    <Recording />
  {/if}
</CollapsiblePanel>
{#if $state.emulatorState.mode === EmulatorMode.manual}
  <GameState />

  <CollapsiblePanel header="Players" uiKey="playersOpen">
    <div class="grid players">
      {#each keys($state.playersStore) as player}
        <Player {player} />
      {:else}
        ...
      {/each}
    </div>
  </CollapsiblePanel>
{/if}

<style>
  button.mode:disabled {
    background-color: var(--neutral);
    color: black;
  }
  .players {
    grid-template-columns: repeat(2, 26em);
    grid-auto-flow: dense;
  }
</style>
