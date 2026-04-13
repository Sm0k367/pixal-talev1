import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Moon, Star, Trash2, Baby, BookOpen, Filter } from 'lucide-react'
import { useStore, BedtimeStory } from '../store'
import UploadZone from '../components/UploadZone'

const AGE_GROUPS = [
  { id: '2-4', label: 'Toddlers (2-4)', emoji: '🍼', description: 'Simple & soothing' },
  { id: '4-6', label: 'Preschool (4-6)', emoji: '🌟', description: 'Magical & gentle' },
  { id: '6-8', label: 'Early Elem (6-8)', emoji: '📖', description: 'Adventures & wonder' },
  { id: '8-10', label: 'Elementary (8-10)', emoji: '🔭', description: 'Rich & engaging' },
]

export default function BedtimeStoriesMode() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('4-6')
  const [currentStory, setCurrentStory] = useState<BedtimeStory | null>(null)
  const [filterAgeGroup, setFilterAgeGroup] = useState<string>('all')

  const { isLoading, bedtimeStories, addBedtimeStory, deleteBedtimeStory } = useStore()

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
            ageGroup: selectedAgeGroup,
          }),
        })

        if (!response.ok) throw new Error('Generation failed')

        const data = await response.json()
        const story: BedtimeStory = {
          id: Date.now().toString(),
          title: data.title || 'Bedtime Tale',
          story: data.story,
          ageGroup: selectedAgeGroup,
          mood: data.mood || 'soothing',
          imageUrl: preview,
          createdAt: Date.now(),
        }

        setCurrentStory(story)
        addBedtimeStory(story)
      }
      reader.readAsDataURL(selectedFile)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      useStore.setState({ isLoading: false })
    }
  }

  const handleDelete = (storyId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    deleteBedtimeStory(storyId)
    if (currentStory?.id === storyId) {
      setCurrentStory(null)
    }
  }

  const filteredStories = filterAgeGroup === 'all'
    ? bedtimeStories
    : bedtimeStories.filter(s => s.ageGroup === filterAgeGroup)

  const getAgeGroupInfo = (id: string) => AGE_GROUPS.find(g => g.id === id)

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
          <label className="block text-sm font-semibold text-gray-300 mb-3 flex items-center">
            <Baby className="mr-2" size={16} />
            Child's Age Group
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {AGE_GROUPS.map((group) => (
              <button
                key={group.id}
                onClick={() => setSelectedAgeGroup(group.id)}
                className={`px-4 py-3 rounded-lg font-semibold transition-all text-left ${
                  selectedAgeGroup === group.id
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/50'
                    : 'bg-dark-800 text-gray-300 border border-indigo-500/30 hover:border-indigo-500'
                }`}
              >
                <div className="text-lg mb-1">{group.emoji}</div>
                <div className="text-sm font-bold">{group.label}</div>
                <div className="text-xs opacity-75">{group.description}</div>
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
      <AnimatePresence>
        {currentStory && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card p-8 space-y-6"
          >
            {/* Story Header */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">{currentStory.title}</h2>
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Age Badge */}
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    <Baby size={12} className="mr-1" />
                    Ages {currentStory.ageGroup}
                  </span>
                  {/* Soothing Mood Badge */}
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    <Moon size={12} className="mr-1" />
                    {currentStory.mood || 'soothing'}
                  </span>
                  {/* Star badge */}
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                    <Star size={12} className="mr-1" />
                    Bedtime Story
                  </span>
                </div>
              </div>
              <button
                onClick={(e) => handleDelete(currentStory.id, e)}
                className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all"
                title="Delete story"
              >
                <Trash2 size={18} />
              </button>
            </div>

            {currentStory.imageUrl && (
              <div className="relative rounded-lg overflow-hidden h-64 bg-dark-800">
                <img src={currentStory.imageUrl} alt={currentStory.title} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="prose prose-invert max-w-none bg-indigo-500/5 rounded-lg p-6 border border-indigo-500/20">
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-center italic">
                {currentStory.story}
              </p>
            </div>

            {/* Age-appropriate message */}
            <div className="flex items-center text-sm text-indigo-400">
              <BookOpen size={14} className="mr-2" />
              This story is crafted for children aged {currentStory.ageGroup} years — {getAgeGroupInfo(currentStory.ageGroup)?.description}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Story History */}
      {bedtimeStories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 space-y-4"
        >
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="text-xl font-bold text-white flex items-center">
              <BookOpen className="mr-2" size={20} />
              Story History ({bedtimeStories.length})
            </h3>
            {/* Age Group Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter size={14} className="text-gray-400" />
              <span className="text-sm text-gray-400">Filter:</span>
              <button
                onClick={() => setFilterAgeGroup('all')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  filterAgeGroup === 'all'
                    ? 'bg-indigo-500 text-white'
                    : 'bg-dark-800 text-gray-400 hover:text-gray-200 border border-indigo-500/30'
                }`}
              >
                All Ages
              </button>
              {AGE_GROUPS.map(group => (
                <button
                  key={group.id}
                  onClick={() => setFilterAgeGroup(group.id)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    filterAgeGroup === group.id
                      ? 'bg-indigo-500 text-white'
                      : 'bg-dark-800 text-gray-400 hover:text-gray-200 border border-indigo-500/30'
                  }`}
                >
                  {group.emoji} {group.id}
                </button>
              ))}
            </div>
          </div>

          {filteredStories.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No stories for this age group yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence>
                {filteredStories.map((story) => (
                  <motion.div
                    key={story.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setCurrentStory(story)}
                    className={`p-4 bg-dark-800/50 rounded-lg border transition-all cursor-pointer relative group ${
                      currentStory?.id === story.id
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : 'border-indigo-500/20 hover:border-indigo-500/50'
                    }`}
                  >
                    {story.imageUrl && (
                      <div className="rounded-md overflow-hidden h-24 mb-3 bg-dark-700">
                        <img src={story.imageUrl} alt={story.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate">{story.title}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {/* Age Badge */}
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-indigo-500/20 text-indigo-300">
                            <Baby size={10} className="mr-1" />
                            Ages {story.ageGroup}
                          </span>
                          {/* Soothing mood badge */}
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-purple-500/20 text-purple-300">
                            <Moon size={10} className="mr-1" />
                            {story.mood || 'soothing'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(story.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {/* Delete Button */}
                      <button
                        onClick={(e) => handleDelete(story.id, e)}
                        className="ml-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all flex-shrink-0"
                        title="Delete story"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
