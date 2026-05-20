<!-- src/routes/end/+page.svelte -->
<script lang="ts">
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { game, sortedPlayers } from '$lib/stores/game';

  $: if (browser && $game.phase !== 'end') goto('/');

  function resetGame() {
    game.reset();
    goto('/');
  }
</script>

<div class="pt-8 pb-12 text-center">
  <header class="mb-6">
    <h1
      class="font-pirata text-gold-light text-4xl"
      style="text-shadow: 0 0 40px rgba(201,146,42,0.5)"
    >
      🏆 Einde Spel
    </h1>
    <p class="font-mono text-[0.6rem] uppercase tracking-[4px] text-foam/50 mt-2">
      De winnaar is bekend
    </p>
    <div class="flex items-center gap-3 mt-4">
      <div class="flex-1 h-px bg-gradient-to-r from-transparent via-gold/35 to-transparent"></div>
      <span class="text-gold">☠</span>
      <div class="flex-1 h-px bg-gradient-to-r from-transparent via-gold/35 to-transparent"></div>
    </div>
  </header>

  <!-- Order [1,0,2] puts silver on the left, gold elevated in the center, bronze on the right -->
  <div class="flex items-end justify-center gap-2 my-8">
    {#each [1, 0, 2] as podiumIdx, i}
      {#if $sortedPlayers[podiumIdx]}
        {@const player = $sortedPlayers[podiumIdx]}
        {@const medals = ['🥈', '🥇', '🥉']}
        {@const ranks  = [2, 1, 3]}
        <div
          class="
            flex-1 max-w-[120px] border rounded-t-xl px-2 py-3 text-center
            {podiumIdx === 0
              ? 'bg-gold/20 border-gold shadow-[0_0_28px_rgba(201,146,42,0.28)] -translate-y-5'
              : 'bg-white/5 border-gold/20'}
          "
        >
          <div class="text-3xl mb-2">{player.emoji}</div>
          <div class="text-sm font-semibold truncate">{player.name}</div>
          <div class="font-pirata text-gold-light text-2xl mt-1">{player.score}</div>
          <div class="font-mono text-[0.62rem] text-foam/40 mt-1">{medals[i]} Plek {ranks[i]}</div>
        </div>
      {/if}
    {/each}
  </div>

  <div class="pirate-card text-left mb-6">
    {#each $sortedPlayers as player, i}
      <div class="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
        <span class="font-mono text-[0.75rem] text-foam/40 w-5">#{i + 1}</span>
        <span class="text-lg">{player.emoji}</span>
        <span class="flex-1 font-semibold">{player.name}</span>
        <span class="font-pirata text-gold-light text-2xl">{player.score}</span>
      </div>
    {/each}
  </div>

  <button class="btn-gold w-full py-4 text-xl mb-3" on:click={resetGame}>
    ⚓ Nieuw Spel
  </button>
</div>
