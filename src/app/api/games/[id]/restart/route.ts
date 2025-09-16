import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../../backend/lib/mongodb';
import { redisClient } from '../../../../../../backend/lib/redis';
import { Game, Question, Team } from '../../../../../../backend/models';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    
    const game = await Game.findById(id);
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    
    // Reset all questions to unopened, unanswered and clear pass history
    await Question.updateMany(
      { gameId: id },
      { 
        $set: { opened: false, answered: false },
        $unset: { passHistory: 1 }
      }
    );
    
    // Reset team scores
    await Team.updateMany(
      { gameId: id },
      { 
        $set: { 
          score: 0,
          correctCount: 0,
          wrongCount: 0
        }
      }
    );
    
    // Reset game status
    game.status = 'not-started';
    await game.save();
    
    // Clear all related cache
    try {
      await redisClient.del(`game:${id}`);
      await redisClient.del(`teams:${id}`);
      await redisClient.del(`leaderboard:${id}`);
    } catch (error) {
      console.warn('Redis cache clear failed:', error);
    }
    
    return NextResponse.json({ message: 'Game restarted successfully', game });
  } catch (error) {
    console.error('Error restarting game:', error);
    return NextResponse.json({ error: 'Failed to restart game' }, { status: 500 });
  }
}
