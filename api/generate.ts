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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { imageBase64, mimeType, genre } = req.body
    const apiKey = process.env.GROQ_API_KEY

    if (!apiKey) {
      return res.status(500).json({ error: 'API configuration error' })
    }

    if (!imageBase64 || !mimeType) {
      return res.status(400).json({ error: 'Missing image data' })
    }

    const prompt = GENRE_PROMPTS[genre] || GENRE_PROMPTS.cinematic

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
            ],
          },
        ],
        temperature: 0.95,
        max_tokens: 350,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      return res.status(response.status).json({ error })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    try {
      const parsed = JSON.parse(content)
      return res.status(200).json(parsed)
    } catch {
      return res.status(200).json({
        title: 'Untitled Story',
        mood: 'mysterious',
        story: content,
      })
    }
  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({ error: 'Server error' })
  }
}
