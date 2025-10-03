import { NextRequest, NextResponse } from 'next/server';
import { generateAccessToken, getLiveKitUrl } from '@/lib/livekit';
import { verifyToken, getUserById } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { room, identity, name } = await request.json();
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Недействительный токен' },
        { status: 401 }
      );
    }

    const user = getUserById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 401 }
      );
    }

    if (!room || !identity) {
      return NextResponse.json(
        { error: 'Missing room or identity' },
        { status: 400 }
      );
    }

    const accessToken = await generateAccessToken({ 
      room, 
      identity: user.username, 
      name: user.username 
    });
    const wsUrl = getLiveKitUrl();

    return NextResponse.json({
      token: accessToken,
      wsUrl,
    });
  } catch (error) {
    console.error('Error generating token:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}
