// src/lib/db/schema.ts
import { sql } from 'drizzle-orm';
import { integer, text, sqliteTable } from 'drizzle-orm/sqlite-core';

// Een gespeeld potje
export const games = sqliteTable('games', {
  id:               integer('id').primaryKey({ autoIncrement: true }),
  playedAt:         integer('played_at', { mode: 'timestamp' })
                      .notNull()
                      .default(sql`(unixepoch())`),
  winnerName:       text('winner_name').notNull(),
  winnerScore:      integer('winner_score').notNull(),
  durationMinutes:  integer('duration_minutes'),
  playerCount:      integer('player_count').notNull(),
});

// Eindscore per speler per potje
export const gamePlayers = sqliteTable('game_players', {
  id:         integer('id').primaryKey({ autoIncrement: true }),
  gameId:     integer('game_id').notNull().references(() => games.id),
  playerName: text('player_name').notNull(),
  finalScore: integer('final_score').notNull(),
  rank:       integer('rank').notNull(),
  totalTurns: integer('total_turns').notNull().default(0),
  totalBusts: integer('total_busts').notNull().default(0),
});

// Elke individuele beurt
export const turns = sqliteTable('turns', {
  id:         integer('id').primaryKey({ autoIncrement: true }),
  gameId:     integer('game_id').notNull().references(() => games.id),
  playerName: text('player_name').notNull(),
  round:      integer('round').notNull(),
  cardId:     text('card_id'),
  score:      integer('score').notNull(),
  busted:     integer('busted', { mode: 'boolean' }).notNull().default(false),
});

export type Game       = typeof games.$inferSelect;
export type GamePlayer = typeof gamePlayers.$inferSelect;
export type Turn       = typeof turns.$inferSelect;
