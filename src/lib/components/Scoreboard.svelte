<!-- src/lib/components/Scoreboard.svelte -->
<script lang="ts">
  import { game, sortedPlayers, currentPlayer, type Player } from '$lib/stores/game';

  const WIN_SCORE = 6000;
</script>

<div class="flex flex-col gap-2">
  {#each $sortedPlayers as player, rank}
    {@const isCurrent = player.id === $currentPlayer?.id}
    {@const pct = Math.min(100, (player.score / WIN_SCORE) * 100)}
    {@const last = player.history.at(-1)}

    <div
      class="
        relative overflow-hidden rounded-xl px-4 py-3 flex items-center gap-3
        bg-gradient-to-br from-hull/85 to-ocean/90 border transition-all duration-300
        {isCurrent ? 'border-gold shadow-[0_0_20px_rgba(201,146,42,0.3)]' : 'border-gold/20'}
      "
    >
      <!-- Current player indicator -->
      {#if isCurrent}
        <div class="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-gold-light to-gold rounded-l-xl" />
      {/if}

      <!-- Avatar -->
      <div class="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-lg text-xl flex-shrink-0">
        {player.emoji}
      </div>

      <!-- Info -->
      <div class="flex-1 min-w-0">
        <div class="font-semibold font-crimson truncate {isCurrent ? 'text-gold-light' : 'text-skull'}">
          {player.name}
        </div>

        <!-- Badges -->
        <div class="flex gap-1 mt-1 flex-wrap">
          {#if rank === 0}
            <span class="text-[0.55rem] font-mono uppercase tracking-wide px-1.5 py-0.5 rounded bg-gold/20 text-gold-light">🏆 #1</span>
          {/if}
          {#if player.score >= WIN_SCORE}
            <span class="text-[0.55rem] font-mono uppercase tracking-wide px-1.5 py-0.5 rounded bg-gold/20 text-gold-light">⚡ 6000+</span>
          {/if}
          {#if $game.finalRound && player.id !== $game.finalRoundBy}
            <span class="text-[0.55rem] font-mono uppercase tracking-wide px-1.5 py-0.5 rounded bg-blood/30 text-red-400">⚠️ Laatste beurt</span>
          {/if}
        </div>

        <!-- Progress bar -->
        <div class="mt-1.5 h-[2px] bg-white/8 rounded-full overflow-hidden">
          <div
            class="h-full bg-gradient-to-r from-gold to-gold-light rounded-full transition-all duration-700"
            style="width: {pct}%"
          />
        </div>
      </div>

      <!-- Score -->
      <div class="text-right flex-shrink-0">
        <div class="font-pirata text-[1.9rem] text-gold-light leading-none" style="text-shadow: 0 0 16px rgba(201,146,42,0.35)">
          {player.score}
        </div>
        {#if last}
          <div class="font-mono text-[0.6rem] mt-0.5 {last.busted ? 'text-red-400' : last.score > 0 ? 'text-emerald-400' : 'text-foam/50'}">
            {last.busted ? '💀 bust' : last.score > 0 ? `+${last.score}` : '0'}
          </div>
        {/if}
      </div>
    </div>
  {/each}
</div>
