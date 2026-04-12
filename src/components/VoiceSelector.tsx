import { motion } from 'framer-motion'
import { Volume2 } from 'lucide-react'
import { useStore } from '../store'

interface Voice {
  id: string
  name: string
  description: string
  color: string
}

interface VoiceSelectorProps {
  voices: Voice[]
}

const colorMap: Record<string, string> = {
  cyan: 'from-cyan-500 to-blue-500',
  purple: 'from-purple-500 to-pink-500',
  pink: 'from-pink-500 to-rose-500',
  amber: 'from-amber-500 to-orange-500',
}

export default function VoiceSelector({ voices }: VoiceSelectorProps) {
  const { selectedVoice, setSelectedVoice } = useStore()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <Volume2 className="w-4 h-4 text-accent-cyan" />
        <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Narrator Voice</h2>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {voices.map((voice, idx) => (
          <motion.button
            key={voice.id}
            onClick={() => setSelectedVoice(voice.id)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`relative p-4 rounded-xl transition-all duration-300 group overflow-hidden ${
              selectedVoice === voice.id
                ? `bg-gradient-to-br ${colorMap[voice.color]} shadow-lg`
                : 'glass-effect border border-white/10 hover:border-white/20'
            }`}
          >
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
            
            <div className="relative z-10 space-y-1">
              <div className="text-2xl">🎙️</div>
              <p className={`text-sm font-semibold ${
                selectedVoice === voice.id ? 'text-white' : 'text-white'
              }`}>
                {voice.name}
              </p>
              <p className={`text-xs ${
                selectedVoice === voice.id ? 'text-white/80' : 'text-white/50'
              }`}>
                {voice.description}
              </p>
            </div>

            {selectedVoice === voice.id && (
              <motion.div
                layoutId="voice-indicator"
                className="absolute inset-0 rounded-xl border-2 border-white/30"
                initial={false}
              />
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}
