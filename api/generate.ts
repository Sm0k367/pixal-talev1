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
}

// Best Groq models for each mode
const MODEL_CONFIG: Record<string, { model: string; temperature: number; max_tokens: number }> = {
  story: {
    model: 'llama-3.1-70b-versatile',      // Best for creative storytelling
    temperature: 0.95,                      // High creativity
    max_tokens: 400,
  },
  lifebook: {
    model: 'llama-3.1-70b-versatile',      // Best for personal narrative
    temperature: 0.8,                       // Balanced creativity + coherence
    max_tokens: 500,
  },
  comics: {
    model: 'mixtral-8x7b-32768',           // Best for punchy dialogue
    temperature: 0.85,                      // Creative but focused
    max_tokens: 300,
  },
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { imageBase64, mimeType, mode = 'story', genre, prompt: customPrompt } = req.body
    const apiKey = process.env.GROQ_API_KEY

    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' })
    }

    if (!imageBase64 || !mimeType) {
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

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
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
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error(`Groq API Error (${config.model}):`, error)
      return res.status(response.status).json({ 
        error: `Generation failed: ${response.statusText}`,
        details: error 
      })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      return res.status(500).json({ error: 'No content generated' })
    }

    try {
      const parsed = JSON.parse(content)
      return res.status(200).json(parsed)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      return res.status(200).json({
        title: 'Generated Content',
        mood: 'mysterious',
        story: content,
        content: content,
      })
    }
  } catch (error) {
    console.error('Handler error:', error)
    return res.status(500).json({ 
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
