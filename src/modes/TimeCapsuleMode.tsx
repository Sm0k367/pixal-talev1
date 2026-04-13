import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Clock, MapPin, Trash2, Lock, Eye, Filter, Calendar } from 'lucide-react'
import { useStore, TimeCapsule } from '../store'
import UploadZone from '../components/UploadZone'

export default function TimeCapsuleMode() {
  const [title, setTitle] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [location, setLocation] = useState('')
  const [message, setMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [viewingCapsule, setViewingCapsule] = useState<TimeCapsule | null>(null)
  const [locationFilter, setLocationFilter] = useState('')
  const [generationError, setGenerationError] = useState('')

  const { isLoading, timeCapsules, addTimeCapsule, deleteTimeCapsule } = useStore()

  const today = new Date().toISOString().split('T')[0]

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const generateCapsule = async () => {
    if (!selectedFile || !title || !targetDate) return
    setGenerationError('')

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
            mode: 'time-capsule',
          }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `Generation failed (${response.status})`)
        }

        const data = await response.json()

        const capsule: TimeCapsule = {
          id: Date.now().toString(),
          title: data.title || title,
          content: data.content || data.story || '',
          imageUrl: preview,
          targetDate,
          location: location.trim() || undefined,
          message: message.trim() || undefined,
          createdAt: Date.now(),
        }

        addTimeCapsule(capsule)
        setViewingCapsule(capsule)

        // Reset form
        setTitle('')
        setTargetDate('')
        setLocation('')
        setMessage('')
        setSelectedFile(null)
        setPreview('')
      }
      reader.readAsDataURL(selectedFile)
    } catch (error) {
      console.error('Error generating capsule:', error)
      setGenerationError(error instanceof Error ? error.message : 'Failed to generate capsule')
    } finally {
      useStore.setState({ isLoading: false })
    }
  }

  // Calculate days until opening — positive = future, negative = past
  const getDaysUntil = (dateStr: string): number => {
    const target = new Date(dateStr + 'T00:00:00').getTime()
    const now = new Date()
    const todayMs = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    return Math.ceil((target - todayMs) / (1000 * 60 * 60 * 24))
  }

  const isSealed = (dateStr: string): boolean => getDaysUntil(dateStr) > 0

  // Location-based filter (case-insensitive partial match)
  const filteredCapsules = useMemo(() => {
    if (!locationFilter.trim()) return timeCapsules
    const q = locationFilter.trim().toLowerCase()
    return timeCapsules.filter(c => c.location?.toLowerCase().includes(q))
  }, [timeCapsules, locationFilter])

  // Unique locations for filter suggestions
  const uniqueLocations = useMemo(() => {
    const locs = timeCapsules.map(c => c.location).filter((l): l is string => !!l)
    return [...new Set(locs)]
  }, [timeCapsules])

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (viewingCapsule?.id === id) setViewingCapsule(null)
    deleteTimeCapsule(id)
  }

  const countdownColor = (days: number) => {
    if (days > 90) return 'text-violet-300 bg-violet-500/20 border-violet-500/50'
    if (days > 30) return 'text-purple-300 bg-purple-500/20 border-purple-500/50'
    if (days > 7) return 'text-blue-300 bg-blue-500/20 border-blue-500/50'
    if (days > 0) return 'text-amber-300 bg-amber-500/20 border-amber-500/50'
    return 'text-green-300 bg-green-500/20 border-green-500/50'
  }

  const countdownLabel = (days: number) => {
    if (days > 0) return `Sealed — opens in ${days} day${days === 1 ? '' : 's'}`
    if (days === 0) return 'Opens today!'
    return `Opened ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} ago`
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent flex items-center">
          <Clock className="mr-3 text-violet-500" size={40} />
          Time Capsule
        </h1>
        <p className="text-gray-400 text-lg">
          Preserve moments and messages for the future — sealed until the day arrives
        </p>
      </motion.div>

      {/* Create Capsule Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 space-y-6"
      >
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Lock size={18} className="text-violet-400" />
          Create a New Time Capsule
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Capsule Title"
            className="px-4 py-3 bg-dark-800 border border-violet-500/30 rounded-lg focus:outline-none focus:border-violet-500 text-white placeholder-gray-500"
          />
          <div className="relative">
            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-400 pointer-events-none" />
            <input
              type="date"
              value={targetDate}
              min={today}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full pl-9 pr-4 py-3 bg-dark-800 border border-violet-500/30 rounded-lg focus:outline-none focus:border-violet-500 text-white"
            />
          </div>
        </div>

        <div className="relative">
          <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-400 pointer-events-none" />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location — e.g. Paris, France (enables location-based discovery)"
            className="w-full pl-9 pr-4 py-3 bg-dark-800 border border-violet-500/30 rounded-lg focus:outline-none focus:border-violet-500 text-white placeholder-gray-500"
          />
        </div>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Your personal message to the future... (optional — sealed alongside the AI reflection)"
          rows={3}
          className="w-full px-4 py-3 bg-dark-800 border border-violet-500/30 rounded-lg focus:outline-none focus:border-violet-500 text-white placeholder-gray-500 resize-none"
        />

        <UploadZone
          preview={preview}
          onFileSelect={handleFileSelect}
          isLoading={isLoading}
        />

        {generationError && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">{generationError}</p>
          </div>
        )}

        {targetDate && getDaysUntil(targetDate) <= 0 && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <p className="text-amber-400 text-sm">⚠️ Please choose a future date for your time capsule.</p>
          </div>
        )}

        <button
          onClick={generateCapsule}
          disabled={!selectedFile || !title || !targetDate || getDaysUntil(targetDate) <= 0 || isLoading}
          className="w-full px-4 py-4 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg font-bold text-white hover:shadow-lg hover:shadow-violet-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
              Sealing Capsule...
            </>
          ) : (
            <>
              <Sparkles className="mr-3" size={20} />
              Seal Time Capsule
            </>
          )}
        </button>
      </motion.div>

      {/* Viewing a Capsule Detail */}
      <AnimatePresence>
        {viewingCapsule && (
          <motion.div
            key={viewingCapsule.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card p-8 space-y-6 border border-violet-500/40"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3 flex-1">
                <h2 className="text-3xl font-bold text-white">{viewingCapsule.title}</h2>
                <div className="flex flex-wrap gap-3 text-sm">
                  <span className={`px-3 py-1 rounded-full border text-xs font-semibold ${countdownColor(getDaysUntil(viewingCapsule.targetDate))}`}>
                    {isSealed(viewingCapsule.targetDate) ? <Lock size={12} className="inline mr-1" /> : <Eye size={12} className="inline mr-1" />}
                    {countdownLabel(getDaysUntil(viewingCapsule.targetDate))}
                  </span>
                  <span className="px-3 py-1 bg-violet-500/20 text-violet-300 rounded-full border border-violet-500/50 text-xs">
                    📅 Sealed until {new Date(viewingCapsule.targetDate + 'T00:00:00').toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                  {viewingCapsule.location && (
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/50 text-xs">
                      📍 {viewingCapsule.location}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setViewingCapsule(null)}
                className="text-gray-500 hover:text-gray-300 transition-colors text-lg"
              >✕</button>
            </div>

            {viewingCapsule.imageUrl && (
              <div className="relative rounded-lg overflow-hidden h-64 bg-dark-800">
                <img src={viewingCapsule.imageUrl} alt={viewingCapsule.title} className="w-full h-full object-cover" />
                {isSealed(viewingCapsule.targetDate) && (
                  <div className="absolute inset-0 bg-violet-950/40 flex items-center justify-center backdrop-blur-[1px]">
                    <div className="flex items-center gap-2 px-4 py-2 bg-violet-900/80 rounded-full border border-violet-500/50">
                      <Lock size={16} className="text-violet-300" />
                      <span className="text-violet-300 text-sm font-semibold">
                        Sealed — {getDaysUntil(viewingCapsule.targetDate)}d remaining
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Personal message — always visible */}
            {viewingCapsule.message && (
              <div className="bg-violet-900/20 p-5 rounded-lg border border-violet-500/30 space-y-1">
                <p className="text-xs text-violet-400 font-semibold uppercase tracking-wide">Your Message</p>
                <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">{viewingCapsule.message}</p>
              </div>
            )}

            {/* AI content — only visible when capsule is open */}
            {isSealed(viewingCapsule.targetDate) ? (
              <div className="p-6 bg-dark-800/50 rounded-lg border border-violet-500/20 text-center space-y-3">
                <Lock size={32} className="text-violet-500 mx-auto" />
                <p className="text-violet-300 font-semibold">AI Reflection Sealed</p>
                <p className="text-gray-400 text-sm">
                  The AI-generated content will be revealed on{' '}
                  <span className="font-bold text-violet-300">
                    {new Date(viewingCapsule.targetDate + 'T00:00:00').toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </p>
              </div>
            ) : (
              <div className="bg-dark-800/50 p-6 rounded-lg border border-green-500/20 space-y-2">
                <p className="text-xs text-green-400 font-semibold uppercase tracking-wide flex items-center gap-1">
                  <Eye size={12} /> AI Reflection — Unlocked
                </p>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{viewingCapsule.content}</p>
              </div>
            )}

            <div className="p-4 bg-violet-500/10 border border-violet-500/30 rounded-lg text-center">
              <p className="text-violet-300 text-sm">
                📅 This capsule was created on{' '}
                <span className="font-bold">
                  {new Date(viewingCapsule.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>{' '}
                and is{' '}
                <span className="font-bold">sealed until {new Date(viewingCapsule.targetDate + 'T00:00:00').toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </p>
            </div>

            <button
              onClick={(e) => {
                handleDelete(viewingCapsule.id, e)
              }}
              className="w-full px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Trash2 size={16} />
              Delete Capsule
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Capsule Library */}
      {timeCapsules.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 space-y-6"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Clock size={20} className="text-violet-400" />
              Your Capsules ({filteredCapsules.length}{locationFilter ? ` of ${timeCapsules.length}` : ''})
            </h3>

            {/* Location Filter */}
            {uniqueLocations.length > 0 && (
              <div className="relative">
                <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-400 pointer-events-none" />
                <input
                  type="text"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  placeholder="Filter by location..."
                  className="pl-8 pr-4 py-2 bg-dark-800 border border-violet-500/30 rounded-lg focus:outline-none focus:border-violet-500 text-white placeholder-gray-500 text-sm"
                />
              </div>
            )}
          </div>

          {/* Location chips */}
          {uniqueLocations.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setLocationFilter('')}
                className={`px-3 py-1 rounded-full text-xs border transition-all ${
                  !locationFilter
                    ? 'bg-violet-500/40 text-violet-200 border-violet-500/70'
                    : 'bg-dark-800 text-gray-400 border-gray-700 hover:border-violet-500/50'
                }`}
              >
                All
              </button>
              {uniqueLocations.map(loc => (
                <button
                  key={loc}
                  onClick={() => setLocationFilter(loc)}
                  className={`px-3 py-1 rounded-full text-xs border transition-all ${
                    locationFilter === loc
                      ? 'bg-violet-500/40 text-violet-200 border-violet-500/70'
                      : 'bg-dark-800 text-gray-400 border-gray-700 hover:border-violet-500/50'
                  }`}
                >
                  📍 {loc}
                </button>
              ))}
            </div>
          )}

          {filteredCapsules.length === 0 && locationFilter && (
            <div className="text-center py-8 text-gray-500">
              <MapPin size={32} className="mx-auto mb-2 opacity-50" />
              <p>No capsules found in "{locationFilter}"</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCapsules.map((capsule) => {
              const days = getDaysUntil(capsule.targetDate)
              const sealed = days > 0
              return (
                <motion.div
                  key={capsule.id}
                  layout
                  className={`relative p-5 rounded-xl border transition-all cursor-pointer group ${
                    viewingCapsule?.id === capsule.id
                      ? 'border-violet-500/70 bg-violet-900/20'
                      : 'border-violet-500/20 bg-dark-800/50 hover:border-violet-500/50'
                  }`}
                  onClick={() => setViewingCapsule(capsule)}
                >
                  {capsule.imageUrl && (
                    <div className="relative h-28 rounded-lg overflow-hidden mb-3">
                      <img
                        src={capsule.imageUrl}
                        alt={capsule.title}
                        className="w-full h-full object-cover"
                      />
                      {sealed && (
                        <div className="absolute inset-0 bg-violet-950/50 flex items-center justify-center backdrop-blur-[2px]">
                          <Lock size={20} className="text-violet-300" />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate">{capsule.title}</p>
                      {capsule.location && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate">📍 {capsule.location}</p>
                      )}
                    </div>
                    <button
                      onClick={(e) => handleDelete(capsule.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:bg-red-500/20 rounded transition-all flex-shrink-0"
                      title="Delete capsule"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className={`mt-3 px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1 border ${countdownColor(days)}`}>
                    {sealed ? <Lock size={10} /> : <Eye size={10} />}
                    {countdownLabel(days)}
                  </div>

                  <p className="text-xs text-gray-600 mt-2">
                    Created {new Date(capsule.createdAt).toLocaleDateString()}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {timeCapsules.length === 0 && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 space-y-4"
        >
          <Clock size={48} className="mx-auto text-violet-500/40" />
          <p className="text-gray-500 text-lg">No time capsules yet</p>
          <p className="text-gray-600 text-sm">Upload a photo, add a future date, and seal your first capsule</p>
        </motion.div>
      )}
    </div>
  )
}
