<!-- src/routes/stats/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { PIRATE_CARDS } from '$lib/stores/game';

  let stats: any = null;
  let loading = true;

  onMount(async () => {
    try {
      const res = await fetch('/api/stats');
      stats = await res.json();
    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  });

  function cardName(id: string) {
    return PIRATE_CARDS.find(c => c.id === id)?.name ?? id;
  }

  function cardIcon(id: string) {
    return PIRATE_CARDS.find(c => c.id === id)?.icon ?? '—';
  }

  function formatDate(ts: number) {
    return new Date(ts * 1000).toLocaleDateString('nl-NL', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  }
</script>

<div class="pt-6 pb-12">
  <header class="text-center mb-6">
    <h1 class="font-pirata text-gold-light text-4xl" style="text-shadow: 0 0 40px rgba(201,146,42,0.4)">
      📊 Statistieken
    </h1>
    <p class="font-mono text-[0.6rem] uppercase tracking-[4px] text-foam/50 mt-2">Alle potjes bijgehouden</p>
    <div class="flex items-center gap-3 mt-4">
      <div class="flex-1 h-px bg-gradient-to-r from-transparent via-gold/35 to-transparent" />
      <span class="text-gold">☠</span>
      <div class="flex-1 h-px bg-gradient-to-r from-transparent via-gold/35 to-transparent" />
    </div>
  </header>

  {#if loading}
    <div class="text-center text-foam/50 font-mono text-sm py-16">⚓ Laden...</div>

  {:else if !stats || stats.totalGames === 0}
    <div class="pirate-card text-center py-10">
      <div class="text-4xl mb-3">☠️</div>
      <p class="font-pirata text-gold-light text-xl">Nog geen potjes gespeeld</p>
      <p class="text-foam/50 text-sm mt-2">Speel een potje om statistieken te zien!</p>
    </div>

  {:else}
    <!-- Totaal potjes -->
    <div class="pirate-card mb-4 text-center">
      <div class="font-pirata text-gold-light text-5xl">{stats.totalGames}</div>
      <div class="font-mono text-[0.62rem] uppercase tracking-widest text-foam/45 mt-1">Potjes gespeeld</div>
    </div>

    <!-- Top spelers -->
    <div class="pirate-card mb-4">
      <h3 class="font-pirata text-gold-light text-lg mb-4 tracking-wide">🏆 Top Spelers</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="font-mono text-[0.56rem] uppercase tracking-wide text-foam/40 border-b border-white/8">
              <th class="text-left py-2 pr-3">Speler</th>
              <th class="text-right py-2 pr-3">Potjes</th>
              <th class="text-right py-2 pr-3">Gem. score</th>
              <th class="text-right py-2 pr-3">Beste</th>
              <th class="text-right py-2">Wins</th>
            </tr>
          </thead>
          <tbody>
            {#each stats.topPlayers as p, i}
              <tr class="border-b border-white/4 last:border-0">
                <td class="py-2 pr-3">
                  <span class="font-mono text-foam/35 text-xs mr-1">#{i+1}</span>
                  {p.playerName}
                </td>
                <td class="py-2 pr-3 text-right text-foam/55 font-mono text-xs">{p.gamesPlayed}</td>
                <td class="py-2 pr-3 text-right font-pirata text-gold-light">{p.avgScore}</td>
                <td class="py-2 pr-3 text-right font-mono text-xs text-foam/55">{p.maxScore}</td>
                <td class="py-2 text-right font-mono text-xs text-emerald-400">{p.totalWins}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Kaartstatistieken -->
    <div class="pirate-card mb-4">
      <h3 class="font-pirata text-gold-light text-lg mb-4 tracking-wide">🃏 Kaartstatistieken</h3>
      <div class="flex flex-col gap-2">
        {#each stats.cardStats as c}
          <div class="flex items-center gap-3 py-2 border-b border-white/4 last:border-0">
            <span class="text-xl w-8 text-center">{cardIcon(c.cardId)}</span>
            <div class="flex-1">
              <div class="text-sm font-semibold">{cardName(c.cardId)}</div>
              <div class="font-mono text-[0.6rem] text-foam/45">{c.timesUsed}× gebruikt</div>
            </div>
            <div class="text-right">
              <div class="font-pirata text-gold-light">{c.avgScore} <span class="text-xs text-foam/40">gem.</span></div>
              <div class="font-mono text-[0.6rem] text-red-400/70">{c.bustRate}% bust</div>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Recente potjes -->
    <div class="pirate-card mb-4">
      <h3 class="font-pirata text-gold-light text-lg mb-4 tracking-wide">⏱️ Recente Potjes</h3>
      <div class="flex flex-col gap-2">
        {#each stats.recentGames as g}
          <div class="flex items-center gap-3 py-2 border-b border-white/4 last:border-0">
            <div class="flex-1">
              <div class="text-sm">🏆 {g.winnerName}</div>
              <div class="font-mono text-[0.6rem] text-foam/45">{formatDate(g.playedAt)} · {g.playerCount} spelers</div>
            </div>
            <div class="font-pirata text-gold-light text-xl">{g.winnerScore}</div>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <div class="text-center mt-4">
    <a href="/" class="btn-ghost px-4 py-2 text-sm">← Terug naar spel</a>
  </div>
</div>
