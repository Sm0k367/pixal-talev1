import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Upload, Sparkles, Play, Pause, Volume2, Music, Heart, Zap } from 'lucide-react'
import { useStore, Story } from './store'
import Header from './components/Header'
import UploadZone from './components/UploadZone'
import GenreSelector from './components/GenreSelector'
import VoiceSelector from './components/VoiceSelector'
import StoryDisplay from './components/StoryDisplay'
import History from './components/History'

const GENRES = [
  { id: 'cinematic', name: 'Cinematic', emoji: '🎬', color: 'from-cyan-500 to-blue-500' },
  { id: 'fantasy', name: 'Fantasy', emoji: '⚔️', color: 'from-purple-500 to-pink-500' },
  { id: 'mystery', name: 'Mystery', emoji: '🔍', color: 'from-gray-500 to-slate-700' },
  { id: 'romance', name: 'Romance', emoji: '💕', color: 'from-pink-500 to-red-500' },
  { id: 'horror', name: 'Horror', emoji: '👻', color: 'from-red-600 to-black' },
  { id: 'adventure', name: 'Adventure', emoji: '🏔️', color: 'from-orange-500 to-yellow-500' },
  { id: 'bedtime', name: 'Bedtime', emoji: '🌙', color: 'from-indigo-500 to-purple-500' },
  { id: 'scifi', name: 'Sci-Fi', emoji: '🚀', color: 'from-cyan-500 to-teal-500' },
]

const VOICES = [
  { id: 'nova', name: 'Nova', description: 'Bright & energetic', color: 'cyan' },
  { id: 'echo', name: 'Echo', description: 'Deep & mysterious', color: 'purple' },
  { id: 'luna', name: 'Luna', description: 'Soft & dreamy', color: 'pink' },
  { id: 'atlas', name: 'Atlas', description: 'Bold & powerful', color: 'amber' },
]

export default function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const { selectedGenre, selectedVoice, isLoading, currentStory, history } = useStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const generateStory = async () => {
    if (!selectedFile) return
    
    useStore.setState({ isLoading: true })
    
    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string).split(',')[1]
        
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64,
            mimeType: selectedFile.type,
            genre: selectedGenre,
          }),
        })

        if (!response.ok) throw new Error('Generation failed')
        
        const data = await response.json()
        const story: Story = {
          id: Date.now().toString(),
          ...data,
          genre: selectedGenre,
          imageUrl: preview,
          createdAt: Date.now(),
        }
        
        useStore.setState({ currentStory: story })
        useStore.getState().addToHistory(story)
      }
      reader.readAsDataURL(selectedFile)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      useStore.setState({ isLoading: false })
    }
  }

  const playNarration = () => {
    if (!currentStory) return
    
    const utterance = new SpeechSynthesisUtterance(currentStory.story)
    
    const voiceMap: Record<string, { rate: number; pitch: number }> = {
      nova: { rate: 1.1, pitch: 1.2 },
      echo: { rate: 0.9, pitch: 0.8 },
      luna: { rate: 0.95, pitch: 1.0 },
      atlas: { rate: 1.0, pitch: 0.9 },
    }
    
    const settings = voiceMap[selectedVoice] || voiceMap.nova
    utterance.rate = settings.rate
    utterance.pitch = settings.pitch
    utterance.volume = 1
    
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    
    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    } else {
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(utterance)
      setIsSpeaking(true)
    }
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-cyan/10 border border-accent-cyan/30 mb-4">
                <Sparkles className="w-4 h-4 text-accent-cyan" />
                <span className="text-sm font-medium text-accent-cyan">AI-Powered Storytelling</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-display font-bold mb-4 bg-gradient-to-r from-accent-cyan via-accent-purple to-accent-pink bg-clip-text text-transparent">
                Transform Photos Into Stories
              </h1>
              <p className="text-xl text-white/60 max-w-2xl mx-auto">
                Upload any image and let AI weave immersive narratives tailored to your chosen genre
              </p>
            </motion.div>

            {/* Upload Zone */}
            <UploadZone
              preview={preview}
              onFileSelect={handleFileSelect}
              isLoading={isLoading}
            />

            {/* Genre & Voice Selection */}
            {selectedFile && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-8"
              >
                <GenreSelector genres={GENRES} />
                <VoiceSelector voices={VOICES} />

                {/* Generate Button */}
                <motion.button
                  onClick={generateStory}
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full btn-primary group relative overflow-hidden text-lg py-4"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-1000" />
                  <div className="flex items-center justify-center gap-3 relative z-10">
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-dark-950/30 border-t-dark-950 rounded-full animate-spin" />
                        <span>Crafting Your Story...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        <span>Generate Story</span>
                      </>
                    )}
                  </div>
                </motion.button>
              </motion.div>
            )}

            {/* Story Display */}
            {currentStory && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <StoryDisplay story={currentStory} />
                
                {/* Narration Controls */}
                <motion.div
                  className="flex gap-4 mt-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <button
                    onClick={playNarration}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-lg bg-gradient-to-r from-accent-cyan to-accent-purple text-dark-950 font-semibold hover:shadow-lg hover:shadow-accent-cyan/50 transition-all"
                  >
                    {isSpeaking ? (
                      <>
                        <Pause className="w-5 h-5" />
                        <span>Pause Narration</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5" />
                        <span>Listen to Story</span>
                      </>
                    )}
                  </button>
                </motion.div>
              </motion.div>
            )}
          </div>

          {/* Sidebar - History */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <History stories={history} />
          </motion.div>
        </div>
      </main>
    </div>
  )
}
