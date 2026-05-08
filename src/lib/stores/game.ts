// src/lib/stores/game.ts
import { writable, derived, get } from 'svelte/store';

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
  deathIsland:   boolean;
  extraSkulls:   number;
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

const WIN_SCORE = 6000;

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
    deathIsland:  false,
    extraSkulls:  0,
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
      update(s => ({ ...s, selectedCard: cardId }));
    },

    confirmScore(rawScore: number) {
      update(s => {
        const player = s.players[s.currentIdx];
        const card = PIRATE_CARDS.find(c => c.id === s.selectedCard);

        let score = rawScore;
        if (s.selectedCard === 'captain') score = rawScore * 2;

        return applyTurn(s, player, score, false);
      });
    },

    bust() {
      update(s => {
        const player = s.players[s.currentIdx];
        return applyTurn(s, player, 0, true);
      });
    },

    setExtraSkulls(n: number) {
      update(s => ({ ...s, extraSkulls: Math.max(0, n) }));
    },

    endDeathIsland() {
      update(s => {
        const skulls = s.extraSkulls;
        const updated = { ...s };

        // Penaliseer alle andere spelers
        if (skulls > 0) {
          updated.players = s.players.map((p, i) =>
            i !== s.currentIdx
              ? { ...p, score: Math.max(0, p.score - skulls * 100) }
              : p
          );
        }

        return applyTurn(updated, updated.players[s.currentIdx], 0, false);
      });
    },

    undo() {
      update(s => {
        if (!s.history.length) return s;

        const last     = s.history[s.history.length - 1];
        const players  = s.players.map(p =>
          p.id === last.playerId
            ? { ...p, score: Math.max(0, p.score - last.score), history: p.history.slice(0, -1) }
            : p
        );

        // Eindronde terugdraaien?
        let { finalRound, finalRoundBy } = s;
        const player = players.find(p => p.id === last.playerId)!;
        if (finalRound && finalRoundBy === player.id && player.score < WIN_SCORE) {
          finalRound = false; finalRoundBy = null;
        }

        const prevIdx = (s.currentIdx - 1 + players.length) % players.length;
        const round   = prevIdx === players.length - 1 && s.round > 1 ? s.round - 1 : s.round;

        return {
          ...s,
          players,
          currentIdx: prevIdx,
          round,
          finalRound,
          finalRoundBy,
          history: s.history.slice(0, -1),
          selectedCard: null,
          deathIsland: false,
          extraSkulls: 0,
        };
      });
    },

    reset() {
      set(createInitialState());
    },
  };
}

// ── HELPER: apply a turn + advance ─────────────────────
function applyTurn(s: GameState, player: Player, score: number, busted: boolean): GameState {
  const card     = PIRATE_CARDS.find(c => c.id === s.selectedCard);
  const newScore = Math.max(0, player.score + score);

  const entry: TurnEntry = {
    round:      s.round,
    playerId:   player.id,
    playerName: player.name,
    cardId:     s.selectedCard,
    cardIcon:   card?.icon ?? '—',
    score,
    busted,
    totalAfter: newScore,
  };

  const players = s.players.map(p =>
    p.id === player.id
      ? { ...p, score: newScore, history: [...p.history, entry] }
      : p
  );

  let { finalRound, finalRoundBy } = s;
  if (!finalRound && newScore >= WIN_SCORE) {
    finalRound = true;
    finalRoundBy = player.id;
  }

  // Check of eindronde klaar is
  const gameEnderId = players.findIndex(p => p.id === finalRoundBy);
  const nextIdx     = (s.currentIdx + 1) % players.length;
  const gameOver    = finalRound && nextIdx === gameEnderId;

  return {
    ...s,
    players,
    history:      [...s.history, entry],
    finalRound,
    finalRoundBy,
    selectedCard: null,
    deathIsland:  false,
    extraSkulls:  0,
    currentIdx:   nextIdx,
    round:        nextIdx === 0 ? s.round + 1 : s.round,
    phase:        gameOver ? 'end' : 'playing',
  };
}

export const game = createGameStore();

// ── DERIVED ────────────────────────────────────────────
export const sortedPlayers = derived(game, $g =>
  [...$g.players].sort((a, b) => b.score - a.score)
);

export const currentPlayer = derived(game, $g =>
  $g.players[$g.currentIdx] ?? null
);
