<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { game, PLAYER_EMOJIS } from '$lib/stores/game';
  import Toggle from '$lib/components/Toggle.svelte';

  $: if (browser && $game.phase !== 'setup') {
    goto($game.phase === 'playing' ? '/game' : '/end');
  }

  let playerNames: string[] = ['', ''];
  let shuffle = true;

  function addPlayer() {
    if (playerNames.length < 8) playerNames = [...playerNames, ''];
  }

  function removePlayer(index: number) {
    if (playerNames.length <= 2) return;
    playerNames = playerNames.filter((_, i) => i !== index);
  }

  function startGame() {
    let names = playerNames.map((name, i) => name.trim() || `Speler ${i + 1}`);
    if (shuffle) {
      for (let i = names.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [names[i], names[j]] = [names[j], names[i]];
      }
    }
    game.startGame(names);
    goto('/game');
  }
</script>

<div class="pt-8 pb-12">
  <header class="text-center mb-6">
    <h1
      class="font-pirata text-gold-light text-5xl leading-tight"
      style="text-shadow: 0 0 40px rgba(201,146,42,0.5)"
    >
      Bommen & Granaten
    </h1>
    <p class="font-mono text-[0.6rem] uppercase tracking-[4px] text-foam/50 mt-2">
      Scorebord
    </p>
    <div class="flex items-center gap-3 mt-4">
      <div class="flex-1 h-px bg-gradient-to-r from-transparent via-gold/35 to-transparent"></div>
      <span class="text-gold">☠</span>
      <div class="flex-1 h-px bg-gradient-to-r from-transparent via-gold/35 to-transparent"></div>
    </div>
  </header>

  <div class="pirate-card mb-4">
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-pirata text-gold-light text-lg tracking-wide">Spelers</h3>
      <Toggle bind:value={shuffle} label="Husselen" />
    </div>

    <div class="flex flex-col gap-2">
      {#each playerNames as name, i}
        <div class="flex items-center gap-2">
          <span class="text-xl w-8 text-center">{PLAYER_EMOJIS[i]}</span>
          <input
            type="text"
            bind:value={playerNames[i]}
            placeholder="Speler {i + 1}"
            maxlength="20"
            class="
              flex-1 bg-white/5 border border-gold/25 rounded-lg px-3 py-2
              text-skull font-crimson text-base outline-none
              focus:border-gold transition-colors placeholder:text-skull/25
            "
          />
          {#if i >= 2}
            <button
              class="w-8 h-8 rounded-md bg-blood/25 border border-blood/40 text-red-400 text-sm flex items-center justify-center hover:bg-blood/50 transition-colors"
              on:click={() => removePlayer(i)}
            >✕</button>
          {:else}
            <div class="w-8"></div>
          {/if}
        </div>
      {/each}
    </div>

    {#if playerNames.length < 8}
      <div class="flex items-center gap-2 mt-3 pt-3 border-t border-gold/15">
        <div class="w-8 flex-shrink-0"></div>
        <button
          class="btn-ghost flex-1 py-2.5 font-pirata tracking-wide"
          on:click={addPlayer}
        >+ Speler toevoegen</button>
        <div class="w-8 flex-shrink-0"></div>
      </div>
    {/if}
  </div>

  <button class="btn-gold w-full py-4 text-xl" on:click={startGame}>
    Begin het spel!
  </button>
</div>
