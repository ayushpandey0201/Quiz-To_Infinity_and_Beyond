import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminPassword, generateToken, createAdminUser } from '../../../../../backend/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    
    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }
    
    const isValid = await verifyAdminPassword(password);
    
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }
    
    const adminUser = createAdminUser();
    const token = generateToken(adminUser);
    
    const response = NextResponse.json({ 
      user: adminUser,
      message: 'Login successful' 
    });
    
    // Set HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
    });
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

