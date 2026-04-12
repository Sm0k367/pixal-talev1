import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Music, Play } from 'lucide-react'
import { useStore, Song } from '../store'
import UploadZone from '../components/UploadZone'

export default function SongwriterMode() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [songs, setSongs] = useState<Song[]>([])
  const [isPlaying, setIsPlaying] = useState(false)

  const { isLoading, addSong } = useStore()

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const generateSong = async () => {
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
            mode: 'songwriter',
          }),
        })

        if (!response.ok) throw new Error('Generation failed')

        const data = await response.json()
        const song: Song = {
          id: Date.now().toString(),
          title: data.title || 'Untitled Song',
          lyrics: data.lyrics,
          genre: data.genre || 'Indie',
          mood: data.mood || 'emotional',
          imageUrl: preview,
          createdAt: Date.now(),
        }

        setCurrentSong(song)
        setSongs([song, ...songs].slice(0, 10))
        addSong(song)
      }
      reader.readAsDataURL(selectedFile)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      useStore.setState({ isLoading: false })
    }
  }

  const playSongPreview = () => {
    if (!currentSong) return

    const utterance = new SpeechSynthesisUtterance(currentSong.lyrics)
    utterance.rate = 0.9
    utterance.pitch = 1.1
    utterance.onstart = () => setIsPlaying(true)
    utterance.onend = () => setIsPlaying(false)

    speechSynthesis.speak(utterance)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent flex items-center">
          <Music className="mr-3" size={40} />
          Songwriter
        </h1>
        <p className="text-gray-400 text-lg">
          Turn your photos into original songs with AI-generated lyrics
        </p>
      </motion.div>

      {/* Song Generator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 space-y-6"
      >
        {/* Upload */}
        <UploadZone 
          preview={preview}
          onFileSelect={handleFileSelect}
          isLoading={isLoading}
        />

        {/* Preview */}
        {preview && (
          <div className="relative rounded-lg overflow-hidden h-48 bg-dark-800">
            <img src={preview} alt="preview" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={generateSong}
          disabled={!selectedFile || isLoading}
          className="w-full px-4 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg font-bold text-white hover:shadow-lg hover:shadow-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
              Composing Song...
            </>
          ) : (
            <>
              <Sparkles className="mr-3" size={20} />
              Generate Song
            </>
          )}
        </button>
      </motion.div>

      {/* Current Song */}
      {currentSong && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 space-y-6"
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">{currentSong.title}</h2>
              <div className="flex gap-4 text-sm">
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/50">
                  {currentSong.genre}
                </span>
                <span className="px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full border border-teal-500/50">
                  {currentSong.mood}
                </span>
              </div>
            </div>
            <button
              onClick={playSongPreview}
              className={`p-3 rounded-full transition-all ${
                isPlaying
                  ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50'
                  : 'bg-emerald-500/20 border border-emerald-500/50 hover:bg-emerald-500/30'
              }`}
            >
              <Play size={20} className="text-white" />
            </button>
          </div>

          {currentSong.imageUrl && (
            <div className="relative rounded-lg overflow-hidden h-64 bg-dark-800">
              <img src={currentSong.imageUrl} alt={currentSong.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="bg-dark-800/50 p-6 rounded-lg border border-emerald-500/20">
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap font-serif text-lg">
              {currentSong.lyrics}
            </p>
          </div>
        </motion.div>
      )}

      {/* Song History */}
      {songs.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 space-y-4"
        >
          <h3 className="text-xl font-bold text-white">Your Compositions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {songs.slice(1).map((song) => (
              <motion.div
                key={song.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setCurrentSong(song)}
                className="p-4 bg-dark-800/50 rounded-lg border border-emerald-500/20 cursor-pointer hover:border-emerald-500/50 transition-all"
              >
                <p className="font-semibold text-white truncate">{song.title}</p>
                <p className="text-xs text-emerald-400 mt-1">{song.genre} • {song.mood}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
