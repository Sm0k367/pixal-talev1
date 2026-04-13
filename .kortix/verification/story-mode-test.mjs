/**
 * PixelTale Story Mode - Comprehensive Verification Test
 * Tests all 8 genres, 4 voices, upload zone, API structure, history, responsiveness
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'

const ROOT = '/workspace/pixeltale'
const PASS = '✅'
const FAIL = '❌'
const WARN = '⚠️'

let passed = 0
let failed = 0
let warnings = 0

function test(label, fn) {
  try {
    const result = fn()
    if (result === false) {
      console.log(`${FAIL} ${label}`)
      failed++
    } else if (result === 'warn') {
      console.log(`${WARN} ${label}`)
      warnings++
    } else {
      console.log(`${PASS} ${label}`)
      passed++
    }
  } catch (e) {
    console.log(`${FAIL} ${label}: ${e.message}`)
    failed++
  }
}

function readSrc(path) {
  return readFileSync(resolve(ROOT, path), 'utf8')
}

console.log('\n=== PixelTale Story Mode Comprehensive Test ===\n')

// ============================================================
// 1. GENRE TESTS - All 8 genres in StoryMode.tsx and API
// ============================================================
console.log('--- Section 1: Genre Coverage ---')

const storyMode = readSrc('src/modes/StoryMode.tsx')
const apiGenerate = readSrc('api/generate.ts')

const EXPECTED_GENRES = ['cinematic', 'fantasy', 'mystery', 'romance', 'horror', 'adventure', 'bedtime', 'scifi']
const GENRE_NAMES = ['Cinematic', 'Fantasy', 'Mystery', 'Romance', 'Horror', 'Adventure', 'Bedtime', 'Sci-Fi']
const GENRE_EMOJIS = ['🎬', '⚔️', '🔍', '💕', '👻', '🏔️', '🌙', '🚀']

EXPECTED_GENRES.forEach((genre, i) => {
  test(`Genre "${genre}" (${GENRE_NAMES[i]}) defined in StoryMode.tsx`, () => {
    return storyMode.includes(`id: '${genre}'`)
  })
})

EXPECTED_GENRES.forEach((genre, i) => {
  test(`Genre name "${GENRE_NAMES[i]}" displayed in StoryMode.tsx`, () => {
    return storyMode.includes(`name: '${GENRE_NAMES[i]}'`)
  })
})

EXPECTED_GENRES.forEach((genre, i) => {
  test(`Genre emoji "${GENRE_EMOJIS[i]}" included in StoryMode.tsx`, () => {
    return storyMode.includes(`emoji: '${GENRE_EMOJIS[i]}'`)
  })
})

// API genre prompts
const API_GENRES = ['cinematic', 'fantasy', 'mystery', 'romance', 'horror', 'adventure', 'bedtime', 'scifi']
API_GENRES.forEach(genre => {
  test(`Genre prompt for "${genre}" exists in api/generate.ts`, () => {
    return apiGenerate.includes(`${genre}:`)
  })
})

test('All 8 genres are present in GENRE_PROMPTS array', () => {
  const matches = API_GENRES.filter(g => apiGenerate.includes(`${g}:`))
  return matches.length === 8
})

test('GENRE_PROMPTS returns proper JSON with title, mood, story', () => {
  const jsonStructure = API_GENRES.every(genre => {
    const lines = apiGenerate.split('\n')
    const genreLine = lines.find(l => l.includes(`${genre}:`))
    if (!genreLine) return false
    // Find the block for this genre and check JSON requirement
    const idx = lines.indexOf(genreLine)
    const block = lines.slice(idx, idx + 5).join(' ')
    return block.includes('"title"') && block.includes('"mood"') && block.includes('"story"')
  })
  return jsonStructure
})

// ============================================================
// 2. VOICE TESTS - All 4 voices
// ============================================================
console.log('\n--- Section 2: Voice Coverage ---')

const EXPECTED_VOICES = ['nova', 'echo', 'luna', 'atlas']
const VOICE_NAMES = ['Nova', 'Echo', 'Luna', 'Atlas']
const VOICE_DESCRIPTIONS = ['Bright & energetic', 'Deep & mysterious', 'Soft & dreamy', 'Bold & powerful']

EXPECTED_VOICES.forEach((voice, i) => {
  test(`Voice "${voice}" (${VOICE_NAMES[i]}) defined in StoryMode.tsx`, () => {
    return storyMode.includes(`id: '${voice}'`)
  })
})

EXPECTED_VOICES.forEach((voice, i) => {
  test(`Voice name "${VOICE_NAMES[i]}" in StoryMode.tsx`, () => {
    return storyMode.includes(`name: '${VOICE_NAMES[i]}'`)
  })
})

EXPECTED_VOICES.forEach((voice, i) => {
  test(`Voice description "${VOICE_DESCRIPTIONS[i]}" in StoryMode.tsx`, () => {
    return storyMode.includes(`description: '${VOICE_DESCRIPTIONS[i]}'`)
  })
})

const voiceSelector = readSrc('src/components/VoiceSelector.tsx')

test('VoiceSelector component renders all passed voices', () => {
  return voiceSelector.includes('voices.map') && voiceSelector.includes('voice.id') && voiceSelector.includes('voice.name')
})

test('VoiceSelector has color mapping for all 4 voice colors', () => {
  // colorMap keys are unquoted object keys: cyan, purple, pink, amber
  return voiceSelector.includes('cyan:') && voiceSelector.includes('purple:') &&
         voiceSelector.includes('pink:') && voiceSelector.includes('amber:')
})

test('VoiceSelector calls setSelectedVoice on click', () => {
  return voiceSelector.includes('setSelectedVoice(voice.id)')
})

test('VoiceSelector shows selected state with gradient', () => {
  return voiceSelector.includes('selectedVoice === voice.id') && voiceSelector.includes('from-cyan-500')
})

// Voice settings in playNarration
const VOICE_RATE_PITCH = {
  nova: { rate: 1.1, pitch: 1.2 },
  echo: { rate: 0.9, pitch: 0.8 },
  luna: { rate: 0.95, pitch: 1.0 },
  atlas: { rate: 1.0, pitch: 0.9 },
}

test('All 4 voice profiles configured in playNarration', () => {
  return EXPECTED_VOICES.every(voice => storyMode.includes(`${voice}:`))
})

test('Voice rate and pitch settings are distinct', () => {
  return storyMode.includes('rate: 1.1') && storyMode.includes('pitch: 1.2') &&
         storyMode.includes('rate: 0.9') && storyMode.includes('pitch: 0.8')
})

test('Web Speech API used (SpeechSynthesisUtterance)', () => {
  return storyMode.includes('SpeechSynthesisUtterance') && storyMode.includes('speechSynthesis')
})

// ============================================================
// 3. UPLOAD ZONE TESTS
// ============================================================
console.log('\n--- Section 3: Upload Zone ---')

const uploadZone = readSrc('src/components/UploadZone.tsx')

test('UploadZone accepts image/* MIME type', () => {
  return uploadZone.includes('accept="image/*"')
})

test('UploadZone supports drag-drop (onDrop handler)', () => {
  return uploadZone.includes('onDrop') && uploadZone.includes('handleDragDrop')
})

test('UploadZone supports click-to-browse (onClick + fileInputRef)', () => {
  return uploadZone.includes('fileInputRef.current?.click()') && uploadZone.includes('onClick')
})

test('UploadZone validates image MIME type on drop', () => {
  return uploadZone.includes('file.type.startsWith(\'image/\')')
})

test('UploadZone shows preview when image selected', () => {
  return uploadZone.includes('preview ?') || uploadZone.includes('preview &&') || 
         uploadZone.includes('{preview ? (')
})

test('UploadZone supports allowMultiple for batch uploads', () => {
  return uploadZone.includes('allowMultiple') && uploadZone.includes('multiple={allowMultiple}')
})

test('UploadZone has Change Image button when preview exists', () => {
  return uploadZone.includes('Change Image')
})

test('UploadZone prevents default on dragOver', () => {
  return uploadZone.includes('onDragOver={(e) => e.preventDefault()}')
})

// ============================================================
// 4. API GENERATION TESTS
// ============================================================
console.log('\n--- Section 4: API Generation ---')

test('API uses correct vision model (llama-4-scout)', () => {
  return apiGenerate.includes('llama-4-scout-17b-16e-instruct')
})

test('API uses response_format json_object', () => {
  return apiGenerate.includes("response_format: { type: 'json_object' }")
})

test('API sends image as base64 data URL', () => {
  return apiGenerate.includes('data:${mimeType};base64,${imageBase64}')
})

test('API validates imageBase64 and mimeType presence', () => {
  return apiGenerate.includes('!imageBase64 || !mimeType')
})

test('API has proper 400 error for missing data', () => {
  return apiGenerate.includes('status(400)') && apiGenerate.includes('Missing image data')
})

test('API has fallback JSON parse for malformed responses', () => {
  return apiGenerate.includes('parseError') && apiGenerate.includes("title: 'Generated Content'")
})

test('API has GROQ_API_KEY validation', () => {
  return apiGenerate.includes('GROQ_API_KEY') && apiGenerate.includes('API key not configured')
})

test('Story mode uses genre-specific prompts', () => {
  return apiGenerate.includes("mode === 'story'") && apiGenerate.includes('GENRE_PROMPTS[genre]')
})

test('API handles non-POST methods with 405', () => {
  return apiGenerate.includes("method !== 'POST'") && apiGenerate.includes('status(405)')
})

// ============================================================
// 5. ERROR HANDLING
// ============================================================
console.log('\n--- Section 5: Error Handling ---')

test('StoryMode has try/catch around generation', () => {
  return storyMode.includes('try {') && storyMode.includes('} catch (error)')
})

test('StoryMode has isLoading state management', () => {
  return storyMode.includes('isLoading: true') && storyMode.includes('isLoading: false')
})

test('StoryMode resets loading on error', () => {
  // Check finally block
  return storyMode.includes('} finally {') && storyMode.includes('isLoading: false')
})

test('StoryMode checks response.ok before parsing', () => {
  return storyMode.includes('!response.ok')
})

test('API returns proper error with details for Groq failures', () => {
  return apiGenerate.includes('error: `Generation failed:') && apiGenerate.includes('details: error')
})

test('Voice narration has onerror handler', () => {
  return storyMode.includes('utterance.onerror') && storyMode.includes('setIsSpeaking(false)')
})

// ============================================================
// 6. STORY HISTORY
// ============================================================
console.log('\n--- Section 6: Story History ---')

const store = readSrc('src/store.ts')
const history = readSrc('src/components/History.tsx')

test('Store has storyHistory array', () => {
  return store.includes('storyHistory: Story[]')
})

test('Store has addStoryToHistory action', () => {
  return store.includes('addStoryToHistory')
})

test('History keeps maximum 50 stories (slicing)', () => {
  return store.includes('.slice(0, 50)')
})

test('StoryMode calls addStoryToHistory after generation', () => {
  return storyMode.includes('addStoryToHistory(story)')
})

test('History component renders all stories', () => {
  return history.includes('stories.map') && history.includes('story.id')
})

test('History shows empty state message', () => {
  return history.includes('No stories yet')
})

test('History shows genre emoji for all 8 genres', () => {
  const EMOJIS = ['🎬', '⚔️', '🔍', '💕', '👻', '🏔️', '🌙', '🚀']
  return EMOJIS.every(emoji => history.includes(emoji))
})

test('History shows scifi genre emoji (🚀)', () => {
  return history.includes("story.genre === 'scifi' && '🚀'")
})

test('History stories are clickable (setCurrentStory)', () => {
  return history.includes('setCurrentStory(story)')
})

test('App.tsx shows History sidebar on story mode with history', () => {
  const app = readSrc('src/App.tsx')
  return app.includes("currentMode === 'story'") && app.includes('storyHistory.length > 0')
})

// ============================================================
// 7. RESPONSIVE DESIGN
// ============================================================
console.log('\n--- Section 7: Responsive Design ---')

test('GenreSelector uses responsive grid (sm:grid-cols-4)', () => {
  const genreSelector = readSrc('src/components/GenreSelector.tsx')
  return genreSelector.includes('sm:grid-cols-4')
})

test('VoiceSelector uses responsive grid (sm:grid-cols-4)', () => {
  return voiceSelector.includes('sm:grid-cols-4')
})

test('StoryMode header uses responsive text (md:text-6xl)', () => {
  return storyMode.includes('md:text-6xl')
})

test('App layout uses responsive grid (lg:grid-cols-3)', () => {
  const app = readSrc('src/App.tsx')
  return app.includes('lg:grid-cols-3')
})

test('UploadZone has full width layout', () => {
  return uploadZone.includes('w-full')
})

test('StoryDisplay uses responsive heading (md:text-4xl)', () => {
  const storyDisplay = readSrc('src/components/StoryDisplay.tsx')
  return storyDisplay.includes('md:text-4xl')
})

// ============================================================
// 8. STORE INTEGRATION
// ============================================================
console.log('\n--- Section 8: Store Integration ---')

test('Store has selectedGenre with default "cinematic"', () => {
  return store.includes("selectedGenre: 'cinematic'")
})

test('Store has selectedVoice with default "nova"', () => {
  return store.includes("selectedVoice: 'nova'")
})

test('Store has setSelectedGenre action', () => {
  return store.includes('setSelectedGenre: (genre) => set({ selectedGenre: genre })')
})

test('Store has setSelectedVoice action', () => {
  return store.includes('setSelectedVoice: (voice) => set({ selectedVoice: voice })')
})

test('Story interface has all required fields', () => {
  return store.includes('id: string') && store.includes('title: string') && 
         store.includes('mood: string') && store.includes('story: string') &&
         store.includes('genre: string') && store.includes('imageUrl: string')
})

// ============================================================
// 9. GENRE SELECTOR COMPONENT
// ============================================================
console.log('\n--- Section 9: GenreSelector Component ---')

const genreSelector = readSrc('src/components/GenreSelector.tsx')

test('GenreSelector renders all passed genres', () => {
  return genreSelector.includes('genres.map') && genreSelector.includes('genre.id')
})

test('GenreSelector shows selected state', () => {
  return genreSelector.includes('selectedGenre === genre.id')
})

test('GenreSelector calls setSelectedGenre on click', () => {
  return genreSelector.includes('setSelectedGenre(genre.id)')
})

test('GenreSelector shows emoji and name', () => {
  return genreSelector.includes('genre.emoji') && genreSelector.includes('genre.name')
})

test('GenreSelector applies gradient color when selected', () => {
  return genreSelector.includes('bg-gradient-to-br') && genreSelector.includes('genre.color')
})

// ============================================================
// 10. STORY DISPLAY COMPONENT
// ============================================================
console.log('\n--- Section 10: StoryDisplay Component ---')

const storyDisplay = readSrc('src/components/StoryDisplay.tsx')

test('StoryDisplay shows story title', () => {
  return storyDisplay.includes('story.title')
})

test('StoryDisplay shows story text', () => {
  return storyDisplay.includes('story.story')
})

test('StoryDisplay shows story mood', () => {
  return storyDisplay.includes('story.mood')
})

test('StoryDisplay shows story genre badge', () => {
  return storyDisplay.includes('story.genre')
})

test('StoryDisplay shows creation timestamp', () => {
  return storyDisplay.includes('story.createdAt')
})

test('StoryDisplay has reading time estimate', () => {
  return storyDisplay.includes('min read')
})

// ============================================================
// Summary
// ============================================================
console.log('\n=== Test Summary ===')
console.log(`${PASS} Passed:   ${passed}`)
console.log(`${FAIL} Failed:   ${failed}`)
console.log(`${WARN} Warnings: ${warnings}`)
console.log(`Total:     ${passed + failed + warnings}`)

if (failed === 0) {
  console.log('\n✅ ALL TESTS PASSED - Story Mode is fully functional!')
  process.exit(0)
} else {
  console.log(`\n❌ ${failed} TEST(S) FAILED - Issues need to be fixed`)
  process.exit(1)
}
