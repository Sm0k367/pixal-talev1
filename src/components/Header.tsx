import { motion } from 'framer-motion'
import { Sparkles, Github } from 'lucide-react'

export default function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="sticky top-0 z-50 glass-effect border-b border-white/10 backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-purple">
            <Sparkles className="w-6 h-6 text-dark-950" />
          </div>
          <h1 className="text-2xl font-display font-bold text-white">PixelTale</h1>
        </div>
        
        <a
          href="https://github.com/Sm0k367/pixal-tale"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-lg btn-secondary"
        >
          <Github className="w-5 h-5" />
          <span className="hidden sm:inline">GitHub</span>
        </a>
      </div>
    </motion.header>
  )
}
