import { motion } from 'framer-motion'
import { Sparkles, BookOpen } from 'lucide-react'
import { Story } from '../store'

interface StoryDisplayProps {
  story: Story
}

export default function StoryDisplay({ story }: StoryDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative glass-effect border border-accent-cyan/30 rounded-2xl overflow-hidden"
    >
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/5 via-transparent to-accent-purple/5" />
      
      {/* Content */}
      <div className="relative z-10 p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-cyan/20 border border-accent-cyan/50 mb-4"
            >
              <BookOpen className="w-4 h-4 text-accent-cyan" />
              <span className="text-xs font-semibold text-accent-cyan uppercase tracking-wider">
                {story.genre}
              </span>
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60"
            >
              {story.title}
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm text-white/50 mt-2 capitalize"
            >
              Mood: {story.mood}
            </motion.p>
          </div>
        </div>

        {/* Story Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <p className="text-lg leading-relaxed text-white/90 font-light">
            {story.story}
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-between pt-4 border-t border-white/10"
        >
          <div className="text-xs text-white/50">
            {new Date(story.createdAt).toLocaleString()}
          </div>
          <div className="text-xs text-accent-cyan/50">
            ~{Math.ceil(story.story.length / 150)} min read
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
