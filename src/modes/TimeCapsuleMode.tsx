import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Clock } from 'lucide-react'
import { useStore, TimeCapsule } from '../store'
import UploadZone from '../components/UploadZone'

export default function TimeCapsuleMode() {
  const [title, setTitle] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [location, setLocation] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [currentCapsule, setCurrentCapsule] = useState<TimeCapsule | null>(null)
  const [capsules, setCapsules] = useState<TimeCapsule[]>([])

  const { isLoading, addTimeCapsule } = useStore()

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const generateCapsule = async () => {
    if (!selectedFile || !title || !targetDate) return

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

        if (!response.ok) throw new Error('Generation failed')

        const data = await response.json()
        const capsule: TimeCapsule = {
          id: Date.now().toString(),
          title,
          content: data.content,
          imageUrl: preview,
          targetDate,
          location,
          createdAt: Date.now(),
        }

        setCurrentCapsule(capsule)
        setCapsules([capsule, ...capsules].slice(0, 20))
        addTimeCapsule(capsule)

        // Reset form
        setTitle('')
        setTargetDate('')
        setLocation('')
        setSelectedFile(null)
        setPreview('')
      }
      reader.readAsDataURL(selectedFile)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      useStore.setState({ isLoading: false })
    }
  }

  const getDaysUntil = (date: string): number => {
    const target = new Date(date).getTime()
    const today = new Date().getTime()
    return Math.ceil((target - today) / (1000 * 60 * 60 * 24))
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
          <Clock className="mr-3" size={40} />
          Time Capsule
        </h1>
        <p className="text-gray-400 text-lg">
          Preserve moments and messages for the future
        </p>
      </motion.div>

      {/* Create Capsule */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Capsule Title"
            className="px-4 py-3 bg-dark-800 border border-violet-500/30 rounded-lg focus:outline-none focus:border-violet-500 text-white placeholder-gray-500"
          />
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="px-4 py-3 bg-dark-800 border border-violet-500/30 rounded-lg focus:outline-none focus:border-violet-500 text-white"
          />
        </div>

        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location (optional - where this capsule belongs in the world)"
          className="w-full px-4 py-3 bg-dark-800 border border-violet-500/30 rounded-lg focus:outline-none focus:border-violet-500 text-white placeholder-gray-500"
        />

        <UploadZone 
          preview={preview}
          onFileSelect={handleFileSelect}
          isLoading={isLoading}
        />

        {preview && (
          <div className="relative rounded-lg overflow-hidden h-48 bg-dark-800">
            <img src={preview} alt="preview" className="w-full h-full object-cover" />
          </div>
        )}

        <button
          onClick={generateCapsule}
          disabled={!selectedFile || !title || !targetDate || isLoading}
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
              Create Time Capsule
            </>
          )}
        </button>
      </motion.div>

      {/* Current Capsule */}
      {currentCapsule && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 space-y-6"
        >
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">{currentCapsule.title}</h2>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="px-3 py-1 bg-violet-500/20 text-violet-300 rounded-full border border-violet-500/50">
                Opens in {getDaysUntil(currentCapsule.targetDate)} days
              </span>
              {currentCapsule.location && (
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/50">
                  📍 {currentCapsule.location}
                </span>
              )}
            </div>
          </div>

          {currentCapsule.imageUrl && (
            <div className="relative rounded-lg overflow-hidden h-64 bg-dark-800">
              <img src={currentCapsule.imageUrl} alt={currentCapsule.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="bg-dark-800/50 p-6 rounded-lg border border-violet-500/20">
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{currentCapsule.content}</p>
          </div>

          <div className="p-4 bg-violet-500/10 border border-violet-500/30 rounded-lg text-center">
            <p className="text-violet-300 text-sm">
              This capsule will be revealed on <span className="font-bold">{new Date(currentCapsule.targetDate).toLocaleDateString()}</span>
            </p>
          </div>
        </motion.div>
      )}

      {/* Capsule History */}
      {capsules.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 space-y-4"
        >
          <h3 className="text-xl font-bold text-white">Your Capsules</h3>
          <div className="space-y-3">
            {capsules.map((capsule) => {
              const daysUntil = getDaysUntil(capsule.targetDate)
              return (
                <motion.button
                  key={capsule.id}
                  onClick={() => setCurrentCapsule(capsule)}
                  className="w-full text-left p-4 bg-dark-800/50 rounded-lg border border-violet-500/20 hover:border-violet-500/50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">{capsule.title}</p>
                      <p className="text-xs text-violet-400 mt-1">Opens {daysUntil}d</p>
                    </div>
                    {capsule.location && (
                      <p className="text-xs text-gray-400">📍 {capsule.location.substring(0, 20)}</p>
                    )}
                  </div>
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}
