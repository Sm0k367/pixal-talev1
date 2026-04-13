import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Heart, Plus, Pencil, Trash2, Check, X, ChevronLeft, BarChart2, Filter } from 'lucide-react'
import { useStore, HealingJournal, JournalEntry } from '../store'
import UploadZone from '../components/UploadZone'

const MOODS = ['Happy', 'Sad', 'Anxious', 'Peaceful', 'Grateful', 'Hopeful', 'Reflective', 'Healing'] as const
type Mood = typeof MOODS[number]

const MOOD_COLORS: Record<Mood, { bg: string; border: string; text: string; dot: string }> = {
  Happy:      { bg: 'bg-yellow-500/20',  border: 'border-yellow-500/50',  text: 'text-yellow-300',  dot: 'bg-yellow-400' },
  Sad:        { bg: 'bg-blue-500/20',    border: 'border-blue-500/50',    text: 'text-blue-300',    dot: 'bg-blue-400' },
  Anxious:    { bg: 'bg-orange-500/20',  border: 'border-orange-500/50',  text: 'text-orange-300',  dot: 'bg-orange-400' },
  Peaceful:   { bg: 'bg-teal-500/20',    border: 'border-teal-500/50',    text: 'text-teal-300',    dot: 'bg-teal-400' },
  Grateful:   { bg: 'bg-pink-500/20',    border: 'border-pink-500/50',    text: 'text-pink-300',    dot: 'bg-pink-400' },
  Hopeful:    { bg: 'bg-green-500/20',   border: 'border-green-500/50',   text: 'text-green-300',   dot: 'bg-green-400' },
  Reflective: { bg: 'bg-purple-500/20',  border: 'border-purple-500/50',  text: 'text-purple-300',  dot: 'bg-purple-400' },
  Healing:    { bg: 'bg-rose-500/20',    border: 'border-rose-500/50',    text: 'text-rose-300',    dot: 'bg-rose-400' },
}

// Mood timeline chart: maps each mood to a Y position (0=top negative, 8=bottom positive)
const MOOD_Y_POSITION: Record<Mood, number> = {
  Anxious:    1,
  Sad:        2,
  Reflective: 3,
  Healing:    4,
  Peaceful:   5,
  Hopeful:    6,
  Grateful:   7,
  Happy:      8,
}

export default function HealingJournalMode() {
  const [journalTitle, setJournalTitle] = useState('')
  const [currentJournal, setCurrentJournal] = useState<HealingJournal | null>(null)
  const [isCreatingJournal, setIsCreatingJournal] = useState(false)
  const [activeTab, setActiveTab] = useState<'new-entry' | 'history' | 'timeline'>('new-entry')

  // Entry form state
  const [selectedMood, setSelectedMood] = useState<Mood>('Peaceful')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState('')
  const [generatedTitle, setGeneratedTitle] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Mood history / filter state
  const [filterMood, setFilterMood] = useState<Mood | 'All'>('All')

  // Edit state
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [editMood, setEditMood] = useState<Mood>('Peaceful')

  const { isLoading, addHealingJournal, addJournalEntry, updateJournalEntry, deleteJournalEntry, deleteHealingJournal, healingJournals } = useStore()

  // Keep local journal state in sync with store
  const storeJournal = currentJournal
    ? healingJournals.find(j => j.id === currentJournal.id) ?? currentJournal
    : null

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const createNewJournal = () => {
    if (!journalTitle.trim()) return

    const newJournal: HealingJournal = {
      id: Date.now().toString(),
      title: journalTitle.trim(),
      entries: [],
      createdAt: Date.now(),
    }

    addHealingJournal(newJournal)
    setCurrentJournal(newJournal)
    setJournalTitle('')
    setIsCreatingJournal(false)
  }

  const generateJournalPrompt = async () => {
    if (!selectedFile || !storeJournal) return

    setIsGenerating(true)
    setError(null)

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = (e.target?.result as string).split(',')[1]
          resolve(result)
        }
        reader.onerror = reject
        reader.readAsDataURL(selectedFile)
      })

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: selectedFile.type,
          mode: 'therapy-journal',
          prompt: `You are a compassionate therapeutic journaling guide. The person is currently feeling "${selectedMood}". Based on this image, craft a healing reflection (120-150 words) that acknowledges the "${selectedMood}" emotion and encourages gentle emotional processing and growth. Use warm, non-judgmental, therapeutic language. Return ONLY JSON: { "content": "journaling prompt and reflection", "mood": "${selectedMood}", "title": "reflection title (4-6 words)" }`,
        }),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || `Generation failed (${response.status})`)
      }

      const data = await response.json()
      setGeneratedContent(data.content || data.story || '')
      setGeneratedTitle(data.title || `${selectedMood} Reflection`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const saveEntry = () => {
    if (!generatedContent || !storeJournal) return

    const entry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      content: generatedContent,
      mood: selectedMood,
      title: generatedTitle,
      imageUrl: preview,
      createdAt: Date.now(),
    }

    addJournalEntry(storeJournal.id, entry)

    // Sync local reference
    setCurrentJournal(prev =>
      prev ? { ...prev, entries: [entry, ...prev.entries] } : prev
    )

    // Reset form
    setGeneratedContent('')
    setGeneratedTitle('')
    setSelectedFile(null)
    setPreview('')
    setSelectedMood('Peaceful')
    setError(null)
  }

  const startEdit = (entry: JournalEntry) => {
    setEditingEntryId(entry.id)
    setEditContent(entry.content)
    setEditMood(entry.mood as Mood)
  }

  const saveEdit = (journalId: string, entryId: string) => {
    updateJournalEntry(journalId, entryId, {
      content: editContent,
      mood: editMood,
    })
    setCurrentJournal(prev =>
      prev
        ? {
            ...prev,
            entries: prev.entries.map(e =>
              e.id === entryId ? { ...e, content: editContent, mood: editMood } : e
            ),
          }
        : prev
    )
    setEditingEntryId(null)
  }

  const confirmDelete = (journalId: string, entryId: string) => {
    if (window.confirm('Delete this journal entry? This cannot be undone.')) {
      deleteJournalEntry(journalId, entryId)
      setCurrentJournal(prev =>
        prev ? { ...prev, entries: prev.entries.filter(e => e.id !== entryId) } : prev
      )
    }
  }

  const confirmDeleteJournal = (journalId: string) => {
    if (window.confirm('Delete this entire journal? This cannot be undone.')) {
      deleteHealingJournal(journalId)
      setCurrentJournal(null)
    }
  }

  // Derive filtered entries from store journal (always fresh)
  const liveEntries = storeJournal?.entries ?? []

  const filteredEntries = useMemo(() => {
    if (filterMood === 'All') return liveEntries
    return liveEntries.filter(e => e.mood === filterMood)
  }, [liveEntries, filterMood])

  // Mood counts for filter badges
  const moodCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    liveEntries.forEach(e => {
      counts[e.mood] = (counts[e.mood] || 0) + 1
    })
    return counts
  }, [liveEntries])

  // Timeline data: entries sorted by date ascending
  const timelineEntries = useMemo(() => {
    return [...liveEntries].sort((a, b) => a.createdAt - b.createdAt)
  }, [liveEntries])

  const getMoodColor = (mood: string) =>
    MOOD_COLORS[mood as Mood] ?? { bg: 'bg-gray-500/20', border: 'border-gray-500/50', text: 'text-gray-300', dot: 'bg-gray-400' }

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

      {!storeJournal ? (
        /* ─── Journal List / Create ─── */
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
                onKeyDown={(e) => e.key === 'Enter' && createNewJournal()}
                placeholder="Name your healing journey..."
                className="w-full px-4 py-3 bg-dark-800 border border-pink-500/30 rounded-lg focus:outline-none focus:border-pink-500 text-white placeholder-gray-500"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={createNewJournal}
                  disabled={!journalTitle.trim()}
                  className="flex-1 px-4 py-3 bg-pink-500 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-pink-500/50 disabled:opacity-50 transition-all"
                >
                  Create Journal
                </button>
                <button
                  onClick={() => { setIsCreatingJournal(false); setJournalTitle('') }}
                  className="flex-1 px-4 py-3 bg-dark-800 rounded-lg font-semibold text-gray-300 border border-gray-500/30 hover:border-gray-500 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Existing Journals */}
          {healingJournals.length > 0 && (
            <div className="mt-8 pt-8 border-t border-pink-500/20">
              <h3 className="text-lg font-bold text-white mb-4">Your Journals</h3>
              <div className="space-y-3">
                {healingJournals.map((j) => (
                  <motion.div
                    key={j.id}
                    className="flex items-center gap-3 w-full text-left p-4 bg-dark-800/50 rounded-lg border border-pink-500/20 hover:border-pink-500/50 transition-all group"
                  >
                    <button
                      onClick={() => setCurrentJournal(j)}
                      className="flex-1 text-left"
                    >
                      <p className="font-semibold text-white">{j.title}</p>
                      <p className="text-xs text-pink-400 mt-1">{j.entries.length} entries</p>
                    </button>
                    <button
                      onClick={() => confirmDeleteJournal(j.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 rounded-lg text-red-400 hover:bg-red-500/20 transition-all"
                      title="Delete journal"
                    >
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      ) : (
        /* ─── Active Journal ─── */
        <>
          {/* Journal Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-6 flex items-center justify-between"
          >
            <div>
              <h2 className="text-2xl font-bold text-white">{storeJournal.title}</h2>
              <p className="text-pink-400 text-sm mt-1">
                {liveEntries.length} entries · Journey of healing
              </p>
            </div>
            <button
              onClick={() => setCurrentJournal(null)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-800 transition-all text-sm"
            >
              <ChevronLeft size={16} />
              All Journals
            </button>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-pink-500/20 pb-0">
            {[
              { id: 'new-entry' as const, label: 'New Entry', icon: <Plus size={16} /> },
              { id: 'history' as const,   label: `History (${liveEntries.length})`, icon: <Filter size={16} /> },
              { id: 'timeline' as const,  label: 'Mood Timeline', icon: <BarChart2 size={16} /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-t-lg transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'border-pink-500 text-pink-400 bg-pink-500/10'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'new-entry' && (
              <motion.div
                key="new-entry"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glass-card p-8 space-y-6"
              >
                <h3 className="text-xl font-bold text-white">New Entry</h3>

                {/* Mood Selector */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    How are you feeling today?
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {MOODS.map((mood) => {
                      const colors = MOOD_COLORS[mood]
                      return (
                        <button
                          key={mood}
                          onClick={() => setSelectedMood(mood)}
                          className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all border ${
                            selectedMood === mood
                              ? `${colors.bg} ${colors.border} ${colors.text} shadow-lg`
                              : 'bg-dark-800 text-gray-300 border-pink-500/30 hover:border-pink-500'
                          }`}
                        >
                          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${colors.dot}`} />
                          {mood}
                        </button>
                      )
                    })}
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
                      onClick={() => { setPreview(''); setSelectedFile(null) }}
                      className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {/* Generate / Show Generated Content */}
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
                    {generatedTitle && (
                      <p className="text-pink-300 font-semibold text-lg">{generatedTitle}</p>
                    )}
                    <div className="bg-dark-800/50 p-6 rounded-lg border border-pink-500/20">
                      <p className="text-gray-300 leading-relaxed whitespace-pre-wrap italic">
                        {generatedContent}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={saveEntry}
                        className="flex-1 px-4 py-3 bg-pink-500 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-pink-500/50 transition-all flex items-center justify-center gap-2"
                      >
                        <Check size={16} />
                        Save Entry
                      </button>
                      <button
                        onClick={() => { setGeneratedContent(''); setGeneratedTitle('') }}
                        className="flex-1 px-4 py-3 bg-dark-800 rounded-lg font-semibold text-gray-300 border border-gray-500/30 hover:border-gray-500 transition-all"
                      >
                        Generate Again
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Mood Filter */}
                <div className="glass-card p-4">
                  <label className="block text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                    <Filter size={14} />
                    Filter by Mood
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setFilterMood('All')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all border ${
                        filterMood === 'All'
                          ? 'bg-pink-500/20 border-pink-500/50 text-pink-300'
                          : 'bg-dark-800 border-gray-600/30 text-gray-400 hover:border-gray-500'
                      }`}
                    >
                      All ({liveEntries.length})
                    </button>
                    {MOODS.filter(m => moodCounts[m] > 0).map(mood => {
                      const colors = MOOD_COLORS[mood]
                      return (
                        <button
                          key={mood}
                          onClick={() => setFilterMood(mood)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all border ${
                            filterMood === mood
                              ? `${colors.bg} ${colors.border} ${colors.text}`
                              : 'bg-dark-800 border-gray-600/30 text-gray-400 hover:border-gray-500'
                          }`}
                        >
                          <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${colors.dot}`} />
                          {mood} ({moodCounts[mood]})
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Entry List */}
                {filteredEntries.length === 0 ? (
                  <div className="glass-card p-8 text-center text-gray-500">
                    {filterMood === 'All'
                      ? 'No entries yet. Create your first journal entry above.'
                      : `No entries with mood "${filterMood}".`}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredEntries.map((entry) => {
                      const colors = getMoodColor(entry.mood)
                      const isEditing = editingEntryId === entry.id
                      return (
                        <motion.div
                          key={entry.id}
                          layout
                          className={`glass-card p-6 space-y-3 border ${colors.border}`}
                        >
                          {/* Entry Header */}
                          <div className="flex items-start justify-between">
                            <div>
                              {entry.title && (
                                <p className={`font-semibold text-base ${colors.text}`}>{entry.title}</p>
                              )}
                              <p className="text-gray-400 text-sm">
                                {new Date(entry.date).toLocaleDateString('en-US', {
                                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                                })}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${colors.bg} ${colors.text} border ${colors.border}`}>
                                <span className={`inline-block w-2 h-2 rounded-full mr-1 ${colors.dot}`} />
                                {entry.mood}
                              </span>
                              {!isEditing && (
                                <>
                                  <button
                                    onClick={() => startEdit(entry)}
                                    className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-dark-700 transition-all"
                                    title="Edit entry"
                                  >
                                    <Pencil size={14} />
                                  </button>
                                  <button
                                    onClick={() => confirmDelete(storeJournal.id, entry.id)}
                                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                    title="Delete entry"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Image */}
                          {entry.imageUrl && (
                            <div className="w-20 h-20 rounded-lg overflow-hidden">
                              <img src={entry.imageUrl} alt="entry" className="w-full h-full object-cover" />
                            </div>
                          )}

                          {/* Content (edit or view) */}
                          {isEditing ? (
                            <div className="space-y-3">
                              {/* Edit mood */}
                              <div className="flex flex-wrap gap-1.5">
                                {MOODS.map(m => {
                                  const mc = MOOD_COLORS[m]
                                  return (
                                    <button
                                      key={m}
                                      onClick={() => setEditMood(m)}
                                      className={`px-2 py-1 rounded text-xs font-semibold border transition-all ${
                                        editMood === m
                                          ? `${mc.bg} ${mc.border} ${mc.text}`
                                          : 'bg-dark-800 border-gray-600/30 text-gray-400'
                                      }`}
                                    >
                                      {m}
                                    </button>
                                  )
                                })}
                              </div>
                              <textarea
                                value={editContent}
                                onChange={e => setEditContent(e.target.value)}
                                rows={6}
                                className="w-full px-4 py-3 bg-dark-800 border border-pink-500/30 rounded-lg text-gray-300 text-sm leading-relaxed focus:outline-none focus:border-pink-500 resize-none"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => saveEdit(storeJournal.id, entry.id)}
                                  className="flex items-center gap-1.5 px-4 py-2 bg-pink-500 rounded-lg text-sm font-semibold text-white hover:shadow-md transition-all"
                                >
                                  <Check size={14} /> Save Changes
                                </button>
                                <button
                                  onClick={() => setEditingEntryId(null)}
                                  className="flex items-center gap-1.5 px-4 py-2 bg-dark-800 rounded-lg text-sm font-semibold text-gray-300 border border-gray-500/30 hover:border-gray-500 transition-all"
                                >
                                  <X size={14} /> Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-300 text-sm leading-relaxed italic">
                              {entry.content}
                            </p>
                          )}
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'timeline' && (
              <motion.div
                key="timeline"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glass-card p-8 space-y-6"
              >
                <div className="flex items-center gap-3">
                  <BarChart2 size={20} className="text-pink-400" />
                  <h3 className="text-xl font-bold text-white">Mood Timeline</h3>
                  <span className="text-sm text-gray-500">({timelineEntries.length} entries)</span>
                </div>

                {timelineEntries.length < 2 ? (
                  <p className="text-gray-500 text-sm">
                    Add at least 2 entries to see your emotional journey chart.
                  </p>
                ) : (
                  <>
                    {/* SVG Timeline Chart */}
                    <div className="overflow-x-auto">
                      <svg
                        width={Math.max(600, timelineEntries.length * 80)}
                        height={260}
                        className="block"
                      >
                        {/* Y axis labels */}
                        {MOODS.slice().reverse().map((mood, idx) => {
                          const y = 20 + idx * 28
                          const colors = MOOD_COLORS[mood]
                          return (
                            <g key={mood}>
                              <line x1={90} y1={y} x2={Math.max(600, timelineEntries.length * 80) - 10} y2={y} stroke="#374151" strokeWidth={1} strokeDasharray="3,3" />
                              <text x={4} y={y + 4} fontSize={10} fill={colors.text.replace('text-', '')} className={colors.text}>
                                {mood}
                              </text>
                            </g>
                          )
                        })}

                        {/* Line connecting points */}
                        {timelineEntries.length >= 2 && (
                          <polyline
                            points={timelineEntries.map((entry, i) => {
                              const x = 100 + i * 80
                              const moodPos = MOOD_Y_POSITION[entry.mood as Mood] ?? 4
                              const y = 20 + (8 - moodPos) * 28
                              return `${x},${y}`
                            }).join(' ')}
                            fill="none"
                            stroke="url(#lineGrad)"
                            strokeWidth={2.5}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        )}

                        <defs>
                          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#ec4899" />
                            <stop offset="100%" stopColor="#f43f5e" />
                          </linearGradient>
                        </defs>

                        {/* Data points */}
                        {timelineEntries.map((entry, i) => {
                          const x = 100 + i * 80
                          const moodPos = MOOD_Y_POSITION[entry.mood as Mood] ?? 4
                          const y = 20 + (8 - moodPos) * 28
                          const colors = getMoodColor(entry.mood)
                          return (
                            <g key={entry.id}>
                              <circle cx={x} cy={y} r={8} className={colors.dot} fill="currentColor" opacity={0.9} />
                              <circle cx={x} cy={y} r={4} fill="white" opacity={0.9} />
                              {/* Date label */}
                              <text
                                x={x}
                                y={245}
                                textAnchor="middle"
                                fontSize={9}
                                fill="#9ca3af"
                              >
                                {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </text>
                            </g>
                          )
                        })}
                      </svg>
                    </div>

                    {/* Mood Legend */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {MOODS.filter(m => moodCounts[m] > 0).map(mood => {
                        const colors = MOOD_COLORS[mood]
                        return (
                          <div key={mood} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${colors.bg} border ${colors.border}`}>
                            <span className={`w-3 h-3 rounded-full ${colors.dot}`} />
                            <span className={`text-sm font-medium ${colors.text}`}>{mood}</span>
                            <span className="ml-auto text-xs text-gray-400">{moodCounts[mood]}×</span>
                          </div>
                        )
                      })}
                    </div>

                    {/* Mood progression summary */}
                    <div className="p-4 bg-dark-800/50 rounded-lg border border-pink-500/10">
                      <p className="text-sm text-gray-400">
                        <span className="text-pink-300 font-semibold">Journey summary:</span>{' '}
                        Started with <span className={getMoodColor(timelineEntries[0].mood).text}>{timelineEntries[0].mood}</span>{' '}
                        → Most recent: <span className={getMoodColor(timelineEntries[timelineEntries.length - 1].mood).text}>{timelineEntries[timelineEntries.length - 1].mood}</span>
                        {' '}· {liveEntries.length} total entries across {Object.keys(moodCounts).length} moods
                      </p>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  )
}
