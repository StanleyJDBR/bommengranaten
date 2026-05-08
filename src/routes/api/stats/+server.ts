// src/routes/api/stats/+server.ts
import { json } from '@sveltejs/kit';
import { getDb } from '$lib/db';
import { games, gamePlayers, turns } from '$lib/db/schema';
import { desc, eq, sql, count, avg, max, min } from 'drizzle-orm';

export async function GET() {
  const db = getDb();

  const [
    recentGames,
    topPlayers,
    cardStats,
    totalGames,
  ] = await Promise.all([
    // Laatste 10 potjes
    db.select().from(games).orderBy(desc(games.playedAt)).limit(10),

    // Top spelers op basis van gemiddelde eindscore
    db
      .select({
        playerName: gamePlayers.playerName,
        gamesPlayed: count(gamePlayers.id),
        avgScore: sql<number>`round(avg(${gamePlayers.finalScore}), 0)`,
        maxScore: max(gamePlayers.finalScore),
        totalWins: sql<number>`sum(case when ${gamePlayers.rank} = 1 then 1 else 0 end)`,
        totalBusts: sql<number>`sum(${gamePlayers.totalBusts})`,
      })
      .from(gamePlayers)
      .groupBy(gamePlayers.playerName)
      .orderBy(desc(sql`avg(${gamePlayers.finalScore})`))
      .limit(10),

    // Meest gebruikte kaarten
    db
      .select({
        cardId: turns.cardId,
        timesUsed: count(turns.id),
        avgScore: sql<number>`round(avg(${turns.score}), 0)`,
        bustRate: sql<number>`round(100.0 * sum(case when ${turns.busted} then 1 else 0 end) / count(*), 1)`,
      })
      .from(turns)
      .where(sql`${turns.cardId} is not null`)
      .groupBy(turns.cardId)
      .orderBy(desc(count(turns.id))),

    // Totaal potjes
    db.select({ count: count() }).from(games),
  ]);

  return json({
    recentGames,
    topPlayers,
    cardStats,
    totalGames: totalGames[0]?.count ?? 0,
  });
}
