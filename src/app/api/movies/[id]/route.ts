import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../backend/lib/mongodb';
import { Game, Movie, Level, Question } from '../../../../../backend/models';

// DELETE movie
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id: movieId } = await params;
    
    // Find the movie
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
    }
    
    // Delete all questions associated with this movie
    await Question.deleteMany({ movieId: movieId });
    
    // Delete all levels associated with this movie
    const levelIds = Object.values(movie.levels).filter(id => id);
    await Level.deleteMany({ _id: { $in: levelIds } });
    
    // Remove movie from game
    await Game.findByIdAndUpdate(
      movie.gameId,
      { $pull: { movies: movieId } }
    );
    
    // Delete the movie
    await Movie.findByIdAndDelete(movieId);
    
    return NextResponse.json({ message: 'Movie deleted successfully' });
  } catch (error) {
    console.error('Error deleting movie:', error);
    return NextResponse.json({ error: 'Failed to delete movie' }, { status: 500 });
  }
}

// GET single movie
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const movie = await Movie.findById(id)
      .populate({
        path: 'levels.easy levels.medium levels.hard',
        populate: {
          path: 'questions'
        }
      });
    
    if (!movie) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
    }
    
    return NextResponse.json(movie);
  } catch (error) {
    console.error('Error fetching movie:', error);
    return NextResponse.json({ error: 'Failed to fetch movie' }, { status: 500 });
  }
}
