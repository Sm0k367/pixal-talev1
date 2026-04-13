import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Dice5, Map, Users, Wand2, BookOpen, Copy, Check, Pencil, Trash2, X, Save, ChevronDown, ChevronUp } from 'lucide-react'
import { useStore, RPGWorld } from '../store'
import UploadZone from '../components/UploadZone'

type EditableFields = Pick<RPGWorld, 'title' | 'description' | 'worldBuilding' | 'geography' | 'culture' | 'magicSystem'>

export default function RPGAssistantMode() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [currentWorldId, setCurrentWorldId] = useState<string | null>(null)
  const [copiedHook, setCopiedHook] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<EditableFields>({
    title: '',
    description: '',
    worldBuilding: '',
    geography: '',
    culture: '',
    magicSystem: '',
  })
  const [expandedSection, setExpandedSection] = useState<string | null>('worldBuilding')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { isLoading, rpgWorlds, addRPGWorld, updateRPGWorld, deleteRPGWorld } = useStore()

  const currentWorld = rpgWorlds.find(w => w.id === currentWorldId) ?? null

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const generateWorld = async () => {
    if (!selectedFile) return
    setError(null)
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

        // Parse adventureHooks — may come as array or newline-delimited string
        let hooks: string[] = []
        if (Array.isArray(data.adventureHooks)) {
          hooks = data.adventureHooks.filter(Boolean)
        } else if (typeof data.adventureHooks === 'string') {
          hooks = data.adventureHooks.split('\n').filter(Boolean)
        }
        // Ensure at least 2-3 placeholder hooks if the model didn't return them
        if (hooks.length === 0) {
          hooks = [
            'Explore the hidden ruins beneath the ancient capital for lost treasures.',
            'Investigate the mysterious disappearances at the border town.',
            'Negotiate an alliance between warring factions before the eclipse.',
          ]
        }

        const world: RPGWorld = {
          id: Date.now().toString(),
          title: data.title || 'Untitled World',
          description: data.description || 'A mysterious realm awaits.',
          worldBuilding: data.worldBuilding || '',
          geography: data.geography || '',
          culture: data.culture || '',
          magicSystem: data.magicSystem || '',
          adventureHooks: hooks,
          mood: data.mood || 'mysterious',
          imageUrl: preview,
          createdAt: Date.now(),
        }

        addRPGWorld(world)
        setCurrentWorldId(world.id)
        setExpandedSection('worldBuilding')
        useStore.setState({ isLoading: false })
      }
      reader.readAsDataURL(selectedFile)
    } catch (err) {
      setError('Failed to generate world. Please try again.')
      console.error('RPG generation error:', err)
      useStore.setState({ isLoading: false })
    }
  }

  const copyHook = async (hook: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(hook)
      setCopiedHook(idx)
      setTimeout(() => setCopiedHook(null), 2000)
    } catch {
      // Fallback for environments without clipboard API
      const el = document.createElement('textarea')
      el.value = hook
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopiedHook(idx)
      setTimeout(() => setCopiedHook(null), 2000)
    }
  }

  const startEdit = (world: RPGWorld) => {
    setEditingId(world.id)
    setEditDraft({
      title: world.title,
      description: world.description,
      worldBuilding: world.worldBuilding,
      geography: world.geography ?? '',
      culture: world.culture ?? '',
      magicSystem: world.magicSystem ?? '',
    })
  }

  const saveEdit = () => {
    if (!editingId) return
    updateRPGWorld(editingId, editDraft)
    setEditingId(null)
  }

  const cancelEdit = () => setEditingId(null)

  const confirmDelete = (id: string) => setDeleteConfirmId(id)

  const executeDelete = (id: string) => {
    deleteRPGWorld(id)
    if (currentWorldId === id) {
      const remaining = rpgWorlds.filter(w => w.id !== id)
      setCurrentWorldId(remaining.length > 0 ? remaining[0].id : null)
    }
    setDeleteConfirmId(null)
  }

  const toggleSection = (section: string) =>
    setExpandedSection(prev => (prev === section ? null : section))

  const SECTIONS = [
    { key: 'worldBuilding', label: 'World Overview', icon: BookOpen, field: 'worldBuilding' as keyof EditableFields },
    { key: 'geography', label: 'Geography & Terrain', icon: Map, field: 'geography' as keyof EditableFields },
    { key: 'culture', label: 'Cultures & Factions', icon: Users, field: 'culture' as keyof EditableFields },
    { key: 'magicSystem', label: 'Magic System', icon: Wand2, field: 'magicSystem' as keyof EditableFields },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent flex items-center gap-3">
          <Dice5 size={40} />
          RPG Assistant
        </h1>
        <p className="text-gray-400 text-lg">
          Build immersive fantasy worlds for your D&amp;D campaigns
        </p>
      </motion.div>

      {/* Generator Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 space-y-6"
      >
        <UploadZone
          preview={preview}
          onFileSelect={handleFileSelect}
          isLoading={isLoading}
        />

        {preview && (
          <div className="relative rounded-lg overflow-hidden h-48 bg-dark-800">
            <img src={preview} alt="preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <span className="absolute bottom-3 left-3 text-xs text-amber-300 font-semibold uppercase tracking-widest">
              World Seed Image
            </span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={generateWorld}
          disabled={!selectedFile || isLoading}
          className="w-full px-4 py-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg font-bold text-white hover:shadow-lg hover:shadow-amber-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Forging World…
            </>
          ) : (
            <>
              <Sparkles size={20} />
              Generate World
            </>
          )}
        </button>
      </motion.div>

      {/* Current World Display */}
      <AnimatePresence mode="wait">
        {currentWorld && (
          <motion.div
            key={currentWorld.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* World Header Card */}
            <div className="glass-card p-8 space-y-4">
              <div className="flex items-start justify-between gap-4">
                {editingId === currentWorld.id ? (
                  <input
                    value={editDraft.title}
                    onChange={e => setEditDraft(d => ({ ...d, title: e.target.value }))}
                    className="flex-1 bg-dark-800 text-white text-3xl font-bold px-3 py-1 rounded-lg border border-amber-500/50 focus:outline-none focus:border-amber-500"
                  />
                ) : (
                  <h2 className="text-3xl font-bold text-white flex-1">{currentWorld.title}</h2>
                )}
                <div className="flex gap-2 shrink-0">
                  {editingId === currentWorld.id ? (
                    <>
                      <button onClick={saveEdit} className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/40 text-green-400 transition-colors" title="Save">
                        <Save size={16} />
                      </button>
                      <button onClick={cancelEdit} className="p-2 rounded-lg bg-gray-500/20 hover:bg-gray-500/40 text-gray-400 transition-colors" title="Cancel">
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(currentWorld)} className="p-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/40 text-amber-400 transition-colors" title="Edit world">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => confirmDelete(currentWorld.id)} className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400 transition-colors" title="Delete world">
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {editingId === currentWorld.id ? (
                <textarea
                  value={editDraft.description}
                  onChange={e => setEditDraft(d => ({ ...d, description: e.target.value }))}
                  rows={2}
                  className="w-full bg-dark-800 text-amber-300 italic px-3 py-2 rounded-lg border border-amber-500/50 focus:outline-none focus:border-amber-500 resize-none"
                />
              ) : (
                <p className="text-amber-300 text-lg italic">{currentWorld.description}</p>
              )}

              <div className="flex items-center gap-3">
                <span className="px-3 py-1 text-xs font-semibold uppercase tracking-widest rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {currentWorld.mood}
                </span>
                <span className="text-xs text-gray-500">
                  Created {new Date(currentWorld.createdAt).toLocaleDateString()}
                </span>
              </div>

              {currentWorld.imageUrl && (
                <div className="relative rounded-lg overflow-hidden h-56 bg-dark-800">
                  <img src={currentWorld.imageUrl} alt={currentWorld.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
              )}
            </div>

            {/* Delete Confirmation */}
            <AnimatePresence>
              {deleteConfirmId === currentWorld.id && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass-card p-6 border border-red-500/30 space-y-4"
                >
                  <p className="text-white font-semibold">Delete <span className="text-red-400">"{currentWorld.title}"</span>?</p>
                  <p className="text-gray-400 text-sm">This cannot be undone.</p>
                  <div className="flex gap-3">
                    <button onClick={() => executeDelete(currentWorld.id)} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-sm transition-colors">
                      Delete
                    </button>
                    <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg font-semibold text-sm transition-colors">
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* World Detail Accordion */}
            <div className="space-y-3">
              {SECTIONS.map(({ key, label, icon: Icon, field }) => {
                const content = editingId === currentWorld.id
                  ? editDraft[field]
                  : (currentWorld[field as keyof RPGWorld] as string ?? '')
                const isOpen = expandedSection === key
                return (
                  <div key={key} className="glass-card overflow-hidden">
                    <button
                      onClick={() => toggleSection(key)}
                      className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={18} className="text-amber-400" />
                        <span className="font-semibold text-white">{label}</span>
                      </div>
                      {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 border-t border-white/5">
                            {editingId === currentWorld.id ? (
                              <textarea
                                value={editDraft[field]}
                                onChange={e => setEditDraft(d => ({ ...d, [field]: e.target.value }))}
                                rows={4}
                                className="w-full mt-4 bg-dark-800 text-gray-300 px-3 py-2 rounded-lg border border-amber-500/50 focus:outline-none focus:border-amber-500 resize-none text-sm leading-relaxed"
                              />
                            ) : (
                              <p className="mt-4 text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                                {content || <span className="text-gray-600 italic">No information available.</span>}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>

            {/* Adventure Hooks */}
            <div className="glass-card p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Dice5 size={20} className="text-amber-400" />
                <h3 className="text-lg font-bold text-white">Adventure Hooks</h3>
                <span className="ml-auto text-xs text-gray-500">Click to copy</span>
              </div>
              <div className="space-y-3">
                {(currentWorld.adventureHooks ?? []).map((hook, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.01 }}
                    className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg hover:border-amber-500/50 transition-all cursor-pointer group"
                    onClick={() => copyHook(hook, idx)}
                  >
                    <span className="shrink-0 w-6 h-6 rounded-full bg-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-center mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="flex-1 text-gray-300 text-sm leading-relaxed">{hook}</p>
                    <span className="shrink-0 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {copiedHook === idx ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* All Worlds Grid */}
      {rpgWorlds.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 space-y-4"
        >
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen size={18} className="text-amber-400" />
            Campaign Worlds ({rpgWorlds.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rpgWorlds.map((world) => (
              <motion.div
                key={world.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => { setCurrentWorldId(world.id); setEditingId(null) }}
                className={`relative p-4 rounded-lg border cursor-pointer transition-all group ${
                  currentWorldId === world.id
                    ? 'bg-amber-500/10 border-amber-500/60'
                    : 'bg-dark-800/50 border-amber-500/20 hover:border-amber-500/50'
                }`}
              >
                {world.imageUrl && (
                  <div className="h-24 rounded-md overflow-hidden mb-3 bg-dark-700">
                    <img src={world.imageUrl} alt={world.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <p className="font-semibold text-white truncate">{world.title}</p>
                <p className="text-xs text-amber-400 mt-1 line-clamp-2">{world.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-600">{new Date(world.createdAt).toLocaleDateString()}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); confirmDelete(world.id) }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded text-red-400 hover:bg-red-500/20 transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                {/* Delete confirmation inline for non-current worlds */}
                <AnimatePresence>
                  {deleteConfirmId === world.id && world.id !== currentWorldId && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute inset-0 rounded-lg bg-dark-900/95 flex flex-col items-center justify-center gap-2 p-3"
                    >
                      <p className="text-xs text-white text-center">Delete "{world.title}"?</p>
                      <div className="flex gap-2">
                        <button onClick={() => executeDelete(world.id)} className="px-3 py-1 bg-red-500 text-white rounded text-xs">Delete</button>
                        <button onClick={() => setDeleteConfirmId(null)} className="px-3 py-1 bg-gray-700 text-gray-300 rounded text-xs">Cancel</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
