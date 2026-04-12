import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, Sparkles } from 'lucide-react'
import { useStore, FamilyMember, FamilyLore } from '../store'
import UploadZone from '../components/UploadZone'

export default function FamilyLoreMode() {
  const [title, setTitle] = useState('')
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [currentMemberName, setCurrentMemberName] = useState('')
  const [currentMemberRelation, setCurrentMemberRelation] = useState('')
  const [currentMemberImage, setCurrentMemberImage] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [saga, setSaga] = useState('')

  const { isLoading, addFamilyLore } = useStore()

  const addFamilyMember = (imageUrl: string) => {
    if (!currentMemberName) return

    const newMember: FamilyMember = {
      id: Date.now().toString(),
      name: currentMemberName,
      relation: currentMemberRelation || 'Family Member',
      imageUrl,
    }

    setMembers([...members, newMember])
    setCurrentMemberName('')
    setCurrentMemberRelation('')
    setCurrentMemberImage('')
  }

  const removeMember = (id: string) => {
    setMembers(members.filter(m => m.id !== id))
  }

  const generateFamilySaga = async () => {
    if (!title || members.length === 0 || !currentMemberImage) return

    setIsGenerating(true)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: currentMemberImage.split(',')[1],
          mimeType: 'image/jpeg',
          mode: 'family-lore',
        }),
      })

      if (!response.ok) throw new Error('Generation failed')

      const data = await response.json()
      setSaga(data.saga || data.story || '')

      // Save to store
      const familyLore: FamilyLore = {
        id: Date.now().toString(),
        title,
        members,
        saga: data.saga || data.story || '',
        createdAt: Date.now(),
      }

      addFamilyLore(familyLore)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsGenerating(false)
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

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-3">
            Add Family Members
          </label>
          <div className="space-y-4">
            {/* Upload Image */}
            <UploadZone
              preview={currentMemberImage}
              onFileSelect={(file) => {
                const reader = new FileReader()
                reader.onload = (e) => setCurrentMemberImage(e.target?.result as string)
                reader.readAsDataURL(file)
              }}
              isLoading={false}
            />

            {/* Member Info */}
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                value={currentMemberName}
                onChange={(e) => setCurrentMemberName(e.target.value)}
                placeholder="Member Name"
                className="px-4 py-3 bg-dark-800 border border-rose-500/30 rounded-lg focus:outline-none focus:border-rose-500 text-white placeholder-gray-500"
              />
              <input
                type="text"
                value={currentMemberRelation}
                onChange={(e) => setCurrentMemberRelation(e.target.value)}
                placeholder="Relation (e.g., Great-Grandmother)"
                className="px-4 py-3 bg-dark-800 border border-rose-500/30 rounded-lg focus:outline-none focus:border-rose-500 text-white placeholder-gray-500"
              />
            </div>

            {/* Add Button */}
            <button
              onClick={() => addFamilyMember(currentMemberImage)}
              disabled={!currentMemberName || !currentMemberImage}
              className="w-full px-4 py-3 bg-gradient-to-r from-rose-500 to-pink-500 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-rose-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Plus className="inline-block mr-2" size={20} />
              Add Member
            </button>
          </div>
        </div>

        {/* Family Members List */}
        {members.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-300 mb-4">Family Tree ({members.length})</h3>
            <div className="space-y-3">
              {members.map((member) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 bg-dark-800/50 rounded-lg border border-rose-500/20"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-white">{member.name}</p>
                    <p className="text-sm text-gray-400">{member.relation}</p>
                  </div>
                  <button
                    onClick={() => removeMember(member.id)}
                    className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={generateFamilySaga}
          disabled={!title || members.length === 0 || isGenerating || isLoading}
          className="w-full px-4 py-4 bg-gradient-to-r from-rose-500 to-pink-500 rounded-lg font-bold text-white hover:shadow-lg hover:shadow-rose-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
              Weaving Saga...
            </>
          ) : (
            <>
              <Sparkles className="mr-3" size={20} />
              Generate Family Saga
            </>
          )}
        </button>
      </motion.div>

      {/* Generated Saga */}
      {saga && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 space-y-4"
        >
          <h2 className="text-2xl font-bold text-white">Your Family Saga</h2>
          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{saga}</p>
        </motion.div>
      )}
    </div>
  )
}
