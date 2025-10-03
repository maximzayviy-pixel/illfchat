import { AccessToken } from 'livekit-server-sdk';

export interface TokenRequest {
  room: string;
  identity: string;
  name?: string;
}

export async function generateAccessToken({ room, identity, name }: TokenRequest): Promise<string> {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error('Missing LiveKit API credentials');
  }

  const at = new AccessToken(apiKey, apiSecret, {
    identity,
    name: name || identity,
  });

  at.addGrant({
    room,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
  });

  return await at.toJwt();
}

export function getLiveKitUrl(): string {
  return process.env.LIVEKIT_WS_URL || 'wss://livekit-demo.herokuapp.com';
}
