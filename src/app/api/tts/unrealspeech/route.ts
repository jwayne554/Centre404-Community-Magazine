import { NextRequest, NextResponse } from 'next/server';

const UNREAL_SPEECH_API_URL = 'https://api.v8.unrealspeech.com';

export async function POST(request: NextRequest) {
  try {
    const { text, voiceId = 'Scarlett', speed = 0, pitch = 1.0 } = await request.json();

    // Validate API key
    const apiKey = process.env.UNREAL_SPEECH_API_KEY;
    if (!apiKey || apiKey === 'YOUR_UNREAL_SPEECH_API_KEY_HERE') {
      console.warn('[TTS] Unreal Speech API key not configured, using fallback');
      return NextResponse.json(
        { error: 'Unreal Speech API key not configured', fallback: true },
        { status: 500 }
      );
    }

    // Validate text length
    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Select endpoint based on text length
    const charCount = text.length;
    const endpoint = charCount <= 1000 ? '/stream' : '/speech';

    console.log(`[TTS] Generating audio for ${charCount} characters using ${endpoint}`);

    // Call Unreal Speech API
    const response = await fetch(`${UNREAL_SPEECH_API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Text: text,
        VoiceId: voiceId,
        Bitrate: '192k',  // Good quality, reasonable size
        Speed: speed,
        Pitch: pitch,
        Codec: 'libmp3lame',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[TTS] Unreal Speech API error:', errorText);

      // Check for quota exceeded
      if (response.status === 429) {
        return NextResponse.json(
          { error: 'TTS quota exceeded', fallback: true },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to generate speech', fallback: true },
        { status: response.status }
      );
    }

    // For /stream endpoint, response is directly the audio
    if (endpoint === '/stream') {
      const audioBuffer = await response.arrayBuffer();
      return new NextResponse(audioBuffer, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': audioBuffer.byteLength.toString(),
          'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
        },
      });
    }

    // For /speech endpoint, response is JSON with URL
    const data = await response.json();
    return NextResponse.json({
      audioUrl: data.OutputUri,
      duration: data.meta?.DurationSeconds,
    });

  } catch (error) {
    console.error('[TTS] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', fallback: true },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to check status
export async function GET() {
  const apiKey = process.env.UNREAL_SPEECH_API_KEY;
  const enabled = process.env.NEXT_PUBLIC_ENABLE_PREMIUM_TTS === 'true';
  const configured = !!apiKey && apiKey !== 'YOUR_UNREAL_SPEECH_API_KEY_HERE';

  return NextResponse.json({
    enabled,
    configured,
    provider: 'Unreal Speech',
  });
}
