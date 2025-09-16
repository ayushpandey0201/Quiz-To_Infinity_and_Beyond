import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../../backend/lib/mongodb';
import { Team } from '../../../../../../backend/models';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    
    // Skip Redis cache since it's not set up
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
    
    console.log(`Leaderboard for game ${id}:`, leaderboard);
    
    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}