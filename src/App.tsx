import { useState } from 'react'
import { Play, Pause, StopCircle } from 'lucide-react'

const GENRES = ['cinematic', 'fantasy', 'mystery', 'romance', 'horror', 'adventure', 'bedtime story', 'travelogue']

interface Story {
  title: string
  mood: string
  story: string
}

export default function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [selectedGenre, setSelectedGenre] = useState('cinematic')
  const [loading, setLoading] = useState(false)
  const [story, setStory] = useState<Story | null>(null)
  const [error, setError] = useState('')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setError('')
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleDragDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file)
      setError('')
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const generateStory = async () => {
    if (!selectedFile) {
      setError('Please select an image first')
      return
    }

    setLoading(true)
    setError('')
    setStory(null)

    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string).split(',')[1]
        const mimeType = selectedFile.type

        // Call Vercel API route
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64, mimeType, genre: selectedGenre }),
        })

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`)
        }

        const data = await response.json()
        setStory(data)
        setLoading(false)
      }
      reader.readAsDataURL(selectedFile)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate story')
      setLoading(false)
    }
  }

  const playNarration = () => {
    if (!story || !synth) return
    
    if (isSpeaking) {
      synth.cancel()
      setIsSpeaking(false)
      return
    }

    const utterance = new SpeechSynthesisUtterance(story.story)
    utterance.rate = 0.9
    utterance.pitch = 1
    
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    
    setIsSpeaking(true)
    synth.speak(utterance)
  }

  const stopNarration = () => {
    if (synth) {
      synth.cancel()
      setIsSpeaking(false)
    }
  }

  return (
    <div className="container">
      <div className="header">
        <h1>✨ PixelTale</h1>
        <p>Transform your photos into immersive AI-narrated stories</p>
      </div>

      <div className="card">
        {/* Image Upload */}
        <label
          className={`upload-area ${preview ? 'dragging' : ''}`}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={(e) => e.preventDefault()}
          onDrop={handleDragDrop}
        >
          {preview ? (
            <img src={preview} alt="preview" className="preview-image" />
          ) : (
            <div>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📸</div>
              <p>Drag and drop an image or click to select</p>
            </div>
          )}
          <input type="file" accept="image/*" onChange={handleFileSelect} />
        </label>

        {/* Genre Selection */}
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ marginBottom: '0.8rem', color: '#ffd700' }}>Choose a genre:</p>
          <div className="genres">
            {GENRES.map((genre) => (
              <button
                key={genre}
                className={`genre-btn ${selectedGenre === genre ? 'active' : ''}`}
                onClick={() => setSelectedGenre(genre)}
              >
                {genre.charAt(0).toUpperCase() + genre.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button className="button" onClick={generateStory} disabled={!selectedFile || loading}>
          {loading ? (
            <>
              <div className="spinner" />
              Generating Story...
            </>
          ) : (
            '✨ Generate Story'
          )}
        </button>

        {/* Error Message */}
        {error && <div className="error">{error}</div>}

        {/* Story Display */}
        {story && (
          <div className="story-display">
            <div className="story-title">{story.title}</div>
            <div className="story-mood">Mood: {story.mood}</div>
            <div className="story-text">{story.story}</div>
            <div className="narrate-controls">
              <button className="icon-btn" onClick={playNarration}>
                {isSpeaking ? <Pause size={20} /> : <Play size={20} />}
                {isSpeaking ? 'Pause' : 'Listen'}
              </button>
              <button className="icon-btn" onClick={stopNarration}>
                <StopCircle size={20} />
                Stop
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
