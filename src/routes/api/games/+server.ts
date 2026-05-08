// src/routes/api/games/+server.ts
import { json } from '@sveltejs/kit';
import { getDb } from '$lib/db';
import { games, gamePlayers, turns } from '$lib/db/schema';

export async function POST({ request }) {
  const body = await request.json();
  const { players, turns: turnData, round } = body;

  // Sorteer op score voor rangschikking
  const sorted = [...players].sort((a: any, b: any) => b.score - a.score);
  const winner = sorted[0];

  const db = getDb();

  // Sla het potje op
  const [game] = await db
    .insert(games)
    .values({
      winnerName:  winner.name,
      winnerScore: winner.score,
      playerCount: players.length,
    })
    .returning();

  // Sla eindscore per speler op
  await db.insert(gamePlayers).values(
    sorted.map((p: any, i: number) => ({
      gameId:     game.id,
      playerName: p.name,
      finalScore: p.score,
      rank:       i + 1,
      totalTurns: turnData.filter((t: any) => t.playerName === p.name).length,
      totalBusts: turnData.filter((t: any) => t.playerName === p.name && t.busted).length,
    }))
  );

  // Sla alle beurten op
  if (turnData?.length) {
    await db.insert(turns).values(
      turnData.map((t: any) => ({
        gameId:     game.id,
        playerName: t.playerName,
        round:      t.round,
        cardId:     t.cardId,
        score:      t.score,
        busted:     t.busted,
      }))
    );
  }

  return json({ id: game.id }, { status: 201 });
}
