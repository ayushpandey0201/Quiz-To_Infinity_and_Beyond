import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../../backend/lib/mongodb';
import { redisClient } from '../../../../../../backend/lib/redis';
import { Team } from '../../../../../../backend/models';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    
    // Check cache first
    const cachedLeaderboard = await redisClient.get(`leaderboard:${id}`);
    if (cachedLeaderboard) {
      return NextResponse.json(JSON.parse(cachedLeaderboard));
    }
    
    const teams = await Team.find({ gameId: id })
      .sort({ score: -1, correctCount: -1, teamNumber: 1 })
      .select('teamNumber score correctCount wrongCount');
    
    const leaderboard = teams.map((team, index) => ({
      rank: index + 1,
      teamNumber: team.teamNumber,
      score: team.score,
      correctCount: team.correctCount,
      wrongCount: team.wrongCount
    }));
    
    // Cache for 30 seconds (frequently updated)
    await redisClient.set(`leaderboard:${id}`, leaderboard, 30);
    
    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}