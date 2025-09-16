import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../../backend/lib/mongodb';
import { Question } from '../../../../../../backend/models';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    
    const question = await Question.findById(id);
    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }
    
    if (question.opened) {
      return NextResponse.json({ error: 'Question already opened' }, { status: 400 });
    }
    
    // Mark question as opened
    question.opened = true;
    await question.save();
    
    return NextResponse.json({
      _id: question._id,
      text: question.text,
      options: question.options,
      correctIndex: question.correctIndex,
      level: question.level,
      opened: question.opened
    });
  } catch (error) {
    console.error('Error opening question:', error);
    return NextResponse.json({ error: 'Failed to open question' }, { status: 500 });
  }
}
