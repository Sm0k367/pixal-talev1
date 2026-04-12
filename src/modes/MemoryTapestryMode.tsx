import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Plus, X } from 'lucide-react'
import { useStore, MemoryTapestry, Memory } from '../store'
import UploadZone from '../components/UploadZone'

export default function MemoryTapestryMode() {
  const [tapestryTitle, setTapestryTitle] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [currentTapestry, setCurrentTapestry] = useState<MemoryTapestry | null>(null)
  const [tapestries, setTapestries] = useState<MemoryTapestry[]>([])
  const [isCreatingTapestry, setIsCreatingTapestry] = useState(false)

  const { isLoading, addMemoryTapestry, addMemoryToTapestry } = useStore()

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const createNewTapestry = () => {
    if (!tapestryTitle) return

    const newTapestry: MemoryTapestry = {
      id: Date.now().toString(),
      title: tapestryTitle,
      memories: [],
      createdAt: Date.now(),
    }

    setCurrentTapestry(newTapestry)
    setTapestries([newTapestry, ...tapestries])
    addMemoryTapestry(newTapestry)
    setTapestryTitle('')
    setIsCreatingTapestry(false)
  }

  const addMemory = async () => {
    if (!selectedFile || !currentTapestry) return

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
            mode: 'memory-tapestry',
          }),
        })

        if (!response.ok) throw new Error('Generation failed')

        const data = await response.json()
        const memory: Memory = {
          id: Date.now().toString(),
          title: data.title || 'Untitled Memory',
          content: data.content,
          imageUrl: preview,
          tags: data.tags || [],
          createdAt: Date.now(),
        }

        // Update current tapestry
        const updatedTapestry = {
          ...currentTapestry,
          memories: [memory, ...currentTapestry.memories],
        }
        setCurrentTapestry(updatedTapestry)
        addMemoryToTapestry(currentTapestry.id, memory)

        // Reset form
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
          Memory Tapestry
        </h1>
        <p className="text-gray-400 text-lg">
          Weave personal memories into interconnected narratives
        </p>
      </motion.div>

      {!currentTapestry ? (
        // Create New Tapestry
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 space-y-6"
        >
          {!isCreatingTapestry ? (
            <button
              onClick={() => setIsCreatingTapestry(true)}
              className="w-full px-4 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg font-bold text-white hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center justify-center"
            >
              <Plus className="mr-3" size={20} />
              Create New Memory Tapestry
            </button>
          ) : (
            <div className="space-y-4">
              <input
                type="text"
                value={tapestryTitle}
                onChange={(e) => setTapestryTitle(e.target.value)}
                placeholder="Give your tapestry a title..."
                className="w-full px-4 py-3 bg-dark-800 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-500 text-white placeholder-gray-500"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={createNewTapestry}
                  disabled={!tapestryTitle}
                  className="flex-1 px-4 py-3 bg-cyan-500 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-cyan-500/50 disabled:opacity-50 transition-all"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setIsCreatingTapestry(false)
                    setTapestryTitle('')
                  }}
                  className="flex-1 px-4 py-3 bg-dark-800 rounded-lg font-semibold text-gray-300 border border-gray-500/30 hover:border-gray-500 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Existing Tapestries */}
          {tapestries.length > 0 && (
            <div className="mt-8 pt-8 border-t border-cyan-500/20">
              <h3 className="text-lg font-bold text-white mb-4">Your Tapestries</h3>
              <div className="space-y-3">
                {tapestries.map((t) => (
                  <motion.button
                    key={t.id}
                    onClick={() => setCurrentTapestry(t)}
                    className="w-full text-left p-4 bg-dark-800/50 rounded-lg border border-cyan-500/20 hover:border-cyan-500/50 transition-all"
                  >
                    <p className="font-semibold text-white">{t.title}</p>
                    <p className="text-xs text-cyan-400 mt-1">{t.memories.length} memories</p>
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      ) : (
        // Active Tapestry
        <>
          {/* Tapestry Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-6 flex items-center justify-between"
          >
            <div>
              <h2 className="text-2xl font-bold text-white">{currentTapestry.title}</h2>
              <p className="text-cyan-400 text-sm mt-1">{currentTapestry.memories.length} memories woven</p>
            </div>
            <button
              onClick={() => setCurrentTapestry(null)}
              className="p-2 hover:bg-cyan-500/20 rounded-lg transition-colors"
            >
              <X size={20} className="text-cyan-400" />
            </button>
          </motion.div>

          {/* Add Memory */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 space-y-6"
          >
            <h3 className="text-xl font-bold text-white">Add a Memory</h3>

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
              onClick={addMemory}
              disabled={!selectedFile || isLoading}
              className="w-full px-4 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg font-bold text-white hover:shadow-lg hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                  Weaving Memory...
                </>
              ) : (
                <>
                  <Sparkles className="mr-3" size={20} />
                  Add Memory to Tapestry
                </>
              )}
            </button>
          </motion.div>

          {/* Memories Timeline */}
          {currentTapestry.memories.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-8 space-y-6"
            >
              <h3 className="text-xl font-bold text-white">Woven Memories</h3>
              <div className="space-y-6">
                {currentTapestry.memories.map((memory) => (
                  <motion.div
                    key={memory.id}
                    className="p-6 bg-dark-800/50 rounded-lg border border-cyan-500/20"
                  >
                    <div className="flex gap-4">
                      {memory.imageUrl && (
                        <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={memory.imageUrl} alt={memory.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-white mb-2">{memory.title}</p>
                        <p className="text-gray-300 text-sm leading-relaxed mb-3">{memory.content}</p>
                        {memory.tags.length > 0 && (
                          <div className="flex gap-2 flex-wrap">
                            {memory.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-1 bg-cyan-500/20 text-cyan-300 text-xs rounded border border-cyan-500/30"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
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
