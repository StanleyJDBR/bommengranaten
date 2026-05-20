<script lang="ts">
    export let value: boolean = false;
    export let label: string = '';
</script>

<div class="flex items-center gap-2">
    {#if label}
        <span class="font-mono text-[0.6rem] uppercase tracking-wide text-foam/50">{label}</span>
    {/if}
    <div class="flex rounded-md overflow-hidden border border-white/15">
        <button
            class="px-2.5 py-1 text-[0.65rem] font-mono uppercase tracking-wide transition-colors
                {value ? 'bg-gold/25 text-gold-light border-r border-gold/30' : 'bg-white/5 text-foam/30 border-r border-white/10'}"
            on:click={() => value = true}
        >
            Aan
        </button>
        <button
            class="px-2.5 py-1 text-[0.65rem] font-mono uppercase tracking-wide transition-colors
                {!value ? 'bg-white/10 text-foam/60' : 'bg-white/5 text-foam/25'}"
            on:click={() => value = false}
        >
            Uit
        </button>
    </div>
</div>
