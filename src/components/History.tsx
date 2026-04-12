import { motion } from 'framer-motion'
import { History as HistoryIcon } from 'lucide-react'
import { useStore, Story } from '../store'

interface HistoryProps {
  stories: Story[]
}

export default function History({ stories }: HistoryProps) {
  const { setCurrentStory } = useStore()

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="sticky top-24 glass-effect border border-white/10 rounded-2xl p-6 max-h-[calc(100vh-150px)] overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <HistoryIcon className="w-5 h-5 text-accent-cyan" />
          <h3 className="text-lg font-semibold text-white">Story Archive</h3>
        </div>
      </div>

      {stories.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-white/50 text-sm">
            No stories yet. Generate your first one!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {stories.map((story, idx) => (
            <motion.button
              key={story.id}
              onClick={() => setCurrentStory(story)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.02, x: 4 }}
              className="w-full text-left p-4 rounded-lg bg-white/5 border border-white/10 hover:border-accent-cyan/50 hover:bg-white/10 transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl flex-shrink-0 mt-1">
                  {story.genre === 'cinematic' && '🎬'}
                  {story.genre === 'fantasy' && '⚔️'}
                  {story.genre === 'mystery' && '🔍'}
                  {story.genre === 'romance' && '💕'}
                  {story.genre === 'horror' && '👻'}
                  {story.genre === 'adventure' && '🏔️'}
                  {story.genre === 'bedtime' && '🌙'}
                  {story.genre === 'scifi' && '🚀'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate group-hover:text-accent-cyan transition-colors">
                    {story.title}
                  </p>
                  <p className="text-xs text-white/50 mt-1">
                    {new Date(story.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </motion.div>
  )
}
