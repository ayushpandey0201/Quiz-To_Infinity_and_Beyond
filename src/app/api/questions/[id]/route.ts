import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../backend/lib/mongodb';
import { Question } from '../../../../../backend/models';

// GET single question
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const question = await Question.findById(id);
    
    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }
    
    return NextResponse.json(question);
  } catch (error) {
    console.error('Error fetching question:', error);
    return NextResponse.json({ error: 'Failed to fetch question' }, { status: 500 });
  }
}

// PUT (update) question
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { text, options, correctIndex } = await req.json();
    
    if (!text || !options || correctIndex === undefined) {
      return NextResponse.json({ error: 'Text, options, and correctIndex are required' }, { status: 400 });
    }
    
    if (options.length !== 4) {
      return NextResponse.json({ error: 'Exactly 4 options are required' }, { status: 400 });
    }
    
    if (correctIndex < 0 || correctIndex > 3) {
      return NextResponse.json({ error: 'Correct index must be between 0 and 3' }, { status: 400 });
    }
    
    const { id } = await params;
    const question = await Question.findByIdAndUpdate(
      id,
      { text, options, correctIndex },
      { new: true, runValidators: true }
    );
    
    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }
    
    return NextResponse.json(question);
  } catch (error) {
    console.error('Error updating question:', error);
    return NextResponse.json({ error: 'Failed to update question' }, { status: 500 });
  }
}

// DELETE question
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const question = await Question.findByIdAndDelete(id);
    
    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 });
  }
}
