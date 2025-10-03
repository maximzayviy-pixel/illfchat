import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Простое хранилище статистики в памяти (в реальном приложении используйте базу данных)
let callStats = {
  totalCalls: 0,
  videoCalls: 0,
  audioCalls: 0,
  totalDuration: 0, // в минутах
  calls: [] as Array<{
    id: string;
    type: 'video' | 'audio';
    participants: string[];
    duration: number;
    timestamp: Date;
  }>
};

export async function GET(request: NextRequest) {
  try {
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

    return NextResponse.json({
      stats: {
        totalCalls: callStats.totalCalls,
        videoCalls: callStats.videoCalls,
        audioCalls: callStats.audioCalls,
        totalDuration: callStats.totalDuration,
        averageDuration: callStats.totalCalls > 0 ? Math.round(callStats.totalDuration / callStats.totalCalls) : 0,
      },
      recentCalls: callStats.calls.slice(-10).reverse()
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const { type, participants, duration } = await request.json();

    const call = {
      id: Math.random().toString(36).substring(2, 15),
      type,
      participants,
      duration: duration || 0,
      timestamp: new Date(),
    };

    callStats.calls.push(call);
    callStats.totalCalls++;
    
    if (type === 'video') {
      callStats.videoCalls++;
    } else if (type === 'audio') {
      callStats.audioCalls++;
    }
    
    callStats.totalDuration += duration || 0;

    return NextResponse.json({ success: true, call });
  } catch (error) {
    console.error('Error recording call:', error);
    return NextResponse.json(
      { error: 'Failed to record call' },
      { status: 500 }
    );
  }
}
