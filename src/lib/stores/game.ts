// src/lib/stores/game.ts
import { writable, derived } from 'svelte/store';

// ── TYPES ──────────────────────────────────────────────
export interface Player {
  id:      number;
  name:    string;
  emoji:   string;
  score:   number;
  history: TurnEntry[];
}

export interface TurnEntry {
  round:      number;
  playerId:   number;
  playerName: string;
  cardId:     string | null;
  cardIcon:   string;
  score:      number;
  busted:     boolean;
  totalAfter: number;
}

export interface GameState {
  players:       Player[];
  currentIdx:    number;
  round:         number;
  selectedCard:  string | null;
  finalRound:    boolean;
  finalRoundBy:  number | null;
  history:       TurnEntry[];
  phase:         'setup' | 'playing' | 'end';
}

// ── CONSTANTS ──────────────────────────────────────────
export const PLAYER_EMOJIS = ['🏴‍☠️','⚓','🗡️','💀','🦜','🐒','💎','🪙'];

export const PIRATE_CARDS = [
  { id:'captain',   icon:'👑',    name:'Kapitein',    desc:'Alle punten ×2 deze beurt',                              effect:'x2'    },
  { id:'diamond',   icon:'💎',    name:'Diamant',     desc:'+1 diamant (100 pt), telt mee voor volle buit',          effect:'+100'  },
  { id:'gold',      icon:'🪙',    name:'Goud',        desc:'+1 goudstuk (100 pt), telt mee voor combinaties',        effect:'+100'  },
  { id:'skull1',    icon:'☠️',    name:'1 Schedel',   desc:'Start met 1 schedel — bust al bij 2 extra!',             effect:'skull' },
  { id:'skull2',    icon:'☠️☠️', name:'2 Schedels',  desc:'Start met 2 schedels — nog maar 1 extra nodig!',         effect:'skull' },
  { id:'monkey',    icon:'🐒🦜',  name:'Apenbusiness',desc:'Apen + papegaaien vormen samen één set',                 effect:'mono'  },
  { id:'sword2',    icon:'⚔️²',   name:'2 Zwaarden',  desc:'Min 2 zwaarden vereist, anders 0 pt. Bonus bij succes!', effect:'sword' },
  { id:'sword3',    icon:'⚔️³',   name:'3 Zwaarden',  desc:'Min 3 zwaarden vereist, anders 0 pt. +500 bonus!',       effect:'sword' },
  { id:'sword4',    icon:'⚔️⁴',   name:'4 Zwaarden',  desc:'Min 4 zwaarden vereist, anders 0 pt. +1000 bonus!',      effect:'sword' },
  { id:'chest',     icon:'🏴',    name:'Schatkist',   desc:'Bewaar dobbelstenen in de kist — veilig voor schedels!', effect:'chest' },
] as const;

export type CardId = typeof PIRATE_CARDS[number]['id'];

export const WIN_SCORE = 6000;

export const QUICK_SCORES = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1500, 2000] as const;

// ── INITIAL STATE ──────────────────────────────────────
function createInitialState(): GameState {
  return {
    players:      [],
    currentIdx:   0,
    round:        1,
    selectedCard: null,
    finalRound:   false,
    finalRoundBy: null,
    history:      [],
    phase:        'setup',
  };
}

// ── STORE ──────────────────────────────────────────────
function createGameStore() {
  const { subscribe, set, update } = writable<GameState>(createInitialState());

  return {
    subscribe,

    startGame(names: string[]) {
      set({
        ...createInitialState(),
        phase: 'playing',
        players: names.map((name, i) => ({
          id: i, name, emoji: PLAYER_EMOJIS[i],
          score: 0, history: [],
        })),
      });
    },

    selectCard(cardId: string) {
      update(state => ({ ...state, selectedCard: cardId }));
    },

    confirmScore(rawScore: number) {
      update(state => {
        const player = state.players[state.currentIdx];
        const score  = state.selectedCard === 'captain' ? rawScore * 2 : rawScore;
        return applyTurn(state, player, score, false);
      });
    },

    bust() {
      update(state => {
        const player = state.players[state.currentIdx];
        return applyTurn(state, player, 0, true);
      });
    },

    undo() {
      update(state => {
        if (!state.history.length) return state;

        const last    = state.history[state.history.length - 1];
        const players = state.players.map(player =>
          player.id === last.playerId
            ? { ...player, score: player.score - last.score, history: player.history.slice(0, -1) }
            : player
        );

        // Reverse the final round if the player who triggered it dropped below WIN_SCORE
        let { finalRound, finalRoundBy } = state;
        const undonePlayer = players.find(player => player.id === last.playerId)!;
        if (finalRound && finalRoundBy === undonePlayer.id && undonePlayer.score < WIN_SCORE) {
          finalRound = false; finalRoundBy = null;
        }

        const prevIdx = (state.currentIdx - 1 + players.length) % players.length;
        const round   = prevIdx === players.length - 1 && state.round > 1 ? state.round - 1 : state.round;

        return {
          ...state,
          players,
          currentIdx: prevIdx,
          round,
          finalRound,
          finalRoundBy,
          history:     state.history.slice(0, -1),
          selectedCard: null,
        };
      });
    },

    reset() {
      set(createInitialState());
    },
  };
}

// ── HELPER ─────────────────────────────────────────────
function applyTurn(state: GameState, player: Player, score: number, busted: boolean): GameState {
  const card     = PIRATE_CARDS.find(pirate => pirate.id === state.selectedCard);
  const newScore = player.score + score;

  const entry: TurnEntry = {
    round:      state.round,
    playerId:   player.id,
    playerName: player.name,
    cardId:     state.selectedCard,
    cardIcon:   card?.icon ?? '—',
    score,
    busted,
    totalAfter: newScore,
  };

  const players = state.players.map(existing =>
    existing.id === player.id
      ? { ...existing, score: newScore, history: [...existing.history, entry] }
      : existing
  );

  let { finalRound, finalRoundBy } = state;
  if (!finalRound && newScore >= WIN_SCORE) {
    finalRound   = true;
    finalRoundBy = player.id;
  }

  // Check if the final round is complete
  const gameEnderIdx = players.findIndex(existing => existing.id === finalRoundBy);
  const nextIdx      = (state.currentIdx + 1) % players.length;
  const gameOver     = finalRound && nextIdx === gameEnderIdx;

  return {
    ...state,
    players,
    history:      [...state.history, entry],
    finalRound,
    finalRoundBy,
    selectedCard: null,
    currentIdx:   nextIdx,
    round:        nextIdx === 0 ? state.round + 1 : state.round,
    phase:        gameOver ? 'end' : 'playing',
  };
}

export const game = createGameStore();

// ── DERIVED ────────────────────────────────────────────
export const sortedPlayers = derived(game, $gameState =>
  [...$gameState.players].sort((a, b) => b.score - a.score)
);

export const currentPlayer = derived(game, $gameState =>
  $gameState.players[$gameState.currentIdx] ?? null
);
