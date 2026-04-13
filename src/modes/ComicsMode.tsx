import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GripVertical, Trash2, Sparkles, Zap, Grid3X3, ChevronLeft, ImagePlus } from 'lucide-react'
import { useStore, ComicsSequence, ComicsPanel } from '../store'
import UploadZone from '../components/UploadZone'
import { v4 as uuidv4 } from 'uuid'

interface PanelPreview {
  id: string
  preview: string // base64 data URL
  file: File
}

export default function ComicsMode() {
  const [sequenceTitle, setSequenceTitle] = useState('')
  const [sequenceDescription, setSequenceDescription] = useState('')
  const [panelPreviews, setPanelPreviews] = useState<PanelPreview[]>([])
  // draggedPanelId tracks which panel is being dragged (preview list or generated panels)
  const [draggedPreviewId, setDraggedPreviewId] = useState<string | null>(null)
  const [draggedPanelId, setDraggedPanelId] = useState<string | null>(null)
  const [dragOverPreviewId, setDragOverPreviewId] = useState<string | null>(null)
  const [dragOverPanelId, setDragOverPanelId] = useState<string | null>(null)
  const [generatingPanels, setGeneratingPanels] = useState(false)

  const {
    comicsSequences,
    currentComicsSequence,
    addComicsSequence,
    updateComicsSequence,
    setCurrentComicsSequence,
  } = useStore()

  // ---- File handling ----

  const handlePanelFileSelect = useCallback((file: File) => {
    // Only accept image/* files
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      setPanelPreviews((prev) => [
        ...prev,
        {
          id: uuidv4(),
          preview: e.target?.result as string,
          file,
        },
      ])
    }
    reader.readAsDataURL(file)
  }, [])

  const removePanelPreview = (panelId: string) => {
    setPanelPreviews((prev) => prev.filter((p) => p.id !== panelId))
  }

  // ---- Drag-drop reordering of preview panels (before generation) ----

  const handlePreviewDragStart = (id: string) => {
    setDraggedPreviewId(id)
  }

  const handlePreviewDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault()
    setDragOverPreviewId(id)
  }

  const handlePreviewDrop = (targetId: string) => {
    if (!draggedPreviewId || draggedPreviewId === targetId) {
      setDraggedPreviewId(null)
      setDragOverPreviewId(null)
      return
    }
    setPanelPreviews((prev) => {
      const fromIdx = prev.findIndex((p) => p.id === draggedPreviewId)
      const toIdx = prev.findIndex((p) => p.id === targetId)
      if (fromIdx === -1 || toIdx === -1) return prev
      const next = [...prev]
      ;[next[fromIdx], next[toIdx]] = [next[toIdx], next[fromIdx]]
      return next
    })
    setDraggedPreviewId(null)
    setDragOverPreviewId(null)
  }

  // ---- Sequence creation + generation (combined flow) ----

  const createAndGenerate = async () => {
    if (!sequenceTitle.trim() || panelPreviews.length === 0) return

    const newSequence: ComicsSequence = {
      id: uuidv4(),
      title: sequenceTitle.trim(),
      description: sequenceDescription.trim(),
      panels: [],
      createdAt: Date.now(),
    }

    addComicsSequence(newSequence)
    setCurrentComicsSequence(newSequence)

    // Generate panels immediately
    await generatePanelsForSequence(newSequence.id, [...panelPreviews])

    // Clear setup state
    setSequenceTitle('')
    setSequenceDescription('')
    setPanelPreviews([])
  }

  // ---- Core generation logic ----

  const generatePanelsForSequence = async (sequenceId: string, previews: PanelPreview[]) => {
    if (previews.length === 0) return
    setGeneratingPanels(true)
    useStore.setState({ isLoading: true })

    try {
      const generatedPanels: ComicsPanel[] = []

      for (let i = 0; i < previews.length; i++) {
        const { preview, file } = previews[i]
        // preview is already a base64 data URL — extract raw base64 portion
        const base64 = preview.split(',')[1]

        try {
          const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: base64,
              mimeType: file.type,
              mode: 'comics',
              panelNumber: i + 1,
              totalPanels: previews.length,
            }),
          })

          if (response.ok) {
            const data = await response.json()
            generatedPanels.push({
              id: uuidv4(),
              imageUrl: preview,
              dialogue: data.story || data.content || 'Panel dialogue',
              caption: data.content || data.mood,
              mood: data.mood || 'dramatic',
            })
          } else {
            // Fallback panel on API error
            generatedPanels.push({
              id: uuidv4(),
              imageUrl: preview,
              dialogue: `Panel ${i + 1} — click to add dialogue`,
              caption: '',
              mood: 'dramatic',
            })
          }
        } catch (error) {
          console.error(`Error generating panel ${i + 1}:`, error)
          generatedPanels.push({
            id: uuidv4(),
            imageUrl: preview,
            dialogue: `Panel ${i + 1} — click to add dialogue`,
            caption: '',
            mood: 'dramatic',
          })
        }
      }

      updateComicsSequence(sequenceId, { panels: generatedPanels })
    } finally {
      setGeneratingPanels(false)
      useStore.setState({ isLoading: false })
    }
  }

  // ---- Add more panels to existing sequence ----

  const handleAddMorePanels = async () => {
    if (!currentComicsSequence || panelPreviews.length === 0) return
    await generatePanelsForSequence(currentComicsSequence.id, [...panelPreviews])
    setPanelPreviews([])
  }

  // ---- Drag-drop reordering of generated panels ----

  const handlePanelDragStart = (panelId: string) => {
    setDraggedPanelId(panelId)
  }

  const handlePanelDragOver = (e: React.DragEvent, panelId: string) => {
    e.preventDefault()
    setDragOverPanelId(panelId)
  }

  const handlePanelDrop = (targetId: string) => {
    if (!draggedPanelId || !currentComicsSequence || draggedPanelId === targetId) {
      setDraggedPanelId(null)
      setDragOverPanelId(null)
      return
    }

    const fromIdx = currentComicsSequence.panels.findIndex((p) => p.id === draggedPanelId)
    const toIdx = currentComicsSequence.panels.findIndex((p) => p.id === targetId)

    if (fromIdx === -1 || toIdx === -1) {
      setDraggedPanelId(null)
      setDragOverPanelId(null)
      return
    }

    const newPanels = [...currentComicsSequence.panels]
    ;[newPanels[fromIdx], newPanels[toIdx]] = [newPanels[toIdx], newPanels[fromIdx]]

    updateComicsSequence(currentComicsSequence.id, { panels: newPanels })
    setDraggedPanelId(null)
    setDragOverPanelId(null)
  }

  const deletePanel = (panelId: string) => {
    if (!currentComicsSequence) return
    updateComicsSequence(currentComicsSequence.id, {
      panels: currentComicsSequence.panels.filter((p) => p.id !== panelId),
    })
  }

  const deleteSequence = (seqId: string) => {
    useStore.setState((state) => ({
      comicsSequences: state.comicsSequences.filter((s) => s.id !== seqId),
      currentComicsSequence:
        state.currentComicsSequence?.id === seqId ? null : state.currentComicsSequence,
    }))
  }

  // ---- Render ----

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

      <AnimatePresence mode="wait">
        {!currentComicsSequence ? (
          // ---- Setup View ----
          <motion.div
            key="setup"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
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
                  {panelPreviews.length > 0 && (
                    <span className="ml-2 text-white/40 text-xs font-normal">
                      — drag to reorder
                    </span>
                  )}
                </label>
                <UploadZone
                  preview=""
                  onFileSelect={handlePanelFileSelect}
                  isLoading={generatingPanels}
                  allowMultiple={true}
                />
              </div>

              {/* Panel Previews with drag-drop reorder */}
              <AnimatePresence>
                {panelPreviews.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <h4 className="text-white/80 font-medium mb-3">
                      Panel Order ({panelPreviews.length} panels) — drag to reorder
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {panelPreviews.map((panel, idx) => (
                        <motion.div
                          key={panel.id}
                          layout
                          draggable
                          onDragStart={() => handlePreviewDragStart(panel.id)}
                          onDragOver={(e) => handlePreviewDragOver(e, panel.id)}
                          onDrop={() => handlePreviewDrop(panel.id)}
                          onDragEnd={() => {
                            setDraggedPreviewId(null)
                            setDragOverPreviewId(null)
                          }}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`relative group aspect-square cursor-grab active:cursor-grabbing rounded-lg overflow-hidden border-2 transition-all ${
                            dragOverPreviewId === panel.id && draggedPreviewId !== panel.id
                              ? 'border-accent-orange scale-105'
                              : draggedPreviewId === panel.id
                              ? 'border-white/40 opacity-50'
                              : 'border-transparent'
                          }`}
                        >
                          <img
                            src={panel.preview}
                            alt={`Panel ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center gap-2">
                            <button
                              onClick={() => removePanelPreview(panel.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-red-500/80 hover:bg-red-600 rounded-lg text-white"
                              title="Remove panel"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          {/* Panel number badge */}
                          <span className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-bold">
                            {idx + 1}
                          </span>
                          {/* Grip icon */}
                          <GripVertical className="absolute top-2 right-2 w-4 h-4 text-white/60 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Create + Generate Button */}
              <motion.button
                onClick={createAndGenerate}
                disabled={!sequenceTitle.trim() || panelPreviews.length === 0 || generatingPanels}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-50"
              >
                {generatingPanels ? (
                  <>
                    <div className="w-5 h-5 border-2 border-dark-950/30 border-t-dark-950 rounded-full animate-spin" />
                    <span>Generating {panelPreviews.length} Panels...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    <span>
                      {panelPreviews.length > 0
                        ? `Create & Generate ${panelPreviews.length} Panel${panelPreviews.length !== 1 ? 's' : ''}`
                        : 'Start Creating Comic'}
                    </span>
                  </>
                )}
              </motion.button>
            </div>

            {/* Previous Sequences */}
            {comicsSequences.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Your Comics</h3>
                {comicsSequences.map((seq) => (
                  <motion.div
                    key={seq.id}
                    className="flex items-center gap-3 w-full text-left p-4 rounded-lg bg-white/5 border border-white/10 hover:border-accent-orange/50 hover:bg-white/10 transition-all group"
                  >
                    <button
                      onClick={() => setCurrentComicsSequence(seq)}
                      className="flex-1 text-left"
                    >
                      <h4 className="font-semibold text-white">{seq.title}</h4>
                      <p className="text-white/60 text-sm mt-1">
                        {seq.panels.length} panel{seq.panels.length !== 1 ? 's' : ''}
                        {seq.description ? ` — ${seq.description}` : ''}
                      </p>
                    </button>
                    <button
                      onClick={() => deleteSequence(seq.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400"
                      title="Delete sequence"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          // ---- Editor View ----
          <motion.div
            key="editor"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            {/* Sequence Header */}
            <div className="max-w-6xl mx-auto text-center">
              <h2 className="text-4xl font-bold text-white mb-2">
                {currentComicsSequence.title}
              </h2>
              {currentComicsSequence.description && (
                <p className="text-white/60 mb-4">{currentComicsSequence.description}</p>
              )}
              <div className="flex items-center justify-center gap-4">
                <span className="text-white/80">
                  {currentComicsSequence.panels.length} Panel
                  {currentComicsSequence.panels.length !== 1 ? 's' : ''}
                </span>
                <button
                  onClick={() => {
                    setCurrentComicsSequence(null)
                    setPanelPreviews([])
                  }}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/80 text-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
              </div>
            </div>

            {/* Loading state while generating */}
            {generatingPanels && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto"
              >
                <div className="glass-card p-6 text-center space-y-3">
                  <div className="flex justify-center">
                    <div className="w-8 h-8 border-2 border-accent-orange/30 border-t-accent-orange rounded-full animate-spin" />
                  </div>
                  <p className="text-white/80">Generating panel dialogue with AI...</p>
                  <p className="text-white/40 text-sm">
                    Processing {panelPreviews.length} panel{panelPreviews.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Add More Panels section */}
            {!generatingPanels && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto"
              >
                <div className="glass-card p-6 space-y-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <ImagePlus className="w-5 h-5 text-accent-orange" />
                    Add More Panels
                  </h3>
                  <UploadZone
                    preview=""
                    onFileSelect={handlePanelFileSelect}
                    isLoading={generatingPanels}
                    allowMultiple={true}
                  />

                  {/* Preview of panels about to be added */}
                  <AnimatePresence>
                    {panelPreviews.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3"
                      >
                        <div className="grid grid-cols-3 gap-3">
                          {panelPreviews.map((panel, idx) => (
                            <div key={panel.id} className="relative group aspect-square">
                              <img
                                src={panel.preview}
                                alt={`New Panel ${idx + 1}`}
                                className="w-full h-full object-cover rounded-lg"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors rounded-lg flex items-center justify-center">
                                <button
                                  onClick={() => removePanelPreview(panel.id)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-red-500/80 hover:bg-red-600 rounded text-white"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                              <span className="absolute top-1 left-1 bg-accent-orange/80 text-white px-1.5 py-0.5 rounded text-xs font-bold">
                                +{idx + 1}
                              </span>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={handleAddMorePanels}
                          className="w-full btn-primary flex items-center justify-center gap-2 py-3"
                        >
                          <Zap className="w-5 h-5" />
                          Generate {panelPreviews.length} More Panel
                          {panelPreviews.length !== 1 ? 's' : ''}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
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
                <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                  <Grid3X3 className="w-6 h-6" />
                  Comic Panels
                </h3>
                <p className="text-white/40 text-sm mb-6">Drag panels to reorder them</p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentComicsSequence.panels.map((panel, idx) => (
                    <motion.div
                      key={panel.id}
                      layout
                      draggable
                      onDragStart={() => handlePanelDragStart(panel.id)}
                      onDragOver={(e) => handlePanelDragOver(e, panel.id)}
                      onDrop={() => handlePanelDrop(panel.id)}
                      onDragEnd={() => {
                        setDraggedPanelId(null)
                        setDragOverPanelId(null)
                      }}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{
                        opacity: draggedPanelId === panel.id ? 0.4 : 1,
                        scale: dragOverPanelId === panel.id && draggedPanelId !== panel.id ? 1.03 : 1,
                      }}
                      transition={{ delay: 0.05 * idx }}
                      className={`glass-card group overflow-hidden cursor-grab active:cursor-grabbing border-2 transition-all ${
                        dragOverPanelId === panel.id && draggedPanelId !== panel.id
                          ? 'border-accent-orange'
                          : 'border-transparent'
                      }`}
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
                            <div className="flex items-center gap-1">
                              <GripVertical className="w-4 h-4 text-white/60 opacity-0 group-hover:opacity-100 transition-opacity" />
                              <button
                                onClick={() => deletePanel(panel.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-red-500/80 hover:bg-red-600 rounded text-white"
                                title="Delete panel"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          {/* Dialogue */}
                          <div className="text-white/90 text-xs line-clamp-3 bg-black/40 rounded p-2">
                            {panel.dialogue}
                          </div>
                        </div>
                      </div>
                      {/* Caption below image */}
                      {panel.caption && (
                        <div className="px-4 py-3 border-t border-white/10">
                          <p className="text-white/60 text-xs italic line-clamp-2">{panel.caption}</p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Empty state while waiting for first generation */}
            {!generatingPanels && currentComicsSequence.panels.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-2xl mx-auto text-center py-12"
              >
                <div className="text-white/30 text-6xl mb-4">🎨</div>
                <p className="text-white/50 text-lg">No panels yet — upload images above to get started</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
