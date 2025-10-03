import { NextRequest, NextResponse } from 'next/server';
import { generateAccessToken, getLiveKitUrl } from '@/lib/livekit';

export async function POST(request: NextRequest) {
  try {
    const { room, identity, name } = await request.json();

    if (!room || !identity) {
      return NextResponse.json(
        { error: 'Missing room or identity' },
        { status: 400 }
      );
    }

    const token = await generateAccessToken({ room, identity, name });
    const wsUrl = getLiveKitUrl();

    return NextResponse.json({
      token,
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
