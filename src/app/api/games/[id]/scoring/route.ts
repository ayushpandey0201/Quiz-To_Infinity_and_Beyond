import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../../backend/lib/mongodb';
import { Game } from '../../../../../../backend/models';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const game = await Game.findById(id);
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // Clean the data to remove MongoDB _id fields
    const cleanScoringRules = game.scoringRules ? {
      easy: {
        correct: game.scoringRules.easy?.correct || 300,
        wrong: game.scoringRules.easy?.wrong || -150,
        pass: game.scoringRules.easy?.pass || 150
      },
      medium: {
        correct: game.scoringRules.medium?.correct || 600,
        wrong: game.scoringRules.medium?.wrong || -300,
        pass: game.scoringRules.medium?.pass || 300
      },
      hard: {
        correct: game.scoringRules.hard?.correct || 1000,
        wrong: game.scoringRules.hard?.wrong || -500,
        pass: game.scoringRules.hard?.pass || 500
      }
    } : {
      easy: { correct: 300, wrong: -150, pass: 150 },
      medium: { correct: 600, wrong: -300, pass: 300 },
      hard: { correct: 1000, wrong: -500, pass: 500 }
    };

    return NextResponse.json({
      scoringRules: cleanScoringRules,
      customLevels: game.customLevels || []
    });
  } catch (error) {
    console.error('Error fetching scoring rules:', error);
    return NextResponse.json({ error: 'Failed to fetch scoring rules' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const { scoringRules, customLevels } = await request.json();

    const game = await Game.findByIdAndUpdate(
      id,
      { 
        scoringRules,
        customLevels: customLevels || []
      },
      { new: true }
    );

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // Clean the response data
    const cleanScoringRules = {
      easy: {
        correct: game.scoringRules.easy?.correct || 300,
        wrong: game.scoringRules.easy?.wrong || -150,
        pass: game.scoringRules.easy?.pass || 150
      },
      medium: {
        correct: game.scoringRules.medium?.correct || 600,
        wrong: game.scoringRules.medium?.wrong || -300,
        pass: game.scoringRules.medium?.pass || 300
      },
      hard: {
        correct: game.scoringRules.hard?.correct || 1000,
        wrong: game.scoringRules.hard?.wrong || -500,
        pass: game.scoringRules.hard?.pass || 500
      }
    };

    return NextResponse.json({
      success: true,
      scoringRules: cleanScoringRules,
      customLevels: game.customLevels || []
    });
  } catch (error) {
    console.error('Error updating scoring rules:', error);
    return NextResponse.json({ error: 'Failed to update scoring rules' }, { status: 500 });
  }
}
