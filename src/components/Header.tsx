import { motion } from 'framer-motion'
import { Sparkles, Github, Home } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import PaymentButton from './PaymentButton'

export default function Header() {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="sticky top-0 z-50 glass-effect border-b border-white/10 backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="p-2 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-purple">
            <Sparkles className="w-6 h-6 text-dark-950" />
          </div>
          <h1 className="text-2xl font-display font-bold text-white">PixelTale</h1>
        </Link>

        <div className="flex items-center gap-3">
          {!isHome && (
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-white/80 hover:text-white"
            >
              <Home className="w-5 h-5" />
              <span className="hidden sm:inline">Home</span>
            </Link>
          )}

          <div className="hidden md:flex">
            <PaymentButton variant="inline" text="Go Premium" />
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
      </div>
    </motion.header>
  )
}
