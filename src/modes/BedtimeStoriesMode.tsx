import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Moon } from 'lucide-react'
import { useStore, BedtimeStory } from '../store'
import UploadZone from '../components/UploadZone'

const AGE_GROUPS = [
  { id: '2-4', label: 'Toddlers (2-4)' },
  { id: '4-6', label: 'Preschool (4-6)' },
  { id: '6-8', label: 'Early Elementary (6-8)' },
  { id: '8-10', label: 'Elementary (8-10)' },
]

export default function BedtimeStoriesMode() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('4-6')
  const [currentStory, setCurrentStory] = useState<BedtimeStory | null>(null)
  const [bedtimeStories, setBedtimeStories] = useState<BedtimeStory[]>([])

  const { isLoading, addBedtimeStory } = useStore()

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const generateBedtimeStory = async () => {
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
            mode: 'bedtime',
          }),
        })

        if (!response.ok) throw new Error('Generation failed')

         const data = await response.json()
         const story: BedtimeStory = {
           id: Date.now().toString(),
           title: data.title || 'Bedtime Tale',
           story: data.story,
           mood: data.mood || 'peaceful',
           ageGroup: selectedAgeGroup,
           imageUrl: preview,
           createdAt: Date.now(),
         }

        setCurrentStory(story)
        setBedtimeStories([story, ...bedtimeStories].slice(0, 10))
        addBedtimeStory(story)
      }
      reader.readAsDataURL(selectedFile)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      useStore.setState({ isLoading: false })
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
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent flex items-center">
          <Moon className="mr-3" size={40} />
          Bedtime Stories
        </h1>
        <p className="text-gray-400 text-lg">
          Magical tales perfect for sweet dreams and gentle slumber
        </p>
      </motion.div>

      {/* Story Generator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 space-y-6"
      >
        {/* Age Group Selector */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-3">
            Child's Age Group
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {AGE_GROUPS.map((group) => (
              <button
                key={group.id}
                onClick={() => setSelectedAgeGroup(group.id)}
                className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                  selectedAgeGroup === group.id
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/50'
                    : 'bg-dark-800 text-gray-300 border border-indigo-500/30 hover:border-indigo-500'
                }`}
              >
                {group.label}
              </button>
            ))}
          </div>
        </div>

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
          onClick={generateBedtimeStory}
          disabled={!selectedFile || isLoading}
          className="w-full px-4 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg font-bold text-white hover:shadow-lg hover:shadow-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
              Crafting Bedtime Tale...
            </>
          ) : (
            <>
              <Sparkles className="mr-3" size={20} />
              Generate Bedtime Story
            </>
          )}
        </button>
      </motion.div>

      {/* Current Story */}
      {currentStory && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 space-y-6"
        >
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">{currentStory.title}</h2>
            <p className="text-sm text-indigo-400 mb-4">For ages {currentStory.ageGroup.replace('-', '-')}</p>
          </div>

          {currentStory.imageUrl && (
            <div className="relative rounded-lg overflow-hidden h-64 bg-dark-800">
              <img src={currentStory.imageUrl} alt={currentStory.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-center italic">
              {currentStory.story}
            </p>
          </div>
        </motion.div>
      )}

      {/* Story History */}
      {bedtimeStories.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 space-y-4"
        >
          <h3 className="text-xl font-bold text-white">More Bedtime Tales</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bedtimeStories.slice(1).map((story) => (
              <motion.div
                key={story.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setCurrentStory(story)}
                className="p-4 bg-dark-800/50 rounded-lg border border-indigo-500/20 cursor-pointer hover:border-indigo-500/50 transition-all"
              >
                <p className="font-semibold text-white truncate">{story.title}</p>
                <p className="text-xs text-indigo-400 mt-1">Ages {story.ageGroup.replace('-', '-')}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
