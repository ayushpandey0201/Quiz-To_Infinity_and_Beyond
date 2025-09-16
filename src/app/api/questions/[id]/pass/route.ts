import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../../backend/lib/mongodb';
import { Question } from '../../../../../../backend/models';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const { fromTeam, toTeam } = await req.json();
    
    if (fromTeam === undefined || toTeam === undefined) {
      return NextResponse.json({ error: 'From team and to team are required' }, { status: 400 });
    }
    
    const question = await Question.findById(id);
    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }
    
    if (!question.opened) {
      return NextResponse.json({ error: 'Question not opened yet' }, { status: 400 });
    }
    
    // Add to pass history
    question.passHistory.push({
      fromTeam,
      toTeam,
      at: new Date()
    });
    
    await question.save();
    
    return NextResponse.json({ 
      message: 'Question passed successfully',
      passHistory: question.passHistory 
    });
  } catch (error) {
    console.error('Error passing question:', error);
    return NextResponse.json({ error: 'Failed to pass question' }, { status: 500 });
  }
}
