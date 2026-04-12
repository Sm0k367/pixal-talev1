import { VercelRequest, VercelResponse } from '@vercel/node'

const GENRE_PROMPTS: Record<string, string> = {
  cinematic: `You are an acclaimed screenwriter and visual storyteller. Analyze this image and craft a vivid, cinematic opening (120-150 words) that could open an Oscar-nominated film. Focus on lighting, mood, and atmosphere. Return ONLY JSON: { "title": "a 3-5 word evocative title", "mood": "one word", "story": "text" }`,
  
  fantasy: `You are a legendary fantasy author who has written epic sagas. This image is the threshold to an ancient world. Write a mystical, otherworldly opening (120-150 words) filled with magic and wonder. Return ONLY JSON: { "title": "a 3-5 word epic title", "mood": "one word", "story": "text" }`,
  
  mystery: `You are a master of psychological thrillers and noir mysteries. This image holds a secret. Write a gripping, tension-filled opening (120-150 words) that makes readers desperate to uncover the truth. Return ONLY JSON: { "title": "a 3-5 word mysterious title", "mood": "one word", "story": "text" }`,
  
  romance: `You are a bestselling romance author known for sweeping, emotional narratives. This image captures a moment of connection. Write a passionate, heart-stirring opening (120-150 words). Return ONLY JSON: { "title": "a 3-5 word romantic title", "mood": "one word", "story": "text" }`,
  
  horror: `You are a master of psychological horror and gothic literature. This image contains something unsettling. Write a chilling, atmospheric opening (120-150 words) that fills readers with dread. Return ONLY JSON: { "title": "a 3-5 word terrifying title", "mood": "one word", "story": "text" }`,
  
  adventure: `You are an adventure novelist who writes breathtaking tales of discovery. This image marks the beginning of an epic journey. Write an exhilarating opening (120-150 words) filled with danger and wonder. Return ONLY JSON: { "title": "a 3-5 word adventure title", "mood": "one word", "story": "text" }`,
  
  bedtime: `You are a beloved children's author creating magical bedtime tales. This image is from a gentle, enchanting dream. Write a soothing, imaginative opening (100-130 words) perfect for dreamers. Return ONLY JSON: { "title": "a 3-5 word whimsical title", "mood": "one word", "story": "text" }`,
  
  scifi: `You are a visionary sci-fi author exploring the future. This image is from a world beyond our reality. Write a mind-bending, futuristic opening (120-150 words) that challenges perception. Return ONLY JSON: { "title": "a 3-5 word futuristic title", "mood": "one word", "story": "text" }`,
}

const MODE_PROMPTS: Record<string, (customPrompt?: string) => string> = {
  lifebook: (customPrompt?: string) => customPrompt || `Write a personal memoir chapter of 150-200 words. Include reflection, emotion, and vivid sensory details. Return ONLY JSON: { "title": "chapter title", "mood": "one word emotion", "story": "text", "content": "text" }`,
  
  comics: (customPrompt?: string) => customPrompt || `Write witty comic book dialogue and narration for this panel (50-80 words). Keep it punchy and visual. Return ONLY JSON: { "title": "panel title", "mood": "one word tone", "story": "dialogue", "content": "narration" }`,
  
  'family-lore': (customPrompt?: string) => customPrompt || `You are a master genealogist and family historian. Based on this image, craft a multi-generational family saga (150-200 words). Include ancestors, their stories, and connections through time. Return ONLY JSON: { "title": "family saga title", "saga": "text", "mood": "one word" }`,
  
  bedtime: (customPrompt?: string) => customPrompt || `You are a beloved children's author specializing in soothing bedtime tales. Craft a gentle, imaginative story (120-150 words) perfect for young dreamers, based on this image. Use soft language and magical imagery. Return ONLY JSON: { "title": "bedtime story title", "story": "text", "mood": "peaceful", "ageGroup": "4-8 years" }`,
  
  songwriter: (customPrompt?: string) => customPrompt || `You are a talented songwriter and lyricist. Based on this image, compose song lyrics (150-200 words) with emotion and melody. Include verses and chorus. Identify a fitting music genre. Return ONLY JSON: { "title": "song title", "lyrics": "text", "genre": "genre name", "mood": "one word emotion" }`,
  
  rpg: (customPrompt?: string) => customPrompt || `You are a master Dungeon Master and world-builder. Based on this image, create a rich fantasy world description (150-200 words) with geography, culture, magic system, and adventure hooks. Return ONLY JSON: { "title": "world name", "worldBuilding": "text", "description": "short summary", "mood": "one word tone" }`,
  
  'memory-tapestry': (customPrompt?: string) => customPrompt || `You are a memory curator and narrative weaver. Based on this image, write a deeply personal memory reflection (100-150 words) that connects to universal human experiences. Suggest 2-3 theme tags. Return ONLY JSON: { "title": "memory title", "content": "text", "tags": ["tag1", "tag2"] }`,
  
  'time-capsule': (customPrompt?: string) => customPrompt || `You are a time capsule creator. Based on this image, write a message to the future (100-150 words) that captures a moment in time. Include hopes, observations, and wisdom to preserve. Return ONLY JSON: { "title": "capsule title", "content": "text" }`,
  
  'therapy-journal': (customPrompt?: string) => customPrompt || `You are a compassionate therapeutic journaling guide. Based on this image, prompt a healing reflection (120-150 words) that encourages emotional processing and growth. Use warm, non-judgmental language. Return ONLY JSON: { "content": "journaling prompt + reflection", "mood": "emotional tone", "title": "reflection title" }`,
}

// Best Groq models for each mode
// IMPORTANT: Only meta-llama/llama-4-scout-17b-16e-instruct supports vision (images)
// llama-3.3-70b-versatile does NOT support image inputs
const MODEL_CONFIG: Record<string, { model: string; temperature: number; max_tokens: number }> = {
  story: {
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',  // Vision-capable model for image analysis
    temperature: 0.95,                                    // High creativity
    max_tokens: 400,
  },
  lifebook: {
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',  // Vision-capable model for image analysis
    temperature: 0.8,                                     // Balanced creativity + coherence
    max_tokens: 500,
  },
  comics: {
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',  // Vision-capable model for dialogue generation from images
    temperature: 0.85,                                    // Creative but focused
    max_tokens: 300,
  },
  'family-lore': {
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',  // High creativity for multi-generational narratives
    temperature: 0.88,
    max_tokens: 500,
  },
  bedtime: {
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',  // Gentle, soothing narratives
    temperature: 0.75,
    max_tokens: 400,
  },
  songwriter: {
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',  // Lyrical creativity
    temperature: 0.9,
    max_tokens: 500,
  },
  rpg: {
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',  // Detailed world-building
    temperature: 0.85,
    max_tokens: 500,
  },
  'memory-tapestry': {
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',  // Emotional, introspective
    temperature: 0.8,
    max_tokens: 350,
  },
  'time-capsule': {
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',  // Reflective, timeless
    temperature: 0.82,
    max_tokens: 350,
  },
  'therapy-journal': {
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',  // Therapeutic, compassionate
    temperature: 0.78,
    max_tokens: 400,
  },
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { imageBase64, mimeType, mode = 'story', genre, prompt: customPrompt } = req.body
    const apiKey = process.env.GROQ_API_KEY

    // Log request details for debugging
    console.log('=== GROQ API Handler ===')
    console.log(`Mode: ${mode}, Genre: ${genre}`)
    console.log(`Image size: ${imageBase64?.length || 0} bytes`)
    console.log(`MIME type: ${mimeType}`)
    console.log(`API key configured: ${!!apiKey}`)

    if (!apiKey) {
      console.error('ERROR: GROQ_API_KEY not configured in environment')
      return res.status(500).json({ error: 'API key not configured' })
    }

    if (!imageBase64 || !mimeType) {
      console.error('ERROR: Missing image data in request body')
      return res.status(400).json({ error: 'Missing image data' })
    }

    let prompt: string
    
    if (mode === 'story') {
      prompt = GENRE_PROMPTS[genre] || GENRE_PROMPTS.cinematic
    } else if (mode === 'lifebook' || mode === 'comics') {
      prompt = MODE_PROMPTS[mode]?.(customPrompt) || customPrompt || 'Generate appropriate content for this image.'
    } else {
      prompt = customPrompt || 'Generate appropriate content for this image.'
    }

    // Get optimized model config for this mode
    const config = MODEL_CONFIG[mode] || MODEL_CONFIG.story
    console.log(`Using model: ${config.model} (temp: ${config.temperature}, tokens: ${config.max_tokens})`)

    const requestBody = {
      model: config.model,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
          ],
        },
      ],
      temperature: config.temperature,
      max_tokens: config.max_tokens,
      response_format: { type: 'json_object' },
    }

    console.log(`Sending request to Groq API: ${config.model}`)
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    console.log(`Groq API response status: ${response.status} ${response.statusText}`)

    if (!response.ok) {
      const error = await response.text()
      console.error(`Groq API Error (${config.model}):`)
      console.error(`Status: ${response.status}`)
      console.error(`Response: ${error}`)
      return res.status(response.status).json({ 
        error: `Generation failed: ${response.statusText}`,
        details: error,
        model: config.model,
      })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      console.error('ERROR: No content in Groq response')
      console.error('Full response:', JSON.stringify(data))
      return res.status(500).json({ error: 'No content generated' })
    }

    console.log(`Generated content length: ${content.length} characters`)

    try {
      const parsed = JSON.parse(content)
      console.log('Successfully parsed JSON response')
      console.log(`Response keys: ${Object.keys(parsed).join(', ')}`)
      return res.status(200).json(parsed)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      console.error('Raw content:', content.substring(0, 200))
      return res.status(200).json({
        title: 'Generated Content',
        mood: 'mysterious',
        story: content,
        content: content,
      })
    }
  } catch (error) {
    console.error('=== Handler error ===')
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error)
    console.error('Error message:', error instanceof Error ? error.message : String(error))
    console.error('Stack:', error instanceof Error ? error.stack : 'N/A')
    return res.status(500).json({ 
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
