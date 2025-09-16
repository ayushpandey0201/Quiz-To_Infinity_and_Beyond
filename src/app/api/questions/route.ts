import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../backend/lib/mongodb';
import { Question, Level, Movie } from '../../../../backend/models';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { gameId, movieId, level, text, options, correctIndex } = await req.json();
    
    if (!gameId || !movieId || !level || !text || !options || correctIndex === undefined) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }
    
    if (options.length !== 4) {
      return NextResponse.json({ error: 'Exactly 4 options are required' }, { status: 400 });
    }
    
    if (correctIndex < 0 || correctIndex > 3) {
      return NextResponse.json({ error: 'Correct index must be between 0 and 3' }, { status: 400 });
    }
    
    // Create question
    const question = new Question({
      gameId,
      movieId,
      level,
      text,
      options,
      correctIndex,
    });
    
    await question.save();
    
    // Add question to level
    const movie = await Movie.findById(movieId);
    if (movie && movie.levels[level]) {
      const levelDoc = await Level.findById(movie.levels[level]);
      if (levelDoc) {
        levelDoc.questions.push(question._id);
        await levelDoc.save();
      }
    }
    
    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json({ error: 'Failed to create question' }, { status: 500 });
  }
}

