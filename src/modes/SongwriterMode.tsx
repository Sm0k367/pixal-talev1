import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Music, Play, Pause, Square, Volume2, VolumeX, Edit3, Trash2, Save, X, Tag, Clock } from 'lucide-react'
import { useStore, Song } from '../store'
import UploadZone from '../components/UploadZone'

// Genre color mapping for visual tags
const GENRE_COLORS: Record<string, string> = {
  pop: 'bg-pink-500/20 text-pink-300 border-pink-500/50',
  rock: 'bg-red-500/20 text-red-300 border-red-500/50',
  jazz: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
  blues: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
  country: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
  indie: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
  folk: 'bg-orange-500/20 text-orange-300 border-orange-500/50',
  classical: 'bg-violet-500/20 text-violet-300 border-violet-500/50',
  'hip-hop': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50',
  'r&b': 'bg-rose-500/20 text-rose-300 border-rose-500/50',
  soul: 'bg-lime-500/20 text-lime-300 border-lime-500/50',
  electronic: 'bg-sky-500/20 text-sky-300 border-sky-500/50',
  ambient: 'bg-teal-500/20 text-teal-300 border-teal-500/50',
}

function getGenreColor(genre: string): string {
  const key = genre.toLowerCase().replace(/[^a-z0-9&-]/g, '')
  return GENRE_COLORS[key] || 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function SongwriterMode() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editLyrics, setEditLyrics] = useState('')
  const [editGenre, setEditGenre] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  const { isLoading, songs, addSong, updateSong, deleteSong } = useStore()

  // Stop speech on unmount
  useEffect(() => {
    return () => {
      speechSynthesis.cancel()
    }
  }, [])

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setError(null)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const generateSong = async () => {
    if (!selectedFile) return
    setError(null)
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

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}))
          throw new Error(errData.error || `Generation failed (${response.status})`)
        }

        const data = await response.json()

        if (!data.lyrics) {
          throw new Error('API response missing lyrics field')
        }

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
        addSong(song)
        useStore.setState({ isLoading: false })
      }
      reader.readAsDataURL(selectedFile)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setError(msg)
      useStore.setState({ isLoading: false })
    }
  }

  const playSong = (song: Song) => {
    if (isPlaying) {
      speechSynthesis.cancel()
      setIsPlaying(false)
      return
    }

    const utterance = new SpeechSynthesisUtterance(song.lyrics)
    utterance.rate = 0.85
    utterance.pitch = 1.1
    utterance.volume = isMuted ? 0 : volume
    utterance.onstart = () => setIsPlaying(true)
    utterance.onend = () => setIsPlaying(false)
    utterance.onerror = () => setIsPlaying(false)
    utteranceRef.current = utterance
    speechSynthesis.speak(utterance)
  }

  const stopSong = () => {
    speechSynthesis.cancel()
    setIsPlaying(false)
  }

  const handleVolumeChange = (val: number) => {
    setVolume(val)
    setIsMuted(val === 0)
    if (utteranceRef.current) {
      utteranceRef.current.volume = val
    }
  }

  const toggleMute = () => {
    const next = !isMuted
    setIsMuted(next)
    if (utteranceRef.current) {
      utteranceRef.current.volume = next ? 0 : volume
    }
  }

  const startEdit = (song: Song) => {
    setEditTitle(song.title)
    setEditLyrics(song.lyrics)
    setEditGenre(song.genre)
    setIsEditing(true)
  }

  const saveEdit = () => {
    if (!currentSong) return
    const updates = { title: editTitle, lyrics: editLyrics, genre: editGenre }
    updateSong(currentSong.id, updates)
    setCurrentSong({ ...currentSong, ...updates })
    setIsEditing(false)
  }

  const cancelEdit = () => {
    setIsEditing(false)
  }

  const handleDelete = (id: string) => {
    if (deleteConfirmId === id) {
      stopSong()
      deleteSong(id)
      if (currentSong?.id === id) {
        setCurrentSong(null)
      }
      setDeleteConfirmId(null)
    } else {
      setDeleteConfirmId(id)
      // Auto-cancel confirm after 3s
      setTimeout(() => setDeleteConfirmId(null), 3000)
    }
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
          <Music className="mr-3 text-emerald-400" size={40} />
          Songwriter
        </h1>
        <p className="text-gray-400 text-lg">
          Turn your photos into original songs — AI detects genre & mood from your image
        </p>
      </motion.div>

      {/* Song Generator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 space-y-6"
      >
        <UploadZone
          preview={preview}
          onFileSelect={handleFileSelect}
          isLoading={isLoading}
        />

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/40 rounded-lg text-red-300 text-sm">
            ⚠️ {error}
          </div>
        )}

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

      {/* Current Song Display */}
      <AnimatePresence>
        {currentSong && (
          <motion.div
            key={currentSong.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card p-8 space-y-6"
          >
            {/* Song Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h2 className="text-3xl font-bold text-white mb-3 truncate">{currentSong.title}</h2>
                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-full border text-sm font-medium flex items-center gap-1 ${getGenreColor(currentSong.genre)}`}>
                    <Tag size={12} />
                    {currentSong.genre}
                  </span>
                  <span className="px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full border border-teal-500/50 text-sm font-medium">
                    {currentSong.mood}
                  </span>
                  <span className="px-3 py-1 bg-dark-700/60 text-gray-400 rounded-full border border-white/10 text-sm flex items-center gap-1">
                    <Clock size={12} />
                    {formatDate(currentSong.createdAt)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => startEdit(currentSong)}
                  className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/50 hover:bg-emerald-500/30 transition-all"
                  title="Edit lyrics"
                >
                  <Edit3 size={16} className="text-emerald-300" />
                </button>
                <button
                  onClick={() => handleDelete(currentSong.id)}
                  className={`p-2 rounded-lg transition-all ${
                    deleteConfirmId === currentSong.id
                      ? 'bg-red-500 border border-red-400'
                      : 'bg-red-500/20 border border-red-500/50 hover:bg-red-500/30'
                  }`}
                  title={deleteConfirmId === currentSong.id ? 'Click again to confirm delete' : 'Delete song'}
                >
                  <Trash2 size={16} className="text-red-300" />
                </button>
              </div>
            </div>

            {/* Song Image */}
            {currentSong.imageUrl && (
              <div className="relative rounded-lg overflow-hidden h-56 bg-dark-800">
                <img src={currentSong.imageUrl} alt={currentSong.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-950/60 to-transparent" />
              </div>
            )}

            {/* Edit Mode */}
            <AnimatePresence>
              {isEditing ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 border border-emerald-500/30 rounded-lg p-4 bg-emerald-500/5"
                >
                  <h3 className="text-sm font-semibold text-emerald-300 uppercase tracking-wider">Edit Song</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Title</label>
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full bg-dark-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/60"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Genre</label>
                      <input
                        value={editGenre}
                        onChange={(e) => setEditGenre(e.target.value)}
                        className="w-full bg-dark-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/60"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Lyrics</label>
                    <textarea
                      value={editLyrics}
                      onChange={(e) => setEditLyrics(e.target.value)}
                      rows={12}
                      className="w-full bg-dark-800 border border-white/10 rounded-lg px-3 py-2 text-gray-300 text-sm font-serif leading-relaxed focus:outline-none focus:border-emerald-500/60 resize-none"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={saveEdit}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-500 rounded-lg text-white text-sm font-medium hover:bg-emerald-600 transition-colors"
                    >
                      <Save size={14} /> Save Changes
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg text-gray-300 text-sm font-medium hover:bg-white/20 transition-colors"
                    >
                      <X size={14} /> Cancel
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* Lyrics Display */
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-dark-800/50 p-6 rounded-lg border border-emerald-500/20"
                >
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap font-serif text-lg">
                    {currentSong.lyrics}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Audio Player Controls */}
            {!isEditing && (
              <div className="flex items-center gap-4 p-4 bg-dark-800/60 rounded-lg border border-emerald-500/20">
                {/* Play / Pause */}
                <button
                  onClick={() => playSong(currentSong)}
                  className={`p-3 rounded-full transition-all ${
                    isPlaying
                      ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50'
                      : 'bg-emerald-500/20 border border-emerald-500/50 hover:bg-emerald-500/30'
                  }`}
                  title={isPlaying ? 'Pause narration' : 'Play narration'}
                >
                  {isPlaying ? <Pause size={18} className="text-white" /> : <Play size={18} className="text-white" />}
                </button>

                {/* Stop */}
                <button
                  onClick={stopSong}
                  disabled={!isPlaying}
                  className="p-3 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  title="Stop narration"
                >
                  <Square size={16} className="text-gray-300" />
                </button>

                {/* Status */}
                <span className="text-sm text-gray-400 flex-1">
                  {isPlaying ? (
                    <span className="text-emerald-400 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Narrating lyrics...
                    </span>
                  ) : 'Click play to narrate lyrics'}
                </span>

                {/* Volume Controls */}
                <div className="flex items-center gap-2">
                  <button onClick={toggleMute} className="text-gray-400 hover:text-white transition-colors">
                    {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                    className="w-24 accent-emerald-500 cursor-pointer"
                    title="Volume"
                  />
                  <span className="text-xs text-gray-500 w-8 text-right">
                    {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Song History */}
      {songs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Your Compositions ({songs.length})</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {songs.map((song) => (
              <motion.div
                key={song.id}
                whileHover={{ scale: 1.01 }}
                className={`p-4 bg-dark-800/50 rounded-lg border transition-all ${
                  currentSong?.id === song.id
                    ? 'border-emerald-500/60 bg-emerald-500/5'
                    : 'border-emerald-500/20 hover:border-emerald-500/50'
                }`}
              >
                {/* Song info row */}
                <div
                  className="cursor-pointer"
                  onClick={() => setCurrentSong(song)}
                >
                  <p className="font-semibold text-white truncate">{song.title}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className={`px-2 py-0.5 rounded-full border text-xs font-medium ${getGenreColor(song.genre)}`}>
                      {song.genre}
                    </span>
                    <span className="px-2 py-0.5 bg-teal-500/10 text-teal-400 rounded-full border border-teal-500/30 text-xs">
                      {song.mood}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Clock size={10} /> {formatDate(song.createdAt)}
                  </p>
                </div>

                {/* History action row */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                  <button
                    onClick={(e) => { e.stopPropagation(); setCurrentSong(song); playSong(song) }}
                    className="flex items-center gap-1 px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-lg text-emerald-300 text-xs hover:bg-emerald-500/30 transition-all"
                  >
                    <Play size={10} /> Play
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setCurrentSong(song); startEdit(song) }}
                    className="flex items-center gap-1 px-3 py-1 bg-white/10 border border-white/20 rounded-lg text-gray-300 text-xs hover:bg-white/20 transition-all"
                  >
                    <Edit3 size={10} /> Edit
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(song.id) }}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs transition-all ml-auto ${
                      deleteConfirmId === song.id
                        ? 'bg-red-500 border border-red-400 text-white'
                        : 'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20'
                    }`}
                  >
                    <Trash2 size={10} />
                    {deleteConfirmId === song.id ? 'Confirm?' : 'Delete'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
