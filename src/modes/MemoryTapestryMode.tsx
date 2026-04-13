import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Plus, X, Tag, Edit3, Trash2, Network, List, ChevronLeft, Check } from 'lucide-react'
import { useStore, MemoryTapestry, Memory } from '../store'
import UploadZone from '../components/UploadZone'

type ViewMode = 'timeline' | 'tapestry'

export default function MemoryTapestryMode() {
  const [tapestryTitle, setTapestryTitle] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [currentTapestry, setCurrentTapestry] = useState<MemoryTapestry | null>(null)
  const [tapestries, setTapestries] = useState<MemoryTapestry[]>([])
  const [isCreatingTapestry, setIsCreatingTapestry] = useState(false)
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('timeline')
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editTags, setEditTags] = useState('')
  const [generationError, setGenerationError] = useState<string | null>(null)

  const { isLoading, addMemoryTapestry, addMemoryToTapestry, updateMemoryInTapestry, deleteMemoryFromTapestry } = useStore()

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const createNewTapestry = () => {
    if (!tapestryTitle.trim()) return

    const newTapestry: MemoryTapestry = {
      id: Date.now().toString(),
      title: tapestryTitle.trim(),
      memories: [],
      createdAt: Date.now(),
    }

    setCurrentTapestry(newTapestry)
    setTapestries([newTapestry, ...tapestries])
    addMemoryTapestry(newTapestry)
    setTapestryTitle('')
    setIsCreatingTapestry(false)
    setActiveTagFilter(null)
    setViewMode('timeline')
  }

  const addMemory = async () => {
    if (!selectedFile || !currentTapestry) return

    setGenerationError(null)
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

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}))
          throw new Error(errData.error || 'Generation failed')
        }

        const data = await response.json()

        // Ensure tags is always an array of 2-3 strings
        const rawTags: string[] = Array.isArray(data.tags)
          ? data.tags.slice(0, 3).map((t: unknown) => String(t).toLowerCase().replace(/\s+/g, '-'))
          : []

        const memory: Memory = {
          id: Date.now().toString(),
          title: data.title || 'Untitled Memory',
          content: data.content || data.story || '',
          imageUrl: preview,
          tags: rawTags,
          createdAt: Date.now(),
        }

        // Update local tapestry state
        const updatedTapestry: MemoryTapestry = {
          ...currentTapestry,
          memories: [memory, ...currentTapestry.memories],
        }
        setCurrentTapestry(updatedTapestry)

        // Sync with tapestries list
        setTapestries(prev =>
          prev.map(t => t.id === currentTapestry.id ? updatedTapestry : t)
        )

        // Sync with Zustand store
        addMemoryToTapestry(currentTapestry.id, memory)

        // Reset upload form
        setSelectedFile(null)
        setPreview('')
      }
      reader.readAsDataURL(selectedFile)
    } catch (error) {
      console.error('Error adding memory:', error)
      setGenerationError(error instanceof Error ? error.message : 'Generation failed')
    } finally {
      useStore.setState({ isLoading: false })
    }
  }

  const startEditMemory = (memory: Memory) => {
    setEditingMemory(memory)
    setEditTitle(memory.title)
    setEditContent(memory.content)
    setEditTags(memory.tags.join(', '))
  }

  const saveEditMemory = () => {
    if (!editingMemory || !currentTapestry) return

    const updatedMemory: Memory = {
      ...editingMemory,
      title: editTitle.trim() || editingMemory.title,
      content: editContent.trim() || editingMemory.content,
      tags: editTags
        .split(',')
        .map(t => t.trim().toLowerCase().replace(/\s+/g, '-'))
        .filter(Boolean)
        .slice(0, 3),
    }

    const updatedTapestry: MemoryTapestry = {
      ...currentTapestry,
      memories: currentTapestry.memories.map(m =>
        m.id === editingMemory.id ? updatedMemory : m
      ),
    }

    setCurrentTapestry(updatedTapestry)
    setTapestries(prev =>
      prev.map(t => t.id === currentTapestry.id ? updatedTapestry : t)
    )
    updateMemoryInTapestry(currentTapestry.id, updatedMemory)
    setEditingMemory(null)
  }

  const deleteMemory = (memoryId: string) => {
    if (!currentTapestry) return

    const updatedTapestry: MemoryTapestry = {
      ...currentTapestry,
      memories: currentTapestry.memories.filter(m => m.id !== memoryId),
    }

    setCurrentTapestry(updatedTapestry)
    setTapestries(prev =>
      prev.map(t => t.id === currentTapestry.id ? updatedTapestry : t)
    )
    deleteMemoryFromTapestry(currentTapestry.id, memoryId)

    // Clear filter if deleted memory was the only one with this tag
    if (activeTagFilter) {
      const remaining = updatedTapestry.memories.filter(m => m.tags.includes(activeTagFilter))
      if (remaining.length === 0) setActiveTagFilter(null)
    }
  }

  // Compute all unique tags across current tapestry memories
  const allTags = useMemo(() => {
    if (!currentTapestry) return []
    const tagMap: Record<string, number> = {}
    currentTapestry.memories.forEach(m => {
      m.tags.forEach(tag => {
        tagMap[tag] = (tagMap[tag] || 0) + 1
      })
    })
    // Sort by frequency (most shared tags first)
    return Object.entries(tagMap)
      .sort(([, a], [, b]) => b - a)
      .map(([tag, count]) => ({ tag, count }))
  }, [currentTapestry])

  // Shared tags = tags appearing in 2+ memories (shows connections)
  const sharedTags = useMemo(() => allTags.filter(({ count }) => count >= 2), [allTags])

  // Filtered memories
  const filteredMemories = useMemo(() => {
    if (!currentTapestry) return []
    if (!activeTagFilter) return currentTapestry.memories
    return currentTapestry.memories.filter(m => m.tags.includes(activeTagFilter))
  }, [currentTapestry, activeTagFilter])

  // ============ Tapestry (interconnected) view ============
  const renderTapestryView = () => {
    if (!currentTapestry || currentTapestry.memories.length === 0) return null

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-card p-8 space-y-6"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Network size={20} className="text-cyan-400" />
            Tapestry Connections
          </h3>
          <p className="text-sm text-gray-400">{currentTapestry.memories.length} memories · {allTags.length} themes</p>
        </div>

        {/* Shared themes banner */}
        {sharedTags.length > 0 && (
          <div className="p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
            <p className="text-sm font-semibold text-cyan-300 mb-2">🔗 Shared Themes (connecting your memories):</p>
            <div className="flex gap-2 flex-wrap">
              {sharedTags.map(({ tag, count }) => (
                <button
                  key={tag}
                  onClick={() => setActiveTagFilter(activeTagFilter === tag ? null : tag)}
                  className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                    activeTagFilter === tag
                      ? 'bg-cyan-500 text-white border-cyan-500 shadow-lg shadow-cyan-500/30'
                      : 'bg-cyan-500/20 text-cyan-200 border-cyan-500/40 hover:bg-cyan-500/30'
                  }`}
                >
                  #{tag} <span className="ml-1 opacity-75">×{count}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Memory web — visual grid connecting memories by shared tags */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {currentTapestry.memories.map((memory, idx) => {
            // Highlight if shares tag with active filter or show all
            const isHighlighted = !activeTagFilter || memory.tags.includes(activeTagFilter)
            const sharedWithOthers = memory.tags.some(tag =>
              allTags.find(t => t.tag === tag && t.count >= 2)
            )

            return (
              <motion.div
                key={memory.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: isHighlighted ? 1 : 0.35, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className={`relative p-4 rounded-xl border transition-all ${
                  isHighlighted
                    ? 'bg-dark-800/70 border-cyan-500/40'
                    : 'bg-dark-800/30 border-gray-700/30'
                }`}
              >
                {sharedWithOthers && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" title="Connected to other memories" />
                )}
                <div className="flex gap-3">
                  {memory.imageUrl && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={memory.imageUrl} alt={memory.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm truncate">{memory.title}</p>
                    <p className="text-gray-400 text-xs mt-1 line-clamp-2">{memory.content}</p>
                    {memory.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap mt-2">
                        {memory.tags.map(tag => (
                          <button
                            key={tag}
                            onClick={() => setActiveTagFilter(activeTagFilter === tag ? null : tag)}
                            className={`px-1.5 py-0.5 text-xs rounded border transition-all ${
                              activeTagFilter === tag
                                ? 'bg-cyan-500 text-white border-cyan-500'
                                : allTags.find(t => t.tag === tag && t.count >= 2)
                                  ? 'bg-cyan-500/30 text-cyan-200 border-cyan-500/50 hover:bg-cyan-500/40'
                                  : 'bg-gray-700/50 text-gray-300 border-gray-600/40 hover:bg-gray-700'
                            }`}
                          >
                            #{tag}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    )
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
        // Create New Tapestry / Select Existing
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 space-y-6"
        >
          {!isCreatingTapestry ? (
            <button
              data-testid="create-collection-btn"
              onClick={() => setIsCreatingTapestry(true)}
              className="w-full px-4 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg font-bold text-white hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center justify-center"
            >
              <Plus className="mr-3" size={20} />
              Create Memory Collection
            </button>
          ) : (
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-cyan-300 mb-1">
                Collection Name
              </label>
              <input
                data-testid="collection-name-input"
                type="text"
                value={tapestryTitle}
                onChange={(e) => setTapestryTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && createNewTapestry()}
                placeholder="Give your collection a name..."
                className="w-full px-4 py-3 bg-dark-800 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-500 text-white placeholder-gray-500"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  data-testid="create-collection-submit"
                  onClick={createNewTapestry}
                  disabled={!tapestryTitle.trim()}
                  className="flex-1 px-4 py-3 bg-cyan-500 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-cyan-500/50 disabled:opacity-50 transition-all"
                >
                  Create Collection
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
              <h3 className="text-lg font-bold text-white mb-4">Your Collections</h3>
              <div className="space-y-3">
                {tapestries.map((t) => (
                  <motion.button
                    key={t.id}
                    onClick={() => {
                      setCurrentTapestry(t)
                      setActiveTagFilter(null)
                      setViewMode('timeline')
                    }}
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
        // Active Tapestry View
        <>
          {/* Tapestry Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">{currentTapestry.title}</h2>
                <p className="text-cyan-400 text-sm mt-1">
                  {currentTapestry.memories.length} memories · {allTags.length} themes
                </p>
              </div>
              <div className="flex items-center gap-2">
                {/* View toggle */}
                <div className="flex rounded-lg border border-cyan-500/30 overflow-hidden">
                  <button
                    onClick={() => setViewMode('timeline')}
                    title="Timeline view"
                    className={`px-3 py-2 flex items-center gap-1.5 text-sm transition-all ${
                      viewMode === 'timeline'
                        ? 'bg-cyan-500 text-white'
                        : 'bg-dark-800/50 text-gray-400 hover:text-white'
                    }`}
                  >
                    <List size={15} />
                    <span className="hidden sm:inline">Timeline</span>
                  </button>
                  <button
                    onClick={() => setViewMode('tapestry')}
                    title="Tapestry view"
                    className={`px-3 py-2 flex items-center gap-1.5 text-sm transition-all ${
                      viewMode === 'tapestry'
                        ? 'bg-cyan-500 text-white'
                        : 'bg-dark-800/50 text-gray-400 hover:text-white'
                    }`}
                  >
                    <Network size={15} />
                    <span className="hidden sm:inline">Tapestry</span>
                  </button>
                </div>
                <button
                  onClick={() => {
                    setCurrentTapestry(null)
                    setActiveTagFilter(null)
                    setEditingMemory(null)
                  }}
                  className="p-2 hover:bg-cyan-500/20 rounded-lg transition-colors"
                  title="Back to collections"
                >
                  <ChevronLeft size={20} className="text-cyan-400" />
                </button>
              </div>
            </div>

            {/* Tag filter bar */}
            {allTags.length > 0 && (
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                <Tag size={14} className="text-cyan-500 flex-shrink-0" />
                <button
                  onClick={() => setActiveTagFilter(null)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                    !activeTagFilter
                      ? 'bg-cyan-500 text-white border-cyan-500'
                      : 'bg-dark-800/50 text-gray-400 border-gray-600 hover:border-cyan-500/50'
                  }`}
                >
                  All
                </button>
                {allTags.map(({ tag, count }) => (
                  <button
                    key={tag}
                    data-testid={`tag-filter-${tag}`}
                    onClick={() => setActiveTagFilter(activeTagFilter === tag ? null : tag)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                      activeTagFilter === tag
                        ? 'bg-cyan-500 text-white border-cyan-500 shadow-sm shadow-cyan-500/30'
                        : count >= 2
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30'
                          : 'bg-dark-800/50 text-gray-400 border-gray-600 hover:border-cyan-500/40'
                    }`}
                  >
                    #{tag}
                    {count >= 2 && (
                      <span className="ml-1 opacity-75">×{count}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Add Memory Section */}
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

            {generationError && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                ⚠️ {generationError}
              </div>
            )}

            <button
              data-testid="add-memory-btn"
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

          {/* Edit Memory Modal */}
          <AnimatePresence>
            {editingMemory && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                onClick={(e) => e.target === e.currentTarget && setEditingMemory(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-dark-900 border border-cyan-500/30 rounded-2xl p-6 w-full max-w-md space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Edit3 size={18} className="text-cyan-400" />
                      Edit Memory
                    </h3>
                    <button
                      onClick={() => setEditingMemory(null)}
                      className="p-1 hover:bg-cyan-500/20 rounded-lg transition-colors"
                    >
                      <X size={18} className="text-gray-400" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-cyan-300 mb-1">Title</label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-3 py-2 bg-dark-800 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-500 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-cyan-300 mb-1">Reflection</label>
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={5}
                        className="w-full px-3 py-2 bg-dark-800 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-500 text-white text-sm resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-cyan-300 mb-1">
                        Theme Tags <span className="text-gray-500">(comma separated, max 3)</span>
                      </label>
                      <input
                        type="text"
                        value={editTags}
                        onChange={(e) => setEditTags(e.target.value)}
                        placeholder="family, growth, joy"
                        className="w-full px-3 py-2 bg-dark-800 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-500 text-white text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={saveEditMemory}
                      className="flex-1 px-4 py-2.5 bg-cyan-500 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-cyan-500/30 transition-all flex items-center justify-center gap-2"
                    >
                      <Check size={16} />
                      Save Changes
                    </button>
                    <button
                      onClick={() => setEditingMemory(null)}
                      className="flex-1 px-4 py-2.5 bg-dark-800 rounded-lg font-semibold text-gray-300 border border-gray-600 hover:border-gray-500 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tapestry Interconnected View */}
          {viewMode === 'tapestry' && currentTapestry.memories.length > 0 && (
            renderTapestryView()
          )}

          {/* Timeline View: Memories List */}
          {viewMode === 'timeline' && currentTapestry.memories.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-8 space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Woven Memories</h3>
                {activeTagFilter && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-cyan-300">Filtered by: <strong>#{activeTagFilter}</strong></span>
                    <button
                      onClick={() => setActiveTagFilter(null)}
                      className="p-1 hover:bg-red-500/20 rounded transition-colors"
                    >
                      <X size={14} className="text-red-400" />
                    </button>
                  </div>
                )}
              </div>

              {filteredMemories.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No memories match the selected theme.</p>
              ) : (
                <div className="space-y-6">
                  {filteredMemories.map((memory) => (
                    <motion.div
                      key={memory.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      data-testid={`memory-card-${memory.id}`}
                      className="p-6 bg-dark-800/50 rounded-lg border border-cyan-500/20 hover:border-cyan-500/40 transition-all"
                    >
                      <div className="flex gap-4">
                        {memory.imageUrl && (
                          <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                            <img src={memory.imageUrl} alt={memory.title} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-semibold text-white mb-2">{memory.title}</p>
                            {/* Edit / Delete actions */}
                            <div className="flex gap-1 flex-shrink-0">
                              <button
                                onClick={() => startEditMemory(memory)}
                                title="Edit memory"
                                className="p-1.5 hover:bg-cyan-500/20 rounded-lg transition-colors text-gray-400 hover:text-cyan-300"
                              >
                                <Edit3 size={15} />
                              </button>
                              <button
                                onClick={() => deleteMemory(memory.id)}
                                title="Delete memory"
                                className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors text-gray-400 hover:text-red-400"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                          <p className="text-gray-300 text-sm leading-relaxed mb-3">{memory.content}</p>
                          {memory.tags.length > 0 && (
                            <div className="flex gap-2 flex-wrap">
                              {memory.tags.map((tag) => (
                                <button
                                  key={tag}
                                  data-testid={`memory-tag-${tag}`}
                                  onClick={() => setActiveTagFilter(activeTagFilter === tag ? null : tag)}
                                  className={`px-2 py-1 text-xs rounded border transition-all cursor-pointer ${
                                    activeTagFilter === tag
                                      ? 'bg-cyan-500 text-white border-cyan-500'
                                      : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/30 hover:border-cyan-500/60'
                                  }`}
                                >
                                  #{tag}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Empty state */}
          {currentTapestry.memories.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-gray-500"
            >
              <Network size={40} className="mx-auto mb-3 opacity-30" />
              <p>Upload your first memory image to start weaving your tapestry.</p>
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}
