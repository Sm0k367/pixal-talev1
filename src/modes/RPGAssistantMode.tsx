import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Dice5 } from 'lucide-react'
import { useStore, RPGWorld } from '../store'
import UploadZone from '../components/UploadZone'

export default function RPGAssistantMode() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [currentWorld, setCurrentWorld] = useState<RPGWorld | null>(null)
  const [worlds, setWorlds] = useState<RPGWorld[]>([])

  const { isLoading, addRPGWorld } = useStore()

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const generateWorld = async () => {
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
            mode: 'rpg',
          }),
        })

        if (!response.ok) throw new Error('Generation failed')

        const data = await response.json()
        const world: RPGWorld = {
          id: Date.now().toString(),
          title: data.title || 'Untitled World',
          description: data.description || 'A mysterious realm',
          worldBuilding: data.worldBuilding,
          imageUrl: preview,
          createdAt: Date.now(),
        }

        setCurrentWorld(world)
        setWorlds([world, ...worlds].slice(0, 10))
        addRPGWorld(world)
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
        <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent flex items-center">
          <Dice5 className="mr-3" size={40} />
          RPG Assistant
        </h1>
        <p className="text-gray-400 text-lg">
          Build fantasy worlds for your tabletop adventures
        </p>
      </motion.div>

      {/* World Generator */}
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
          onClick={generateWorld}
          disabled={!selectedFile || isLoading}
          className="w-full px-4 py-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg font-bold text-white hover:shadow-lg hover:shadow-amber-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
              Building World...
            </>
          ) : (
            <>
              <Sparkles className="mr-3" size={20} />
              Generate World
            </>
          )}
        </button>
      </motion.div>

      {/* Current World */}
      {currentWorld && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* World Header */}
          <motion.div className="glass-card p-8 space-y-4">
            <div>
              <h2 className="text-4xl font-bold text-white mb-2">{currentWorld.title}</h2>
              <p className="text-amber-300 text-lg italic">{currentWorld.description}</p>
            </div>

            {currentWorld.imageUrl && (
              <div className="relative rounded-lg overflow-hidden h-64 bg-dark-800">
                <img src={currentWorld.imageUrl} alt={currentWorld.title} className="w-full h-full object-cover" />
              </div>
            )}
          </motion.div>

          {/* World Building Details */}
          <motion.div className="glass-card p-8">
            <h3 className="text-2xl font-bold text-white mb-6">World Details</h3>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap mb-6">
                {currentWorld.worldBuilding}
              </p>
            </div>

            {/* Adventure Hooks */}
            <div className="mt-8 p-6 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <p className="text-amber-300 font-semibold mb-2">🎲 Adventure Hooks</p>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>• Explore hidden ruins and forgotten civilizations</li>
                <li>• Uncover magical artifacts with unique powers</li>
                <li>• Navigate political intrigue and faction conflicts</li>
                <li>• Encounter legendary creatures and NPCs</li>
              </ul>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* World History */}
      {worlds.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 space-y-4"
        >
          <h3 className="text-xl font-bold text-white">Your Worlds</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {worlds.slice(1).map((world) => (
              <motion.div
                key={world.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setCurrentWorld(world)}
                className="p-4 bg-dark-800/50 rounded-lg border border-amber-500/20 cursor-pointer hover:border-amber-500/50 transition-all"
              >
                <p className="font-semibold text-white truncate">{world.title}</p>
                <p className="text-xs text-amber-400 mt-1 line-clamp-2">{world.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
