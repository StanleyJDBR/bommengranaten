<!-- src/routes/+page.svelte -->
<script lang="ts">
    import {
        game,
        sortedPlayers,
        currentPlayer,
        PLAYER_EMOJIS,
    } from "$lib/stores/game";
    import Scoreboard from "$lib/components/Scoreboard.svelte";
    import TurnPanel from "$lib/components/TurnPanel.svelte";
    import { goto } from "$app/navigation";

    // Setup state
    let playerNames: string[] = ["", ""];

    function addPlayer() {
        if (playerNames.length < 8) playerNames = [...playerNames, ""];
    }

    function removePlayer(i: number) {
        if (playerNames.length <= 2) return;
        playerNames = playerNames.filter((_, idx) => idx !== i);
    }

    function startGame() {
        const names = playerNames.map((n, i) => n.trim() || `Speler ${i + 1}`);
        game.startGame(names);
    }

    // History toggle
    let showHistory = false;

    // Save finished game to DB
    async function saveGame() {
        await fetch("/api/games", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                players: $game.players.map((p) => ({
                    name: p.name,
                    score: p.score,
                })),
                turns: $game.history,
                round: $game.round,
            }),
        });
    }

    // Trigger save when game ends
    $: if ($game.phase === "end") saveGame();
</script>

<!-- ══ SETUP ══════════════════════════════ -->
{#if $game.phase === "setup"}
    <div class="pt-8 pb-12">
        <header class="text-center mb-6">
            <h1
                class="font-pirata text-gold-light text-5xl leading-tight"
                style="text-shadow: 0 0 40px rgba(201,146,42,0.5)"
            >
                Bommen & Granaten
            </h1>
            <p
                class="font-mono text-[0.6rem] uppercase tracking-[4px] text-foam/50 mt-2"
            >
                Scorebord
            </p>
            <div class="flex items-center gap-3 mt-4">
                <div
                    class="flex-1 h-px bg-gradient-to-r from-transparent via-gold/35 to-transparent"
                />
                <span class="text-gold">☠</span>
                <div
                    class="flex-1 h-px bg-gradient-to-r from-transparent via-gold/35 to-transparent"
                />
            </div>
        </header>

        <div class="pirate-card mb-3">
            <h3 class="font-pirata text-gold-light text-lg mb-4 tracking-wide">
                Spelers
            </h3>
            <div class="flex flex-col gap-2">
                {#each playerNames as name, i}
                    <div class="flex items-center gap-2">
                        <span class="text-xl w-8 text-center"
                            >{PLAYER_EMOJIS[i]}</span
                        >
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
                                on:click={() => removePlayer(i)}>✕</button
                            >
                        {:else}
                            <div class="w-8" />
                        {/if}
                    </div>
                {/each}
            </div>
        </div>

        {#if playerNames.length < 8}
            <div class="pirate-card mb-3 py-3">
                <button
                    class="btn-ghost w-full py-2.5 font-pirata tracking-wide"
                    on:click={addPlayer}>+ Speler toevoegen</button
                >
            </div>
        {/if}

        <button class="btn-gold w-full py-4 text-xl" on:click={startGame}
            >Begin het spel!</button
        >

        <div class="text-center mt-4">
            <a
                href="/stats"
                class="text-foam/50 text-sm hover:text-foam transition-colors"
                >Statistieken bekijken</a
            >
        </div>
    </div>

    <!-- ══ PLAYING ════════════════════════════ -->
{:else if $game.phase === "playing"}
    <div class="pt-4 pb-20">
        <header class="text-center mb-3">
            <h1
                class="font-pirata text-gold-light text-2xl"
                style="text-shadow: 0 0 30px rgba(201,146,42,0.4)"
            >
                Bommen & Granaten
            </h1>
        </header>

        <!-- Eindronde banner -->
        {#if $game.finalRound}
            <div
                class="border border-blood-light/45 bg-blood/20 rounded-xl px-4 py-3 mb-3 text-center"
                style="animation: warnPulse 2s ease-in-out infinite"
            >
                <h3 class="font-pirata text-red-400 tracking-widest">
                    ☠️ EINDRONDE ☠️
                </h3>
                <p class="text-red-400/70 text-sm mt-1">
                    {$game.players.find((p) => p.id === $game.finalRoundBy)
                        ?.name} haalt 6000+! Alle anderen krijgen nog één beurt.
                </p>
            </div>
        {/if}

        <div class="section-label">Ranglijst</div>
        <div class="mb-3"><Scoreboard /></div>

        <TurnPanel />

        <!-- Scorehistorie -->
        <div class="text-center mb-2">
            <button
                class="btn-ghost px-4 py-2 text-sm"
                on:click={() => (showHistory = !showHistory)}
            >
                📜 {showHistory ? "Verberg" : "Toon"} scorehistorie
            </button>
        </div>

        {#if showHistory}
            <div class="pirate-card mb-3">
                <h4 class="font-pirata text-foam text-base mb-3 tracking-wide">
                    📜 Scorehistorie
                </h4>
                <table class="w-full text-sm">
                    <thead>
                        <tr
                            class="font-mono text-[0.56rem] uppercase tracking-wide text-foam/40"
                        >
                            <th class="text-left pb-2 pr-2">R</th>
                            <th class="text-left pb-2 pr-2">Speler</th>
                            <th class="text-left pb-2 pr-2">Kaart</th>
                            <th class="text-left pb-2 pr-2">Score</th>
                            <th class="text-left pb-2">Totaal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each [...$game.history]
                            .reverse()
                            .slice(0, 30) as entry}
                            <tr class="border-t border-white/4">
                                <td
                                    class="py-1.5 pr-2 text-foam/35 font-mono text-[0.65rem]"
                                    >R{entry.round}</td
                                >
                                <td class="py-1.5 pr-2">{entry.playerName}</td>
                                <td class="py-1.5 pr-2">{entry.cardIcon}</td>
                                <td
                                    class="py-1.5 pr-2 font-mono text-[0.7rem] {entry.busted
                                        ? 'text-red-400'
                                        : 'text-gold-light'}"
                                >
                                    {entry.busted
                                        ? "💀 bust"
                                        : "+" + entry.score}
                                </td>
                                <td
                                    class="py-1.5 font-mono text-[0.7rem] text-foam/55"
                                    >{entry.totalAfter}</td
                                >
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        {/if}

        <!-- Bottom nav -->
        <div
            class="fixed bottom-0 left-0 right-0 bg-ocean/96 border-t border-gold/12 px-4 py-2 flex gap-2 backdrop-blur-md z-50"
        >
            <button
                class="btn-ghost flex-1 py-2 text-[0.75rem]"
                on:click={() => game.undo()}>↩ Ongedaan</button
            >
            <button
                class="btn-ghost flex-1 py-2 text-[0.75rem]"
                on:click={() => {
                    if (confirm("Nieuw spel starten?")) game.reset();
                }}>🔄 Nieuw spel</button
            >
            <a
                href="/stats"
                class="btn-ghost flex-1 py-2 text-[0.75rem] text-center"
                >📊 Stats</a
            >
        </div>
    </div>

    <!-- ══ END ════════════════════════════════ -->
{:else if $game.phase === "end"}
    <div class="pt-8 pb-12 text-center">
        <header class="mb-6">
            <h1
                class="font-pirata text-gold-light text-4xl"
                style="text-shadow: 0 0 40px rgba(201,146,42,0.5)"
            >
                🏆 Einde Spel
            </h1>
            <p
                class="font-mono text-[0.6rem] uppercase tracking-[4px] text-foam/50 mt-2"
            >
                De winnaars zijn bekend
            </p>
            <div class="flex items-center gap-3 mt-4">
                <div
                    class="flex-1 h-px bg-gradient-to-r from-transparent via-gold/35 to-transparent"
                />
                <span class="text-gold">☠</span>
                <div
                    class="flex-1 h-px bg-gradient-to-r from-transparent via-gold/35 to-transparent"
                />
            </div>
        </header>

        <!-- Podium -->
        <div class="flex items-end justify-center gap-2 my-8">
            {#each [1, 0, 2] as podiumIdx, i}
                {#if $sortedPlayers[podiumIdx]}
                    {@const p = $sortedPlayers[podiumIdx]}
                    {@const medals = ["🥈", "🥇", "🥉"]}
                    {@const ranks = [2, 1, 3]}
                    <div
                        class="
            flex-1 max-w-[120px] border rounded-t-xl px-2 py-3 text-center
            {podiumIdx === 0
                            ? 'bg-gold/20 border-gold shadow-[0_0_28px_rgba(201,146,42,0.28)] -translate-y-5'
                            : 'bg-white/5 border-gold/20'}
          "
                    >
                        <div class="text-3xl mb-2">{p.emoji}</div>
                        <div class="text-sm font-semibold truncate">
                            {p.name}
                        </div>
                        <div class="font-pirata text-gold-light text-2xl mt-1">
                            {p.score}
                        </div>
                        <div class="font-mono text-[0.62rem] text-foam/40 mt-1">
                            {medals[i]} Plek {ranks[i]}
                        </div>
                    </div>
                {/if}
            {/each}
        </div>

        <!-- Eindstand -->
        <div class="pirate-card text-left mb-6">
            {#each $sortedPlayers as p, i}
                <div
                    class="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0"
                >
                    <span class="font-mono text-[0.75rem] text-foam/40 w-5"
                        >#{i + 1}</span
                    >
                    <span class="text-lg">{p.emoji}</span>
                    <span class="flex-1 font-semibold">{p.name}</span>
                    <span class="font-pirata text-gold-light text-2xl"
                        >{p.score}</span
                    >
                </div>
            {/each}
        </div>

        <button
            class="btn-gold w-full py-4 text-xl mb-3"
            on:click={() => game.reset()}
        >
            ⚓ Nieuw Spel
        </button>
        <a
            href="/stats"
            class="block text-foam/50 text-sm hover:text-foam transition-colors"
        >
            Bekijk alle statistieken
        </a>
    </div>
{/if}

<style>
    @keyframes warnPulse {
        0%,
        100% {
            border-color: rgba(192, 57, 43, 0.45);
        }
        50% {
            border-color: rgba(192, 57, 43, 0.85);
            box-shadow: 0 0 18px rgba(192, 57, 43, 0.25);
        }
    }
</style>
