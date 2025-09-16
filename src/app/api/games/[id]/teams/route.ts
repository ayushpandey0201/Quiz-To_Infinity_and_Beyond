import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../../backend/lib/mongodb';
import { redisClient } from '../../../../../../backend/lib/redis';
import { Team, Game } from '../../../../../../backend/models';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    
    // Check cache first
    const cachedTeams = await redisClient.get(`teams:${id}`);
    if (cachedTeams) {
      return NextResponse.json(JSON.parse(cachedTeams));
    }
    
    const teams = await Team.find({ gameId: id }).sort({ teamNumber: 1 });
    
    // Cache for 5 minutes
    await redisClient.set(`teams:${id}`, teams, 300);
    
    return NextResponse.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const { numberOfTeams } = await req.json();
    
    if (!numberOfTeams || numberOfTeams < 1) {
      return NextResponse.json({ error: 'Number of teams must be at least 1' }, { status: 400 });
    }
    
    // Check if game exists
    const game = await Game.findById(id);
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    
    // Check if teams already exist
    const existingTeams = await Team.find({ gameId: id });
    if (existingTeams.length > 0) {
      return NextResponse.json({ error: 'Teams already created for this game' }, { status: 400 });
    }
    
    // Create teams
    const teams = [];
    for (let i = 1; i <= numberOfTeams; i++) {
      const team = new Team({
        gameId: id,
        teamNumber: i,
        score: 0,
        correctCount: 0,
        wrongCount: 0
      });
      await team.save();
      teams.push(team);
    }
    
    // Cache teams
    await redisClient.set(`teams:${id}`, teams, 300);
    
    return NextResponse.json(teams, { status: 201 });
  } catch (error) {
    console.error('Error creating teams:', error);
    return NextResponse.json({ error: 'Failed to create teams' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    
    // Check if game exists
    const game = await Game.findById(id);
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    
    // Delete all teams for this game
    const result = await Team.deleteMany({ gameId: id });
    
    // Clear cache
    await redisClient.del(`teams:${id}`);
    await redisClient.del(`leaderboard:${id}`);
    
    return NextResponse.json({ 
      message: `Deleted ${result.deletedCount} teams`,
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error('Error deleting teams:', error);
    return NextResponse.json({ error: 'Failed to delete teams' }, { status: 500 });
  }
}