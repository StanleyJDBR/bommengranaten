<!-- src/lib/components/TurnPanel.svelte -->
<script lang="ts">
  import { game, currentPlayer, PIRATE_CARDS } from '$lib/stores/game';

  const QUICK = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1500, 2000];

  let scoreInput = 0;
  let deathIslandSkulls = 0;

  // Reset bij nieuwe beurt
  $: if ($currentPlayer) {
    scoreInput = 0;
    deathIslandSkulls = $game.extraSkulls;
  }

  function addQuick(v: number) {
    scoreInput += v;
  }

  function handleBust() {
    game.bust();
    scoreInput = 0;
  }

  function handleConfirm() {
    game.confirmScore(scoreInput);
    scoreInput = 0;
  }

  function handleDeathIslandEnd() {
    game.setExtraSkulls(deathIslandSkulls);
    game.endDeathIsland();
    scoreInput = 0;
    deathIslandSkulls = 0;
  }
</script>

{#if $currentPlayer}
  <div class="pirate-card mb-3">

    <!-- Header -->
    <div class="flex items-center gap-2 mb-4">
      <span class="text-2xl">{$currentPlayer.emoji}</span>
      <div class="flex-1">
        <h3 class="font-pirata text-gold-light text-lg tracking-wide">
          Beurt van {$currentPlayer.name}
        </h3>
        <p class="text-foam/60 text-sm">
          {$game.finalRound ? '⚠️ Laatste beurt!' : ''}
        </p>
      </div>
      <span class="font-mono text-[0.6rem] text-foam/40">Ronde {$game.round}</span>
    </div>

    <!-- Score input -->
    <div class="section-label mt-3">Punten deze beurt</div>
    <div class="relative mb-2.5">
      <input
        type="number"
        bind:value={scoreInput}
        step="50"
        placeholder="0"
        class="
          w-full bg-white/5 border border-gold/25 rounded-lg px-4 py-2.5
          text-gold-light font-pirata text-[1.7rem] text-center outline-none
          focus:border-gold transition-colors [appearance:textfield]
          [&::-webkit-outer-spin-button]:appearance-none
          [&::-webkit-inner-spin-button]:appearance-none
        "
      />
      <button
        class="absolute inset-y-0 right-3 text-[1.4rem] font-pirata text-gold/60 hover:text-gold transition-colors leading-none"
        on:click={() => scoreInput = -scoreInput}
      >
        +-
      </button>
    </div>

    <!-- Quick buttons -->
    <div class="grid grid-cols-4 gap-2 mb-4">
      {#each QUICK as v}
        <button
          class="btn-ghost py-5 text-[0.68rem] font-mono"
          on:click={() => addQuick(v)}
        >
          {v >= 1000 ? (v / 1000) + 'K' : v}
        </button>
      {/each}
    </div>

    <!-- Bust / Confirm -->
    <div class="grid grid-cols-2 gap-2">
      <button class="btn-bust py-3 text-[1.05rem]" on:click={handleBust}>
        Bust!
      </button>
      <button class="btn-confirm py-3 text-[1.05rem]" on:click={handleConfirm}>
        Bevestig
      </button>
    </div>
  </div>

  <!-- Death Island panel -->
  {#if $game.deathIsland}
    <div class="border border-blood-light/50 bg-blood/20 rounded-xl p-4 mb-3 text-center" style="animation: diPulse 3s ease-in-out infinite">
      <h3 class="font-pirata text-red-400 text-xl tracking-widest mb-1">☠️☠️☠️ DOODSHOOFDEILAND ☠️☠️☠️</h3>
      <p class="text-red-400/75 text-sm mb-3">Gooi door! Elke extra schedel = alle tegenstanders −100 pt</p>

      <div class="flex items-center justify-center gap-4 mb-3">
        <button
          class="w-10 h-10 rounded-lg bg-blood/30 border border-blood-light/40 text-red-300 text-xl flex items-center justify-center"
          on:click={() => deathIslandSkulls = Math.max(0, deathIslandSkulls - 1)}
        >−</button>
        <span class="font-pirata text-[2.2rem] text-red-400 min-w-[52px] text-center" style="text-shadow: 0 0 16px rgba(192,57,43,0.4)">
          {deathIslandSkulls}
        </span>
        <button
          class="w-10 h-10 rounded-lg bg-blood/30 border border-blood-light/40 text-red-300 text-xl flex items-center justify-center"
          on:click={() => deathIslandSkulls++}
        >+</button>
      </div>

      <p class="text-[0.72rem] text-red-400/50 mb-3">Extra schedels na de eerste 4</p>
      <button class="btn-bust w-full py-3" on:click={handleDeathIslandEnd}>
        ☠️ Eindig Doodshoofdeiland
      </button>
    </div>
  {/if}
{/if}

<style>
  @keyframes diPulse {
    0%, 100% { box-shadow: 0 0 16px rgba(192,57,43,0.28); }
    50%       { box-shadow: 0 0 40px rgba(192,57,43,0.5); }
  }
</style>
