import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../../backend/lib/mongodb';
import { Game } from '../../../../../../backend/models';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    
    const game = await Game.findById(id);
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    
    if (game.status === 'live') {
      return NextResponse.json({ error: 'Game is already live' }, { status: 400 });
    }
    
    game.status = 'live';
    await game.save();
    
    return NextResponse.json(game);
  } catch (error) {
    console.error('Error starting game:', error);
    return NextResponse.json({ error: 'Failed to start game' }, { status: 500 });
  }
}
