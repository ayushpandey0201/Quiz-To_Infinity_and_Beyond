import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../../backend/lib/mongodb';
import { Game } from '../../../../../../backend/models';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    
    console.log('Toggling show answer for game:', id);
    
    // First, get the current game
    const currentGame = await Game.findById(id);
    if (!currentGame) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    
    console.log('Current game:', currentGame.toObject());
    console.log('Current allowShowAnswer:', currentGame.allowShowAnswer);
    
    // Toggle the value
    const newValue = !(currentGame.allowShowAnswer ?? false);
    console.log('Setting allowShowAnswer to:', newValue);
    
    // Update the game
    const updatedGame = await Game.findByIdAndUpdate(
      id,
      { allowShowAnswer: newValue },
      { new: true, runValidators: true }
    );
    
    console.log('Updated game:', updatedGame?.toObject());
    
    if (!updatedGame) {
      return NextResponse.json({ error: 'Failed to update game' }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      game: updatedGame,
      oldValue: currentGame.allowShowAnswer ?? false,
      newValue: newValue
    });
  } catch (error) {
    console.error('Error toggling show answer:', error);
    return NextResponse.json({ 
      error: 'Failed to toggle show answer', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
