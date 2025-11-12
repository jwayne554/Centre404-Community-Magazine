# Text-to-Speech (TTS) Improvement Options
**Date:** 2025-11-11
**Current Issue:** Web Speech API voices sound too robotic
**Goal:** More natural, human-like voices for accessibility

---

## Current Implementation

**Technology:** Web Speech API (`window.speechSynthesis`)
**Location:**
- `src/components/magazine/magazine-viewer.tsx:61-83`
- `src/components/magazine/simple-magazine-viewer.tsx:42-49`

**Characteristics:**
- ✅ FREE (no API costs)
- ✅ No server required (runs in browser)
- ✅ Works offline
- ✅ Instant response
- ❌ **Robotic-sounding** (mechanical voice)
- ❌ Limited voice quality
- ❌ Varies by browser/OS

---

## Clarification: Whisper vs TTS

⚠️ **Important:** OpenAI Whisper is for **Speech-to-Text** (STT), NOT Text-to-Speech (TTS)

- **Whisper**: Audio → Text (transcription)
- **TTS**: Text → Audio (what you need)
- **OpenAI TTS**: Separate service from Whisper

---

## Recommended Options

### 🥇 Option 1: ElevenLabs API (Best Quality)

**Pricing:**
- FREE: 10,000 characters/month
- Paid: $5/month for 30,000 characters
- $22/month for 100,000 characters

**Voice Quality:** ⭐⭐⭐⭐⭐ (Excellent - Most Natural)
- Emotion and intonation
- Context-aware speech
- 5,000+ voices
- 32 languages

**Pros:**
- ✅ Most natural-sounding voices
- ✅ Free tier sufficient for testing
- ✅ Emotion detection from punctuation
- ✅ Multiple accent options
- ✅ Good for accessibility

**Cons:**
- ❌ Requires API key
- ❌ Needs server-side implementation (API route)
- ❌ Character limits on free tier
- ❌ Network latency

**Estimated Usage:**
- Average story: 500-1,000 characters
- 10,000 chars/month = 10-20 stories/month
- For Centre404: Likely sufficient on free tier

**Best For:** Production quality, emotional content, community stories

---

### 🥈 Option 2: Unreal Speech API (Most Free Characters)

**Pricing:**
- FREE: 250,000 characters/month (25x more than ElevenLabs)
- Paid: $49/month for 625,000 characters

**Voice Quality:** ⭐⭐⭐⭐ (Very Good)
- Natural-sounding
- 4x cheaper than OpenAI
- Multiple voices

**Pros:**
- ✅ HUGE free tier (250k chars)
- ✅ Very natural voices
- ✅ Cost-effective
- ✅ Good for high volume

**Cons:**
- ❌ Requires API key
- ❌ Needs server-side implementation
- ❌ Fewer voice options than ElevenLabs
- ❌ Network latency

**Estimated Usage:**
- 250,000 chars/month = 250-500 stories/month
- Enough for ~17 stories/day

**Best For:** High volume, budget-conscious, testing phase

---

### 🥉 Option 3: OpenAI TTS API (Paid Only)

**Pricing:**
- ❌ NO FREE TIER
- $0.015 per 1,000 characters (tts-1)
- $0.030 per 1,000 characters (tts-1-hd)

**Voice Quality:** ⭐⭐⭐⭐ (Very Good)
- Natural-sounding
- Multiple voices (Alloy, Echo, Fable, Onyx, Nova, Shimmer)
- HD quality option

**Pros:**
- ✅ Natural voices
- ✅ Reliable service
- ✅ Part of OpenAI ecosystem (if already using)
- ✅ Simple API

**Cons:**
- ❌ **NOT FREE** (pay per use)
- ❌ Costs add up with high usage
- ❌ Requires API key
- ❌ Needs server-side implementation

**Cost Estimate:**
- 100 stories/month @ 1,000 chars each = 100,000 chars
- Cost: $1.50/month (tts-1) or $3.00/month (tts-1-hd)

**Best For:** If already using OpenAI API, moderate usage

---

### 🔧 Option 4: Improved Web Speech API (Free Enhancement)

**Pricing:**
- FREE

**Voice Quality:** ⭐⭐⭐ (Moderate - Better than current)
- Still uses Web Speech API
- Improved through better voice selection
- Tuned parameters

**Improvements:**
1. **Select better voices** (some are less robotic)
2. **Tune speech parameters** (rate, pitch, volume)
3. **Add pauses for punctuation**
4. **Pre-process text** (expand abbreviations, add context)

**Pros:**
- ✅ FREE (no ongoing costs)
- ✅ No API key needed
- ✅ No server implementation required
- ✅ Works offline
- ✅ No character limits
- ✅ Privacy-friendly (no data sent to servers)

**Cons:**
- ❌ Still somewhat robotic
- ❌ Quality varies by browser/OS
- ❌ Limited emotional range

**Best For:** Budget constraints, privacy concerns, offline support

---

### 🆕 Option 5: Hybrid Approach (Recommended)

**Strategy:** Use both Web Speech API + Premium TTS

**Implementation:**
```
If (user has premium/admin access OR special story):
  → Use ElevenLabs/Unreal Speech (natural voice)
Else:
  → Use improved Web Speech API (free fallback)
```

**Pricing:**
- Mostly FREE (Web Speech API)
- Premium stories: ElevenLabs free tier (10k chars/month)

**Voice Quality:** ⭐⭐⭐⭐ (Adaptive)
- Most stories: Improved Web Speech
- Important stories: Premium TTS

**Pros:**
- ✅ Cost-effective
- ✅ Best voices for key content
- ✅ Fallback for high volume
- ✅ Gradual migration path

**Cons:**
- ❌ More complex implementation
- ❌ Inconsistent voice experience

**Best For:** Centre404's use case - balance quality and cost

---

## Detailed Comparison Table

| Feature | Web Speech API | ElevenLabs | Unreal Speech | OpenAI TTS | Hybrid |
|---------|---------------|------------|---------------|------------|--------|
| **Free Tier** | ✅ Unlimited | 10k chars/month | 250k chars/month | ❌ None | ✅ Mostly free |
| **Voice Quality** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Emotional Tone** | ❌ | ✅ Excellent | ✅ Good | ✅ Good | ✅ Adaptive |
| **API Key Required** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Server-Side** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Latency** | Instant | ~1-3 sec | ~1-3 sec | ~1-3 sec | Mixed |
| **Offline Support** | ✅ | ❌ | ❌ | ❌ | Partial |
| **Languages** | OS-dependent | 32 | Multiple | 57 | Both |
| **Accessibility** | ✅ High | ✅ High | ✅ High | ✅ High | ✅ Highest |
| **Setup Complexity** | ⭐ Easy | ⭐⭐⭐ Medium | ⭐⭐⭐ Medium | ⭐⭐⭐ Medium | ⭐⭐⭐⭐ Complex |

---

## Cost Analysis for Centre404

**Assumptions:**
- 50 stories/month
- Average 800 characters/story
- Total: 40,000 characters/month

### Monthly Costs:

| Service | Free Tier | Cost if Exceeded |
|---------|-----------|------------------|
| Web Speech API | ✅ $0 | $0 (unlimited) |
| ElevenLabs Free | ❌ Exceeds (10k limit) | $5/month (30k tier) |
| Unreal Speech Free | ✅ $0 (250k limit) | Still free |
| OpenAI TTS | ❌ No free tier | $0.60/month |
| Hybrid | ✅ $0 | $0 (use Web Speech for overflow) |

**Recommendation:** **Unreal Speech** or **Hybrid** approach

---

## Implementation Examples

### Option 1: ElevenLabs Implementation

```typescript
// src/lib/tts/elevenlabs.ts
export async function generateSpeech(text: string): Promise<Blob> {
  const response = await fetch('/api/tts/elevenlabs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });

  return await response.blob();
}

// src/app/api/tts/elevenlabs/route.ts
export async function POST(request: Request) {
  const { text } = await request.json();

  const response = await fetch(
    'https://api.elevenlabs.io/v1/text-to-speech/VOICE_ID',
    {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'xi-api-key': process.env.ELEVENLABS_API_KEY!,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    }
  );

  const audioBlob = await response.blob();
  return new Response(audioBlob, {
    headers: { 'Content-Type': 'audio/mpeg' }
  });
}
```

### Option 2: Improved Web Speech API

```typescript
// src/lib/tts/web-speech-improved.ts
export function speakTextImproved(text: string) {
  if (!('speechSynthesis' in window)) {
    alert('Text-to-speech is not supported in your browser.');
    return;
  }

  window.speechSynthesis.cancel();

  // Get available voices
  const voices = window.speechSynthesis.getVoices();

  // Select the best voice (less robotic)
  const preferredVoices = [
    'Google UK English Female',
    'Microsoft Zira Desktop',
    'Alex', // macOS
    'Samantha', // macOS
    'Google US English'
  ];

  let selectedVoice = voices.find(voice =>
    preferredVoices.some(pv => voice.name.includes(pv))
  ) || voices[0];

  // Pre-process text for better speech
  const processedText = preprocessText(text);

  const utterance = new SpeechSynthesisUtterance(processedText);
  utterance.voice = selectedVoice;
  utterance.rate = 0.85; // Slightly slower
  utterance.pitch = 1.1; // Slightly higher
  utterance.volume = 1.0;

  window.speechSynthesis.speak(utterance);
}

function preprocessText(text: string): string {
  return text
    // Add pauses for punctuation
    .replace(/\./g, '. ')
    .replace(/!/g, '! ')
    .replace(/\?/g, '? ')
    .replace(/,/g, ', ')
    // Expand common abbreviations
    .replace(/\bMr\./g, 'Mister')
    .replace(/\bMrs\./g, 'Missus')
    .replace(/\bDr\./g, 'Doctor')
    // Add emphasis markers (some engines support SSML)
    .trim();
}
```

### Option 3: Hybrid Implementation

```typescript
// src/lib/tts/hybrid.ts
import { generateSpeech as elevenLabsSpeak } from './elevenlabs';
import { speakTextImproved as webSpeechSpeak } from './web-speech-improved';

export async function speakText(
  text: string,
  usePremium: boolean = false
): Promise<void> {
  const charCount = text.length;

  // Use premium TTS for:
  // - Explicitly requested premium
  // - Long content (>500 chars)
  // - Admin/featured stories
  const shouldUsePremium = usePremium || charCount > 500;

  if (shouldUsePremium) {
    try {
      const audioBlob = await elevenLabsSpeak(text);
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      await audio.play();
    } catch (error) {
      console.warn('Premium TTS failed, falling back to Web Speech API');
      webSpeechSpeak(text);
    }
  } else {
    webSpeechSpeak(text);
  }
}
```

---

## Recommended Implementation Plan

### Phase 1: Quick Win (Week 1)
✅ Improve current Web Speech API
- Select better voices
- Tune parameters (rate, pitch)
- Pre-process text

**Cost:** $0
**Impact:** 20-30% better quality
**Effort:** 2-4 hours

### Phase 2: Free Tier Testing (Week 2-3)
✅ Implement Unreal Speech or ElevenLabs
- Create API route
- Add toggle in admin (premium TTS on/off)
- Test with real stories

**Cost:** $0 (free tier)
**Impact:** 200% better quality for selected stories
**Effort:** 4-8 hours

### Phase 3: Hybrid System (Week 4)
✅ Implement adaptive TTS selection
- Auto-select based on story length/importance
- Fallback mechanism
- Usage tracking

**Cost:** $0-5/month
**Impact:** Best balance of quality and cost
**Effort:** 6-12 hours

---

## My Recommendation for Centre404

### 🎯 Go with: **Hybrid Approach (Unreal Speech + Web Speech API)**

**Reasoning:**
1. **Free tier is huge** (250k chars/month = ~300 stories)
2. **Natural voices** for important content
3. **Web Speech fallback** for high volume
4. **Cost-effective** for non-profit
5. **Gradual migration** - test before committing
6. **Accessibility maintained** - fallback ensures no one is excluded

**Implementation Strategy:**
```typescript
// Use Unreal Speech for:
- Featured/published magazine stories
- Admin-approved content
- Stories >200 characters

// Use improved Web Speech API for:
- Quick previews
- Short snippets
- Fallback when quota exceeded
```

---

## Next Steps

1. **Sign up for free accounts:**
   - [Unreal Speech](https://unrealspeech.com) - 250k chars/month
   - [ElevenLabs](https://elevenlabs.io) - 10k chars/month (backup)

2. **Implement Phase 1** (improved Web Speech API)
   - Immediate improvement, no cost

3. **Test premium voices** with real Centre404 stories
   - Get user feedback on naturalness
   - Compare Unreal Speech vs ElevenLabs

4. **Deploy hybrid system** if feedback is positive
   - Monitor usage
   - Track costs
   - Adjust thresholds as needed

---

## Questions to Consider

1. **Average story length?** (affects character usage)
2. **Stories per month?** (affects quota planning)
3. **Most important stories?** (should get premium TTS)
4. **User preference?** (let users choose voice?)
5. **Offline requirement?** (affects implementation approach)

---

## Additional Resources

- [ElevenLabs API Docs](https://elevenlabs.io/docs)
- [Unreal Speech API Docs](https://docs.unrealspeech.com)
- [OpenAI TTS API Docs](https://platform.openai.com/docs/guides/text-to-speech)
- [Web Speech API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
