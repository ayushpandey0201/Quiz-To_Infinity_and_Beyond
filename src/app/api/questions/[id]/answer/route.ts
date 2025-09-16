import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../../backend/lib/mongodb';
import { redisClient } from '../../../../../../backend/lib/redis';
import { Question, Team } from '../../../../../../backend/models';
import { calculateScore } from '../../../../../../backend/lib/scoring';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const requestBody = await req.json();
    const { teamNumber, selectedOptionIndex } = requestBody;
    
    if (teamNumber === undefined || selectedOptionIndex === undefined) {
      return NextResponse.json({ error: 'Team number and selected option are required' }, { status: 400 });
    }
    
    const question = await Question.findById(id);
    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }
    
    if (!question.opened) {
      return NextResponse.json({ error: 'Question not opened yet' }, { status: 400 });
    }
    
    if (question.answered) {
      return NextResponse.json({ error: 'Question already answered' }, { status: 400 });
    }
    
    const isCorrect = selectedOptionIndex === question.correctIndex;
    const isPassed = question.passHistory && question.passHistory.length > 0;
    
    // Calculate score
    const scoreChange = calculateScore(question.level, isCorrect, isPassed);
    
    // Update team score
    const team = await Team.findOne({ 
      gameId: question.gameId, 
      teamNumber 
    });
    
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }
    
    team.score += scoreChange;
    if (isCorrect) {
      team.correctCount += 1;
    } else {
      team.wrongCount += 1;
    }
    
    await team.save();
    
    // Mark question as answered
    question.answered = true;
    await question.save();
    
    // Clear leaderboard cache to force refresh
    try {
      await redisClient.del(`leaderboard:${question.gameId}`);
    } catch (error) {
      console.warn('Redis cache update failed:', error);
    }
    
    return NextResponse.json({
      isCorrect,
      correctAnswer: question.correctIndex,
      scoreChange,
      team: {
        number: team.teamNumber,
        score: team.score,
        correctCount: team.correctCount,
        wrongCount: team.wrongCount
      }
    });
  } catch (error) {
    console.error('Error answering question:', error);
    return NextResponse.json({ error: 'Failed to process answer' }, { status: 500 });
  }
}
