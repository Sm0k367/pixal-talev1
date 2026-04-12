import { VercelRequest, VercelResponse } from '@vercel/node'

const GENRE_PROMPTS: Record<string, string> = {
  cinematic: `You are a master storyteller. Analyze this image and create a brief, vivid opening (100 words) for a cinematic story. Return JSON: { "title": "4 word title", "mood": "one word", "story": "opening" }`,
  fantasy: `Create a brief epic fantasy opening (100 words) for this image. Return JSON: { "title": "4 word title", "mood": "one word", "story": "opening" }`,
  mystery: `Create a brief mysterious story opening (100 words) for this image. Return JSON: { "title": "4 word title", "mood": "one word", "story": "opening" }`,
  romance: `Create a brief romantic story opening (100 words) for this image. Return JSON: { "title": "4 word title", "mood": "one word", "story": "opening" }`,
  horror: `Create a brief horror story opening (100 words) for this image. Return JSON: { "title": "4 word title", "mood": "one word", "story": "opening" }`,
  adventure: `Create a brief adventure story opening (100 words) for this image. Return JSON: { "title": "4 word title", "mood": "one word", "story": "opening" }`,
  'bedtime story': `Create a brief magical bedtime story (80 words) for this image. Return JSON: { "title": "4 word title", "mood": "one word", "story": "opening" }`,
  travelogue: `Create a brief travel story (100 words) for this image. Return JSON: { "title": "4 word title", "mood": "one word", "story": "opening" }`,
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { imageBase64, mimeType, genre } = req.body
    const apiKey = process.env.GROQ_API_KEY

    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' })
    }

    if (!imageBase64 || !mimeType) {
      return res.status(400).json({ error: 'Missing image data' })
    }

    const prompt = GENRE_PROMPTS[genre] || GENRE_PROMPTS['cinematic']

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
        temperature: 0.9,
        max_tokens: 300,
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
        title: 'Story',
        mood: 'mysterious',
        story: content,
      })
    }
  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({ error: 'Server error' })
  }
}
