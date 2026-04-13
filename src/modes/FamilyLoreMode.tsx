import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Sparkles, Users, User, AlertCircle } from 'lucide-react'
import { useStore, FamilyMember, FamilyLore } from '../store'
import UploadZone from '../components/UploadZone'

const RELATION_OPTIONS = [
  'Great-Grandparent',
  'Ancestor',
  'Grandparent',
  'Parent',
  'Self',
  'Sibling',
  'Spouse/Partner',
  'Child',
  'Grandchild',
  'Aunt/Uncle',
  'Cousin',
  'Niece/Nephew',
  'Family Member',
]

export default function FamilyLoreMode() {
  const [title, setTitle] = useState('')
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [currentMemberName, setCurrentMemberName] = useState('')
  const [currentMemberRelation, setCurrentMemberRelation] = useState('')
  const [currentMemberImage, setCurrentMemberImage] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [saga, setSaga] = useState('')
  const [sagaTitle, setSagaTitle] = useState('')
  const [sagaMood, setSagaMood] = useState('')
  const [nameError, setNameError] = useState('')
  const [generateError, setGenerateError] = useState('')
  const [savedToStore, setSavedToStore] = useState(false)

  const { isLoading, addFamilyLore, familyLores } = useStore()

  const validateMemberName = (name: string) => {
    if (!name.trim()) {
      setNameError('Member name is required')
      return false
    }
    if (name.trim().length < 2) {
      setNameError('Name must be at least 2 characters')
      return false
    }
    if (members.some(m => m.name.toLowerCase() === name.trim().toLowerCase())) {
      setNameError('A member with this name already exists')
      return false
    }
    setNameError('')
    return true
  }

  const addFamilyMember = () => {
    if (!validateMemberName(currentMemberName)) return

    const newMember: FamilyMember = {
      id: Date.now().toString(),
      name: currentMemberName.trim(),
      relation: currentMemberRelation || 'Family Member',
      imageUrl: currentMemberImage || undefined,
    }

    setMembers(prev => [...prev, newMember])
    setCurrentMemberName('')
    setCurrentMemberRelation('')
    setCurrentMemberImage('')
    setNameError('')
  }

  const removeMember = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id))
    // Clear saga if members change
    if (saga) {
      setSaga('')
      setSagaTitle('')
      setSagaMood('')
      setSavedToStore(false)
    }
  }

  // Find an image from any member to use for generation
  const getMemberImageForGeneration = (): string | null => {
    const memberWithImage = members.find(m => m.imageUrl)
    return memberWithImage?.imageUrl || null
  }

  const generateFamilySaga = async () => {
    if (!title.trim()) {
      setGenerateError('Please enter a family saga title')
      return
    }
    if (members.length === 0) {
      setGenerateError('Please add at least one family member')
      return
    }

    const imageForGeneration = getMemberImageForGeneration()
    if (!imageForGeneration) {
      setGenerateError('Please upload an image for at least one family member')
      return
    }

    setGenerateError('')
    setIsGenerating(true)
    setSavedToStore(false)

    try {
      // Build a custom prompt that includes all family members
      const memberList = members
        .map(m => `${m.name} (${m.relation})`)
        .join(', ')

      const customPrompt = `You are a master genealogist and family historian. Based on this image, craft a multi-generational family saga (150-200 words). 
The family members are: ${memberList}.
Weave a narrative that connects these generations, their relationships, and shared heritage. Include their roles, legacy, and the bonds between generations.
Return ONLY JSON: { "title": "family saga title", "saga": "text connecting all family members across generations", "mood": "one word" }`

      // Extract base64 from data URL
      const base64Data = imageForGeneration.includes(',')
        ? imageForGeneration.split(',')[1]
        : imageForGeneration

      const mimeMatch = imageForGeneration.match(/data:([^;]+);/)
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg'

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType,
          mode: 'family-lore',
          prompt: customPrompt,
        }),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || `Generation failed: ${response.status}`)
      }

      const data = await response.json()
      const generatedSaga = data.saga || data.story || data.content || ''
      const generatedTitle = data.title || title
      const generatedMood = data.mood || 'heartfelt'

      setSaga(generatedSaga)
      setSagaTitle(generatedTitle)
      setSagaMood(generatedMood)

      // Save to store
      const familyLore: FamilyLore = {
        id: Date.now().toString(),
        title,
        members,
        saga: generatedSaga,
        createdAt: Date.now(),
      }

      addFamilyLore(familyLore)
      setSavedToStore(true)
    } catch (error) {
      console.error('Error generating family saga:', error)
      setGenerateError(error instanceof Error ? error.message : 'Generation failed. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const canGenerate = title.trim() && members.length > 0 && getMemberImageForGeneration() !== null

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
          Family Lore
        </h1>
        <p className="text-gray-400 text-lg">
          Weave multi-generational stories connecting past and present
        </p>
      </motion.div>

      {/* Family Tree Setup */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 space-y-6"
      >
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-3">
            Family Saga Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., 'The Anderson Legacy'"
            className="w-full px-4 py-3 bg-dark-800 border border-rose-500/30 rounded-lg focus:outline-none focus:border-rose-500 text-white placeholder-gray-500"
          />
        </div>

        {/* Add Family Member Form */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-3">
            Add Family Member
          </label>
          <div className="space-y-4 p-4 border border-rose-500/20 rounded-xl bg-dark-800/30">
            {/* Image Upload for Member */}
            <div>
              <p className="text-xs text-gray-400 mb-2">Member Photo (optional — at least one member needs a photo to generate)</p>
              <UploadZone
                preview={currentMemberImage}
                onFileSelect={(file) => {
                  const reader = new FileReader()
                  reader.onload = (e) => setCurrentMemberImage(e.target?.result as string)
                  reader.readAsDataURL(file)
                }}
                isLoading={false}
              />
            </div>

            {/* Member Info Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  value={currentMemberName}
                  onChange={(e) => {
                    setCurrentMemberName(e.target.value)
                    if (nameError) setNameError('')
                  }}
                  placeholder="Member Name *"
                  className={`w-full px-4 py-3 bg-dark-800 border rounded-lg focus:outline-none text-white placeholder-gray-500 ${
                    nameError ? 'border-red-500 focus:border-red-500' : 'border-rose-500/30 focus:border-rose-500'
                  }`}
                />
                {nameError && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {nameError}
                  </p>
                )}
              </div>

              {/* Relation Dropdown */}
              <div>
                <select
                  value={currentMemberRelation}
                  onChange={(e) => setCurrentMemberRelation(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-800 border border-rose-500/30 rounded-lg focus:outline-none focus:border-rose-500 text-white appearance-none cursor-pointer"
                >
                  <option value="" className="bg-dark-800 text-gray-400">Select Relation...</option>
                  {RELATION_OPTIONS.map(rel => (
                    <option key={rel} value={rel} className="bg-dark-800 text-white">{rel}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Add Member Button */}
            <button
              onClick={addFamilyMember}
              disabled={!currentMemberName.trim()}
              className="w-full px-4 py-3 bg-gradient-to-r from-rose-500 to-pink-500 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-rose-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              data-testid="add-member-button"
            >
              <Plus size={20} />
              Add Family Member
            </button>
          </div>
        </div>

        {/* Family Tree Display */}
        <AnimatePresence>
          {members.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              data-testid="family-tree"
            >
              <div className="flex items-center gap-2 mb-4">
                <Users size={18} className="text-rose-400" />
                <h3 className="text-lg font-semibold text-gray-300">
                  Family Tree ({members.length} member{members.length !== 1 ? 's' : ''})
                </h3>
              </div>

              {/* Visual Family Tree */}
              <div className="relative">
                {/* Tree connection lines */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {members.map((member, index) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative flex flex-col items-center p-4 bg-dark-800/50 rounded-xl border border-rose-500/20 hover:border-rose-500/40 transition-colors group"
                      data-testid={`member-card-${member.id}`}
                    >
                      {/* Member Image */}
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-rose-500/30 mb-3 flex-shrink-0 bg-dark-700">
                        {member.imageUrl ? (
                          <img
                            src={member.imageUrl}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-500/20 to-pink-500/20">
                            <User size={24} className="text-rose-400" />
                          </div>
                        )}
                      </div>

                      {/* Member Info */}
                      <div className="text-center flex-1 w-full">
                        <p className="font-semibold text-white text-sm truncate" title={member.name}>
                          {member.name}
                        </p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-rose-500/20 text-rose-300 text-xs rounded-full">
                          {member.relation}
                        </span>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={() => removeMember(member.id)}
                        className="absolute top-2 right-2 p-1.5 text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 rounded-lg transition-all"
                        title="Remove member"
                        data-testid={`delete-member-${member.id}`}
                      >
                        <Trash2 size={14} />
                      </button>

                      {/* Tree connector */}
                      {index < members.length - 1 && (
                        <div className="hidden lg:block absolute -right-2 top-1/2 w-4 h-0.5 bg-rose-500/30" />
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Generation indicator */}
                {!getMemberImageForGeneration() && members.length > 0 && (
                  <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-2">
                    <AlertCircle size={16} className="text-amber-400 flex-shrink-0" />
                    <p className="text-amber-300 text-sm">
                      Upload a photo for at least one member to generate the family saga
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generate Error */}
        {generateError && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2">
            <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
            <p className="text-red-300 text-sm">{generateError}</p>
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={generateFamilySaga}
          disabled={!canGenerate || isGenerating || isLoading}
          className="w-full px-4 py-4 bg-gradient-to-r from-rose-500 to-pink-500 rounded-lg font-bold text-white hover:shadow-lg hover:shadow-rose-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
          data-testid="generate-saga-button"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
              Weaving Family Saga...
            </>
          ) : (
            <>
              <Sparkles className="mr-3" size={20} />
              Generate Family Saga
            </>
          )}
        </button>

        {/* Save Confirmation */}
        <AnimatePresence>
          {savedToStore && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-center"
              data-testid="saved-confirmation"
            >
              <p className="text-green-300 text-sm font-semibold">
                ✓ Family lore saved! ({familyLores.length} saga{familyLores.length !== 1 ? 's' : ''} in your collection)
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Generated Saga */}
      <AnimatePresence>
        {saga && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card p-8 space-y-4"
            data-testid="saga-output"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">{sagaTitle || title}</h2>
                {sagaMood && (
                  <span className="inline-block mt-1 px-3 py-1 bg-rose-500/20 text-rose-300 text-sm rounded-full capitalize">
                    {sagaMood}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-rose-400 flex-shrink-0">
                <Users size={18} />
                <span className="text-sm font-semibold">{members.length} members</span>
              </div>
            </div>

            <div className="border-t border-rose-500/20 pt-4">
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{saga}</p>
            </div>

            {/* Member summary in saga */}
            <div className="border-t border-rose-500/20 pt-4">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Family Members in this Saga</p>
              <div className="flex flex-wrap gap-2">
                {members.map(m => (
                  <span
                    key={m.id}
                    className="px-2 py-1 bg-rose-500/10 text-rose-300 text-xs rounded-full border border-rose-500/20"
                  >
                    {m.name} · {m.relation}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Saved Family Lores History */}
      {familyLores.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-6 space-y-4"
          data-testid="family-lores-history"
        >
          <h3 className="text-lg font-semibold text-gray-300 flex items-center gap-2">
            <Users size={18} className="text-rose-400" />
            Saved Family Sagas ({familyLores.length})
          </h3>
          <div className="space-y-3">
            {familyLores.map(lore => (
              <div
                key={lore.id}
                className="p-3 bg-dark-800/50 rounded-lg border border-rose-500/20 flex items-center justify-between"
                data-testid={`lore-history-${lore.id}`}
              >
                <div>
                  <p className="font-semibold text-white text-sm">{lore.title}</p>
                  <p className="text-xs text-gray-400">
                    {lore.members.length} members · {new Date(lore.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
