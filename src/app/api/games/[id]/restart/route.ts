import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../../backend/lib/mongodb';
import { Game, Question, Team } from '../../../../../../backend/models';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    
    const game = await Game.findById(id);
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    
    // Perform all database operations in parallel for better performance
    await Promise.all([
      // Reset all questions to unopened, unanswered and clear pass history
      Question.updateMany(
        { gameId: id },
        { 
          $set: { opened: false, answered: false },
          $unset: { passHistory: 1 }
        }
      ),
      
      // Reset team scores
      Team.updateMany(
        { gameId: id },
        { 
          $set: { 
            score: 0,
            correctCount: 0,
            wrongCount: 0
          }
        }
      ),
      
      // Reset game status
      Game.findByIdAndUpdate(id, { status: 'not-started' })
    ]);
    
    // Skip Redis cache clearing since it's not set up
    console.log(`Game ${id} restarted successfully`);
    
    return NextResponse.json({ message: 'Game restarted successfully', game });
  } catch (error) {
    console.error('Error restarting game:', error);
    return NextResponse.json({ error: 'Failed to restart game' }, { status: 500 });
  }
}
