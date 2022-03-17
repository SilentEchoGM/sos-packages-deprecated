<script lang="ts">
  import type { SOS } from "sos-plugin-types";
  import { state } from "../state";
  import { Color } from "./color";
  import BooleanInput from "./inputs/BooleanInput.svelte";
  import NumberInput from "./inputs/NumberInput.svelte";
  import TextInput from "./inputs/TextInput.svelte";

  export let player: SOS.Player["id"];

  let color = $state.playersStore[player].team ? Color.orange : Color.blue;
</script>

<div class="container">
  <TextInput
    label="name"
    code
    {color}
    bind:value={$state.playersStore[player].name} />
  <TextInput
    label="attacker"
    code
    {color}
    bind:value={$state.playersStore[player].attacker} />
  <TextInput
    label="id"
    code
    {color}
    bind:value={$state.playersStore[player].id} />
  <TextInput
    label="primaryID"
    code
    {color}
    bind:value={$state.playersStore[player].primaryID} />

  <NumberInput
    label={"assists"}
    code
    {color}
    bind:value={$state.playersStore[player].assists} />
  <NumberInput
    label={"boost"}
    code
    {color}
    bind:value={$state.playersStore[player].boost} />
  <NumberInput
    label={"cartouches"}
    code
    {color}
    bind:value={$state.playersStore[player].cartouches} />
  <NumberInput
    label={"demos"}
    code
    {color}
    bind:value={$state.playersStore[player].demos} />
  <NumberInput
    label={"goals"}
    code
    {color}
    bind:value={$state.playersStore[player].goals} />
  <NumberInput
    label={"saves"}
    code
    {color}
    bind:value={$state.playersStore[player].saves} />
  <NumberInput
    label={"score"}
    code
    {color}
    bind:value={$state.playersStore[player].score} />
  <NumberInput
    label={"shots"}
    code
    {color}
    bind:value={$state.playersStore[player].shots} />
  <NumberInput
    label={"speed"}
    code
    {color}
    bind:value={$state.playersStore[player].speed} />
  <NumberInput
    label={"team"}
    code
    {color}
    bind:value={$state.playersStore[player].team} />
  <NumberInput
    label={"touches"}
    code
    {color}
    bind:value={$state.playersStore[player].touches} />
  <NumberInput
    label={"shortcut"}
    code
    {color}
    bind:value={$state.playersStore[player].shortcut} />
  <BooleanInput
    bind:checked={$state.playersStore[player].isDead}
    label={"isDead"}
    {color}
    code />
  <BooleanInput
    bind:checked={$state.playersStore[player].isPowersliding}
    label={"isPowersliding"}
    {color}
    code />
  <BooleanInput
    bind:checked={$state.playersStore[player].isSonic}
    label={"isSonic"}
    {color}
    code />
  <BooleanInput
    bind:checked={$state.playersStore[player].onGround}
    label={"onGround"}
    {color}
    code />
  <BooleanInput
    bind:checked={$state.playersStore[player].onWall}
    label={"onWall"}
    {color}
    code />
  <BooleanInput
    bind:checked={$state.playersStore[player].hasCar}
    label={"hasCar"}
    {color}
    code />
</div>
