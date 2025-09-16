import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../../backend/lib/mongodb';
import { Team, Game } from '../../../../../../backend/models';

export async function GET(req: NextRequest, { params }: { params: { gameId: string } }) {
  try {
    await connectDB();
    const gameId = params.gameId;
    
    // Get game info
    const game = await Game.findById(gameId);
    
    // Get all teams for this game
    const teams = await Team.find({ gameId }).sort({ teamNumber: 1 });
    
    return NextResponse.json({
      game: game ? {
        _id: game._id,
        title: game.title,
        status: game.status
      } : null,
      teams: teams.map(team => ({
        _id: team._id,
        teamNumber: team.teamNumber,
        score: team.score,
        correctCount: team.correctCount,
        wrongCount: team.wrongCount
      })),
      totalTeams: teams.length,
      teamNumbers: teams.map(t => t.teamNumber)
    });
  } catch (error) {
    console.error('Error debugging teams:', error);
    return NextResponse.json({ error: 'Failed to debug teams' }, { status: 500 });
  }
}
