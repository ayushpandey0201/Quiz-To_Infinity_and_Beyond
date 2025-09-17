import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../../backend/lib/mongodb';
import { Team } from '../../../../../../backend/models';
import mongoose from 'mongoose';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    await connectDB();
    const { teamId } = await params;
    const body = await request.json();
    const { points, correctCount, wrongCount } = body;

    // Validate team ID format
    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      console.error('Invalid team ID format:', teamId);
      return NextResponse.json({ error: 'Invalid team ID format' }, { status: 400 });
    }

    // Validate input
    if (typeof points !== 'number') {
      return NextResponse.json({ error: 'Points must be a number' }, { status: 400 });
    }

    if (correctCount !== undefined && (typeof correctCount !== 'number' || correctCount < 0)) {
      return NextResponse.json({ error: 'Correct count must be a non-negative number' }, { status: 400 });
    }

    if (wrongCount !== undefined && (typeof wrongCount !== 'number' || wrongCount < 0)) {
      return NextResponse.json({ error: 'Wrong count must be a non-negative number' }, { status: 400 });
    }

    const team = await Team.findByIdAndUpdate(
      teamId,
      { 
        score: points,
        ...(correctCount !== undefined && { correctCount }),
        ...(wrongCount !== undefined && { wrongCount })
      },
      { new: true }
    );

    if (!team) {
      console.error('Team not found:', teamId);
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }


    return NextResponse.json({
      success: true,
      team: {
        _id: team._id,
        teamNumber: team.teamNumber,
        score: team.score,
        correctCount: team.correctCount,
        wrongCount: team.wrongCount
      }
    });
  } catch (error) {
    console.error('Error updating team points:', error);
    return NextResponse.json({ 
      error: 'Failed to update team points', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
