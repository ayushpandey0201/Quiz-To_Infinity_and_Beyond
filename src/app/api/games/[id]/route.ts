import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../backend/lib/mongodb';
import { redisClient } from '../../../../../backend/lib/redis';
import { Game, Movie, Level, Question, Team } from '../../../../../backend/models';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const game = await Game.findById(id).populate({
      path: 'movies',
      populate: {
        path: 'levels.easy levels.medium levels.hard',
        populate: {
          path: 'questions'
        }
      }
    });
    
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    
    return NextResponse.json(game);
  } catch (error) {
    console.error('Error fetching game:', error);
    return NextResponse.json({ error: 'Failed to fetch game' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const updates = await req.json();
    
    const game = await Game.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    );
    
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    
    // Clear cache when game is updated
    try {
      await redisClient.del(`game:${id}`);
    } catch (error) {
      console.warn('Redis cache update failed:', error);
    }
    
    return NextResponse.json(game);
  } catch (error) {
    console.error('Error updating game:', error);
    return NextResponse.json({ error: 'Failed to update game' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    
    // Delete all related data
    const movies = await Movie.find({ gameId: id });
    const movieIds = movies.map(m => m._id);
    
    await Question.deleteMany({ gameId: id });
    await Level.deleteMany({ movieId: { $in: movieIds } });
    await Movie.deleteMany({ gameId: id });
    await Team.deleteMany({ gameId: id });
    
    const game = await Game.findByIdAndDelete(id);
    
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    
    // Clear cache
    try {
      await redisClient.del(`game:${id}`);
      await redisClient.del(`teams:${id}`);
    } catch (error) {
      console.warn('Redis cache update failed:', error);
    }
    
    return NextResponse.json({ message: 'Game deleted successfully' });
  } catch (error) {
    console.error('Error deleting game:', error);
    return NextResponse.json({ error: 'Failed to delete game' }, { status: 500 });
  }
}
