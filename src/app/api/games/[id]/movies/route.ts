import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../../backend/lib/mongodb';
import { Game, Movie, Level } from '../../../../../../backend/models';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const movies = await Movie.find({ gameId: id })
      .populate({
        path: 'levels.easy levels.medium levels.hard',
        populate: {
          path: 'questions'
        }
      })
      .sort({ index: 1 });
    
    return NextResponse.json(movies);
  } catch (error) {
    console.error('Error fetching movies:', error);
    return NextResponse.json({ error: 'Failed to fetch movies' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const { title, index } = await req.json();
    
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    
    // Check if game exists
    const game = await Game.findById(id);
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    
    // Check movie limit (30 max)
    const movieCount = await Movie.countDocuments({ gameId: id });
    if (movieCount >= 30) {
      return NextResponse.json({ error: 'Maximum 30 movies allowed per game' }, { status: 400 });
    }
    
    // Create the movie
    const movieIndex = index !== undefined ? index : movieCount;
    const movie = new Movie({
      gameId: id,
      title,
      index: movieIndex,
      levels: {}
    });
    
    // Create levels for the movie
    const levels = ['easy', 'medium', 'hard'] as const;
    for (const levelName of levels) {
      const level = new Level({
        movieId: movie._id,
        levelName,
        questions: []
      });
      await level.save();
      movie.levels[levelName] = level._id;
    }
    
    await movie.save();
    
    // Add movie to game
    game.movies.push(movie._id);
    await game.save();
    
    return NextResponse.json(movie, { status: 201 });
  } catch (error) {
    console.error('Error creating movie:', error);
    return NextResponse.json({ error: 'Failed to create movie' }, { status: 500 });
  }
}
