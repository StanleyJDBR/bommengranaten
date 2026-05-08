<!-- src/lib/components/CardSelector.svelte -->
<script lang="ts">
  import { PIRATE_CARDS } from '$lib/stores/game';

  export let selected: string | null = null;
  export let onSelect: (id: string) => void = () => {};

  $: selectedCard = PIRATE_CARDS.find(c => c.id === selected);
</script>

<!-- Grid -->
<div class="grid grid-cols-5 gap-1.5 mb-3">
  {#each PIRATE_CARDS as card}
    <button
      class="
        rounded-lg py-2 px-1 text-center cursor-pointer transition-all duration-150 border
        {selected === card.id
          ? 'border-gold-light bg-gold/14 shadow-[0_0_10px_rgba(201,146,42,0.18)]'
          : 'border-white/10 bg-white/4 hover:border-gold/60 hover:bg-gold/8'
        }
      "
      on:click={() => onSelect(card.id)}
    >
      <div class="text-xl mb-1">{card.icon}</div>
      <div class="font-mono text-[0.5rem] uppercase leading-tight {selected === card.id ? 'text-gold-light' : 'text-foam'}">
        {card.name}
      </div>
    </button>
  {/each}
</div>

<!-- Description -->
<div class="bg-white/4 border border-white/8 rounded-lg px-3 py-2 text-sm text-foam leading-relaxed min-h-[36px] transition-all duration-200">
  {#if selectedCard}
    <span class="mr-1">{selectedCard.icon}</span>
    <strong class="text-gold-light">{selectedCard.name}</strong>
    — {selectedCard.desc}
    {#if selectedCard.effect === 'x2'}
      <span class="ml-1 inline-block bg-gold/20 border border-gold/40 rounded px-1.5 font-mono text-[0.62rem] text-gold-light">×2</span>
    {/if}
  {:else}
    <span class="text-foam/40">Selecteer een piratenkaart ↑</span>
  {/if}
</div>
