import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, GripVertical, Trash2, Sparkles, Zap, Grid3X3 } from 'lucide-react'
import { useStore, ComicsSequence, ComicsPanel } from '../store'
import UploadZone from '../components/UploadZone'
import { v4 as uuidv4 } from 'uuid'

export default function ComicsMode() {
  const [sequenceTitle, setSequenceTitle] = useState('')
  const [sequenceDescription, setSequenceDescription] = useState('')
  const [panelPreviews, setPanelPreviews] = useState<Array<{ id: string; preview: string; file: File }>>([])
  const [draggedPanel, setDraggedPanel] = useState<string | null>(null)

  const {
    comicsSequences,
    currentComicsSequence,
    isLoading,
    addComicsSequence,
    updateComicsSequence,
    setCurrentComicsSequence,
  } = useStore()

  const handlePanelFileSelect = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const panelId = uuidv4()
      setPanelPreviews((prev) => [
        ...prev,
        {
          id: panelId,
          preview: e.target?.result as string,
          file,
        },
      ])
    }
    reader.readAsDataURL(file)
  }

  const removePanelPreview = (panelId: string) => {
    setPanelPreviews((prev) => prev.filter((p) => p.id !== panelId))
  }

  const createNewSequence = () => {
    if (!sequenceTitle || panelPreviews.length === 0) return

    const newSequence: ComicsSequence = {
      id: uuidv4(),
      title: sequenceTitle,
      description: sequenceDescription,
      panels: [],
      createdAt: Date.now(),
    }

    addComicsSequence(newSequence)
    setCurrentComicsSequence(newSequence)
  }

  const generatePanels = async () => {
    if (!currentComicsSequence || panelPreviews.length === 0) return

    useStore.setState({ isLoading: true })

    try {
      const generatedPanels: ComicsPanel[] = []

      for (let i = 0; i < panelPreviews.length; i++) {
        const { preview, file } = panelPreviews[i]
        const reader = new FileReader()

        await new Promise<void>((resolve) => {
          reader.onload = async (e) => {
            const base64 = (e.target?.result as string).split(',')[1]

            try {
              const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  imageBase64: base64,
                  mimeType: file.type,
                  mode: 'comics',
                  panelNumber: i + 1,
                  totalPanels: panelPreviews.length,
                }),
              })

              if (response.ok) {
                const data = await response.json()
                generatedPanels.push({
                  id: uuidv4(),
                  imageUrl: preview,
                  dialogue: data.story || 'Panel dialogue',
                  caption: data.mood,
                  mood: data.mood || 'dramatic',
                })
              }
            } catch (error) {
              console.error('Error generating panel:', error)
              generatedPanels.push({
                id: uuidv4(),
                imageUrl: preview,
                dialogue: 'Click to add dialogue',
                mood: 'dramatic',
              })
            }

            resolve()
          }
          reader.readAsDataURL(file)
        })
      }

      updateComicsSequence(currentComicsSequence.id, {
        panels: generatedPanels,
      })

      setPanelPreviews([])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      useStore.setState({ isLoading: false })
    }
  }

  const handleDragStart = (panelId: string) => {
    setDraggedPanel(panelId)
  }

  const handleDrop = (targetId: string) => {
    if (!draggedPanel || !currentComicsSequence) return

    const fromIdx = currentComicsSequence.panels.findIndex((p) => p.id === draggedPanel)
    const toIdx = currentComicsSequence.panels.findIndex((p) => p.id === targetId)

    if (fromIdx === -1 || toIdx === -1) return

    const newPanels = [...currentComicsSequence.panels]
    ;[newPanels[fromIdx], newPanels[toIdx]] = [newPanels[toIdx], newPanels[fromIdx]]

    updateComicsSequence(currentComicsSequence.id, { panels: newPanels })
    setDraggedPanel(null)
  }

  const deletePanel = (panelId: string) => {
    if (!currentComicsSequence) return
    updateComicsSequence(currentComicsSequence.id, {
      panels: currentComicsSequence.panels.filter((p) => p.id !== panelId),
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-orange/10 border border-accent-orange/30 mb-4">
          <Sparkles className="w-4 h-4 text-accent-orange" />
          <span className="text-sm font-medium text-accent-orange">Comics Mode</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-display font-bold mb-4 bg-gradient-to-r from-accent-orange via-accent-yellow to-accent-pink bg-clip-text text-transparent">
          Create Graphic Novels
        </h1>
        <p className="text-xl text-white/60 max-w-2xl mx-auto">
          Upload multiple images and let AI weave them into an interactive comic book
        </p>
      </motion.div>

      {/* Sequence Setup or Editor */}
      {!currentComicsSequence ? (
        // Setup
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto space-y-6"
        >
          <div className="glass-card p-8 space-y-6">
            <h2 className="text-2xl font-bold text-white">Create New Sequence</h2>

            {/* Title */}
            <div>
              <label className="block text-white/80 font-medium mb-3">Sequence Title</label>
              <input
                type="text"
                value={sequenceTitle}
                onChange={(e) => setSequenceTitle(e.target.value)}
                placeholder="e.g., The Hero's Journey"
                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-accent-orange focus:ring-2 focus:ring-accent-orange/20 transition-all"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-white/80 font-medium mb-3">Description</label>
              <textarea
                value={sequenceDescription}
                onChange={(e) => setSequenceDescription(e.target.value)}
                placeholder="Brief description of your comic..."
                rows={3}
                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-accent-orange focus:ring-2 focus:ring-accent-orange/20 transition-all resize-none"
              />
            </div>

            {/* Upload Panels */}
            <div>
              <label className="block text-white/80 font-medium mb-3">
                Upload Panels ({panelPreviews.length})
              </label>
              <UploadZone
                preview=""
                onFileSelect={handlePanelFileSelect}
                isLoading={false}
                allowMultiple={true}
              />
            </div>

            {/* Panel Previews */}
            {panelPreviews.length > 0 && (
              <div>
                <h4 className="text-white/80 font-medium mb-3">Panel Order</h4>
                <div className="grid grid-cols-2 gap-4">
                  {panelPreviews.map((panel, idx) => (
                    <motion.div
                      key={panel.id}
                      className="relative group aspect-square"
                    >
                      <img
                        src={panel.preview}
                        alt={`Panel ${idx + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors rounded-lg flex items-center justify-center gap-2">
                        <button
                          onClick={() => removePanelPreview(panel.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-red-500/80 hover:bg-red-600 rounded-lg text-white"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="absolute top-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs font-medium">
                        {idx + 1}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Create Button */}
            <motion.button
              onClick={createNewSequence}
              disabled={!sequenceTitle || panelPreviews.length === 0}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-50"
            >
              <Plus className="w-5 h-5" />
              Start Creating Comic
            </motion.button>
          </div>

          {/* Previous Sequences */}
          {comicsSequences.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Your Comics</h3>
              {comicsSequences.map((seq) => (
                <motion.button
                  key={seq.id}
                  onClick={() => setCurrentComicsSequence(seq)}
                  whileHover={{ scale: 1.02 }}
                  className="w-full text-left p-4 rounded-lg bg-white/5 border border-white/10 hover:border-accent-orange/50 hover:bg-white/10 transition-all"
                >
                  <h4 className="font-semibold text-white">{seq.title}</h4>
                  <p className="text-white/60 text-sm mt-1">{seq.panels.length} panels</p>
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>
      ) : (
        // Editor
        <div className="space-y-8">
          {/* Sequence Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-6xl mx-auto text-center"
          >
            <h2 className="text-4xl font-bold text-white mb-2">{currentComicsSequence.title}</h2>
            {currentComicsSequence.description && (
              <p className="text-white/60 mb-4">{currentComicsSequence.description}</p>
            )}
            <div className="flex items-center justify-center gap-4">
              <span className="text-white/80">{currentComicsSequence.panels.length} Panels</span>
              <button
                onClick={() => setCurrentComicsSequence(null)}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/80 text-sm"
              >
                Back
              </button>
            </div>
          </motion.div>

          {/* Add More Panels */}
          {panelPreviews.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto"
            >
              <div className="glass-card p-6 space-y-4">
                <h3 className="text-lg font-bold text-white">Add More Panels</h3>
                <div className="grid grid-cols-2 gap-3">
                  {panelPreviews.map((panel, idx) => (
                    <div key={panel.id} className="relative aspect-square">
                      <img
                        src={panel.preview}
                        alt={`New Panel ${idx + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <span className="absolute top-2 left-2 bg-accent-orange/80 text-white px-2 py-1 rounded text-xs font-medium">
                        +{idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={generatePanels}
                  disabled={isLoading}
                  className="w-full btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-dark-950/30 border-t-dark-950 rounded-full animate-spin" />
                      <span>Generating Panels...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      <span>Generate {panelPreviews.length} New Panels</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* Upload More */}
          {!panelPreviews.length && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
              <UploadZone
                preview=""
                onFileSelect={handlePanelFileSelect}
                isLoading={false}
                allowMultiple={true}
              />
            </motion.div>
          )}

          {/* Panels Grid */}
          {currentComicsSequence.panels.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-6xl mx-auto"
            >
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Grid3X3 className="w-6 h-6" />
                Comic Panels
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentComicsSequence.panels.map((panel, idx) => (
                  <motion.div
                    key={panel.id}
                    draggable
                    onDragStart={() => handleDragStart(panel.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(panel.id)}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.05 * idx }}
                    className="glass-card group overflow-hidden cursor-grab active:cursor-grabbing"
                  >
                    <div className="relative aspect-square bg-dark-900 overflow-hidden">
                      <img
                        src={panel.imageUrl}
                        alt={`Panel ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="absolute inset-0 flex flex-col justify-between p-4">
                        <div className="flex items-start justify-between">
                          <span className="bg-accent-orange/80 text-white px-3 py-1 rounded text-sm font-bold">
                            Panel {idx + 1}
                          </span>
                          <button
                            onClick={() => deletePanel(panel.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-red-500/80 hover:bg-red-600 rounded text-white"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="text-white/80 text-xs line-clamp-2">{panel.dialogue}</div>
                      </div>
                      <GripVertical className="absolute top-2 right-2 w-4 h-4 text-white/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  )
}
