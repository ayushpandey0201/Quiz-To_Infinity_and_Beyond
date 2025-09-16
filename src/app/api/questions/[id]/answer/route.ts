import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../../backend/lib/mongodb';
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
      // Debug logging
      console.error('Team not found:', {
        gameId: question.gameId,
        teamNumber,
        questionId: id
      });
      
      // Let's check what teams exist for this game
      const existingTeams = await Team.find({ gameId: question.gameId });
      console.error('Existing teams for this game:', existingTeams.map(t => ({ teamNumber: t.teamNumber, _id: t._id })));
      
      return NextResponse.json({ 
        error: 'Team not found',
        debug: {
          requestedTeam: teamNumber,
          gameId: question.gameId,
          existingTeams: existingTeams.map(t => t.teamNumber)
        }
      }, { status: 404 });
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
    
    // Skip Redis cache clearing since it's not set up
    
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
