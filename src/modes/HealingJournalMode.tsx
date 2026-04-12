import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Heart, Plus } from 'lucide-react'
import { useStore, HealingJournal, JournalEntry } from '../store'
import UploadZone from '../components/UploadZone'

const MOODS = ['Happy', 'Sad', 'Anxious', 'Peaceful', 'Grateful', 'Hopeful', 'Reflective', 'Healing']

export default function HealingJournalMode() {
  const [journalTitle, setJournalTitle] = useState('')
  const [currentJournal, setCurrentJournal] = useState<HealingJournal | null>(null)
  const [journals, setJournals] = useState<HealingJournal[]>([])
  const [isCreatingJournal, setIsCreatingJournal] = useState(false)

  // Entry form state
  const [selectedMood, setSelectedMood] = useState('Peaceful')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState('')

  const { isLoading, addHealingJournal, addJournalEntry } = useStore()

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const createNewJournal = () => {
    if (!journalTitle) return

    const newJournal: HealingJournal = {
      id: Date.now().toString(),
      title: journalTitle,
      entries: [],
      createdAt: Date.now(),
    }

    setCurrentJournal(newJournal)
    setJournals([newJournal, ...journals])
    addHealingJournal(newJournal)
    setJournalTitle('')
    setIsCreatingJournal(false)
  }

  const generateJournalPrompt = async () => {
    if (!selectedFile || !currentJournal) return

    setIsGenerating(true)

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
            mode: 'therapy-journal',
          }),
        })

        if (!response.ok) throw new Error('Generation failed')

        const data = await response.json()
        setGeneratedContent(data.content || '')
      }
      reader.readAsDataURL(selectedFile)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const saveEntry = () => {
    if (!generatedContent || !currentJournal) return

    const entry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      content: generatedContent,
      mood: selectedMood,
      imageUrl: preview,
      createdAt: Date.now(),
    }

    addJournalEntry(currentJournal.id, entry)

    // Update local state
    const updatedJournal = {
      ...currentJournal,
      entries: [entry, ...currentJournal.entries],
    }
    setCurrentJournal(updatedJournal)

    // Reset form
    setGeneratedContent('')
    setSelectedFile(null)
    setPreview('')
    setSelectedMood('Peaceful')
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent flex items-center">
          <Heart className="mr-3" size={40} />
          Healing Journal
        </h1>
        <p className="text-gray-400 text-lg">
          Therapeutic storytelling for emotional healing and growth
        </p>
      </motion.div>

      {!currentJournal ? (
        // Create New Journal
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 space-y-6"
        >
          {!isCreatingJournal ? (
            <button
              onClick={() => setIsCreatingJournal(true)}
              className="w-full px-4 py-4 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg font-bold text-white hover:shadow-lg hover:shadow-pink-500/50 transition-all flex items-center justify-center"
            >
              <Plus className="mr-3" size={20} />
              Start a New Healing Journal
            </button>
          ) : (
            <div className="space-y-4">
              <input
                type="text"
                value={journalTitle}
                onChange={(e) => setJournalTitle(e.target.value)}
                placeholder="Name your healing journey..."
                className="w-full px-4 py-3 bg-dark-800 border border-pink-500/30 rounded-lg focus:outline-none focus:border-pink-500 text-white placeholder-gray-500"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={createNewJournal}
                  disabled={!journalTitle}
                  className="flex-1 px-4 py-3 bg-pink-500 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-pink-500/50 disabled:opacity-50 transition-all"
                >
                  Create Journal
                </button>
                <button
                  onClick={() => {
                    setIsCreatingJournal(false)
                    setJournalTitle('')
                  }}
                  className="flex-1 px-4 py-3 bg-dark-800 rounded-lg font-semibold text-gray-300 border border-gray-500/30 hover:border-gray-500 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Existing Journals */}
          {journals.length > 0 && (
            <div className="mt-8 pt-8 border-t border-pink-500/20">
              <h3 className="text-lg font-bold text-white mb-4">Your Journals</h3>
              <div className="space-y-3">
                {journals.map((j) => (
                  <motion.button
                    key={j.id}
                    onClick={() => setCurrentJournal(j)}
                    className="w-full text-left p-4 bg-dark-800/50 rounded-lg border border-pink-500/20 hover:border-pink-500/50 transition-all"
                  >
                    <p className="font-semibold text-white">{j.title}</p>
                    <p className="text-xs text-pink-400 mt-1">{j.entries.length} entries</p>
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      ) : (
        // Active Journal
        <>
          {/* Journal Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-6"
          >
            <h2 className="text-2xl font-bold text-white">{currentJournal.title}</h2>
            <p className="text-pink-400 text-sm mt-1">{currentJournal.entries.length} entries • Journey of healing</p>
          </motion.div>

          {/* New Entry Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 space-y-6"
          >
            <h3 className="text-xl font-bold text-white">New Entry</h3>

            {/* Mood Selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                How are you feeling today?
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {MOODS.map((mood) => (
                  <button
                    key={mood}
                    onClick={() => setSelectedMood(mood)}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                      selectedMood === mood
                        ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/50'
                        : 'bg-dark-800 text-gray-300 border border-pink-500/30 hover:border-pink-500'
                    }`}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>

            {/* Upload Image */}
            {!preview && (
              <UploadZone 
                preview={preview}
                onFileSelect={handleFileSelect}
                isLoading={isLoading}
              />
            )}

            {/* Preview */}
            {preview && (
              <div className="relative rounded-lg overflow-hidden h-48 bg-dark-800 group">
                <img src={preview} alt="preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => {
                    setPreview('')
                    setSelectedFile(null)
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Generate or Show Generated Content */}
            {!generatedContent ? (
              <button
                onClick={generateJournalPrompt}
                disabled={!selectedFile || isGenerating || isLoading}
                className="w-full px-4 py-4 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg font-bold text-white hover:shadow-lg hover:shadow-pink-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                    Generating Healing Prompt...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-3" size={20} />
                    Generate Journaling Prompt
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-4">
                <div className="bg-dark-800/50 p-6 rounded-lg border border-pink-500/20">
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap italic">
                    {generatedContent}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={saveEntry}
                    className="flex-1 px-4 py-3 bg-pink-500 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-pink-500/50 transition-all"
                  >
                    Save Entry
                  </button>
                  <button
                    onClick={() => setGeneratedContent('')}
                    className="flex-1 px-4 py-3 bg-dark-800 rounded-lg font-semibold text-gray-300 border border-gray-500/30 hover:border-gray-500 transition-all"
                  >
                    Generate Again
                  </button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Entries Timeline */}
          {currentJournal.entries.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-8 space-y-6"
            >
              <h3 className="text-xl font-bold text-white">Your Journey</h3>
              <div className="space-y-4">
                {currentJournal.entries.map((entry) => (
                  <motion.div
                    key={entry.id}
                    className="p-6 bg-dark-800/50 rounded-lg border border-pink-500/20"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-gray-400 text-sm">{new Date(entry.date).toLocaleDateString()}</p>
                      </div>
                      <span className="px-2 py-1 bg-pink-500/20 text-pink-300 text-xs rounded border border-pink-500/30">
                        {entry.mood}
                      </span>
                    </div>

                    {entry.imageUrl && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden mb-3">
                        <img src={entry.imageUrl} alt="entry" className="w-full h-full object-cover" />
                      </div>
                    )}

                    <p className="text-gray-300 text-sm leading-relaxed">{entry.content.substring(0, 150)}...</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}
