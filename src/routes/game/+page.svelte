<!-- src/routes/game/+page.svelte -->
<script lang="ts">
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { game, WIN_SCORE } from '$lib/stores/game';
  import Scoreboard from '$lib/components/Scoreboard.svelte';

  $: if (browser && $game.phase === 'setup') goto('/');
  $: if (browser && $game.phase === 'end') goto('/end');

  let showHistory = false;
</script>

<div class="pt-4 pb-20">
  <header class="text-center mb-6">
    <h1
      class="font-pirata text-gold-light text-5xl leading-tight"
      style="text-shadow: 0 0 40px rgba(201,146,42,0.5)"
    >
      Bommen & Granaten
    </h1>
  </header>

  {#if $game.finalRound}
    <div
      class="border border-blood-light/45 bg-blood/20 rounded-xl px-4 py-3 mb-3 text-center"
      style="animation: warnPulse 2s ease-in-out infinite"
    >
      <h3 class="font-pirata text-red-400 tracking-widest">☠️ EINDRONDE ☠️</h3>
      <p class="text-red-400/70 text-sm mt-1">
        {$game.players.find(p => p.id === $game.finalRoundBy)?.name} haalt {WIN_SCORE}+! Alle anderen krijgen nog één beurt.
      </p>
    </div>
  {/if}

  <div class="section-label">Ranglijst</div>
  <div class="mb-3"><Scoreboard /></div>

  <div class="text-center mb-2">
    <button
      class="btn-ghost px-4 py-2 text-sm"
      on:click={() => (showHistory = !showHistory)}
    >
      📜 {showHistory ? 'Verberg' : 'Toon'} scorehistorie
    </button>
  </div>

  {#if showHistory}
    <div class="pirate-card mb-3">
      <h4 class="font-pirata text-foam text-base mb-3 tracking-wide">📜 Scorehistorie</h4>
      <table class="w-full text-sm">
        <thead>
          <tr class="font-mono text-[0.56rem] uppercase tracking-wide text-foam/40">
            <th class="text-left pb-2 pr-2">R</th>
            <th class="text-left pb-2 pr-2">Speler</th>
            <th class="text-left pb-2 pr-2">Kaart</th>
            <th class="text-left pb-2 pr-2">Score</th>
            <th class="text-left pb-2">Totaal</th>
          </tr>
        </thead>
        <tbody>
          {#each [...$game.history].reverse().slice(0, 30) as entry}
            <tr class="border-t border-white/4">
              <td class="py-1.5 pr-2 text-foam/35 font-mono text-[0.65rem]">R{entry.round}</td>
              <td class="py-1.5 pr-2">{entry.playerName}</td>
              <td class="py-1.5 pr-2">{entry.cardIcon}</td>
              <td class="py-1.5 pr-2 font-mono text-[0.7rem] {entry.busted ? 'text-red-400' : 'text-gold-light'}">
                {entry.busted ? '💀 bust' : '+' + entry.score}
              </td>
              <td class="py-1.5 font-mono text-[0.7rem] text-foam/55">{entry.totalAfter}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}

  <div class="fixed bottom-0 left-0 right-0 bg-ocean/96 border-t border-gold/12 px-4 py-2 flex gap-2 backdrop-blur-md z-50">
    <button class="btn-ghost flex-1 py-2 text-[0.75rem]" on:click={() => game.undo()}>
      ↩ Ongedaan
    </button>
    <button
      class="btn-ghost flex-1 py-2 text-[0.75rem]"
      on:click={() => { if (confirm('Nieuw spel starten?')) { game.reset(); goto('/'); } }}
    >
      ↺ Nieuw spel
    </button>
  </div>
</div>

<style>
  @keyframes warnPulse {
    0%, 100% { border-color: rgba(192, 57, 43, 0.45); }
    50%       { border-color: rgba(192, 57, 43, 0.85); box-shadow: 0 0 18px rgba(192, 57, 43, 0.25); }
  }
</style>
