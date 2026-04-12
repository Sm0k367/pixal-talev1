import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  BookOpen, Clock, PenTool, Users, Moon, Music, Dice5, Map, Heart, Sparkles 
} from 'lucide-react'
import { Mode } from '../store'

const MODES: Array<{
  id: Mode
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  gradient: string
  status: 'available' | 'coming-soon'
}> = [
  {
    id: 'story',
    name: 'Story Mode',
    description: 'Transform photos into immersive narratives',
    icon: BookOpen,
    color: 'cyan',
    gradient: 'from-cyan-500 to-blue-500',
    status: 'available',
  },
  {
    id: 'lifebook',
    name: 'Life Book',
    description: 'Create your evolving autobiography',
    icon: Clock,
    color: 'purple',
    gradient: 'from-purple-500 to-pink-500',
    status: 'available',
  },
  {
    id: 'comics',
    name: 'Comics Studio',
    description: 'Generate graphic novels from image sequences',
    icon: PenTool,
    color: 'orange',
    gradient: 'from-orange-500 to-yellow-500',
    status: 'available',
  },
  {
    id: 'family-lore',
    name: 'Family Lore',
    description: 'Build multi-generational sagas',
    icon: Users,
    color: 'rose',
    gradient: 'from-rose-500 to-pink-500',
    status: 'available',
  },
  {
    id: 'bedtime',
    name: 'Bedtime Stories',
    description: 'AI-powered stories for children',
    icon: Moon,
    color: 'indigo',
    gradient: 'from-indigo-500 to-purple-500',
    status: 'available',
  },
  {
    id: 'songwriter',
    name: 'Songwriter',
    description: 'Turn photos into songs with AI',
    icon: Music,
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-500',
    status: 'available',
  },
  {
    id: 'rpg',
    name: 'RPG Assistant',
    description: 'World-building for tabletop games',
    icon: Dice5,
    color: 'amber',
    gradient: 'from-amber-500 to-orange-500',
    status: 'available',
  },
  {
    id: 'memory-tapestry',
    name: 'Memory Tapestry',
    description: 'Global interconnected narratives',
    icon: Map,
    color: 'teal',
    gradient: 'from-teal-500 to-cyan-500',
    status: 'available',
  },
  {
    id: 'time-capsule',
    name: 'Time Capsules',
    description: 'AR experiences at specific locations',
    icon: Sparkles,
    color: 'violet',
    gradient: 'from-violet-500 to-purple-500',
    status: 'available',
  },
  {
    id: 'therapy-journal',
    name: 'Healing Journal',
    description: 'Private therapeutic storytelling',
    icon: Heart,
    color: 'red',
    gradient: 'from-red-500 to-pink-500',
    status: 'available',
  },
]

export default function ModeSelector() {
  const navigate = useNavigate()

  const handleModeSelect = (mode: Mode) => {
    navigate(`/mode/${mode}`)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  }

  return (
    <div className="min-h-screen bg-dark-950 py-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-cyan/10 border border-accent-cyan/30 mb-4">
          <Sparkles className="w-4 h-4 text-accent-cyan" />
          <span className="text-sm font-medium text-accent-cyan">PixelTale 1000X</span>
        </div>
        <h1 className="text-6xl md:text-7xl font-display font-bold mb-4 bg-gradient-to-r from-accent-cyan via-accent-purple to-accent-pink bg-clip-text text-transparent">
          Choose Your Story
        </h1>
        <p className="text-xl text-white/60 max-w-3xl mx-auto">
          Transform your creativity with 10 powerful modes. From photos to films, comics to communities, 
          every image becomes infinite possibilities.
        </p>
      </motion.div>

      {/* Modes Grid */}
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
          {MODES.map((mode) => {
            const Icon = mode.icon
            const isAvailable = mode.status === 'available'

            return (
              <motion.div
                key={mode.id}
                variants={itemVariants}
                whileHover={isAvailable ? { y: -8 } : {}}
                className={`group relative h-64 rounded-xl overflow-hidden cursor-pointer transition-all ${
                  isAvailable ? 'hover:shadow-2xl hover:shadow-accent-cyan/20' : 'opacity-50 cursor-not-allowed'
                }`}
                onClick={() => isAvailable && handleModeSelect(mode.id)}
              >
                {/* Background Gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${mode.gradient} opacity-20 group-hover:opacity-30 transition-opacity`}
                />

                {/* Glass Morphism Card */}
                <div
                  className={`absolute inset-0 bg-white/5 backdrop-blur-xl border border-white/10 group-hover:border-white/20 transition-all ${
                    isAvailable ? 'group-hover:bg-white/10' : ''
                  }`}
                />

                {/* Content */}
                <div className="relative h-full p-6 flex flex-col justify-between z-10">
                  {/* Icon & Badge */}
                  <div className="flex items-start justify-between">
                    <div
                      className={`p-3 rounded-lg bg-gradient-to-br ${mode.gradient} text-white`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    {mode.status === 'coming-soon' && (
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/10 text-accent-cyan/80">
                        Coming Soon
                      </span>
                    )}
                  </div>

                  {/* Text */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">{mode.name}</h3>
                    <p className="text-sm text-white/60 line-clamp-2">{mode.description}</p>
                  </div>

                  {/* Hover Arrow */}
                  {isAvailable && (
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center">
                        <span className="text-white text-lg">→</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Shine Effect */}
                {isAvailable && (
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute inset-0 translate-x-full group-hover:translate-x-0 transition-transform duration-500 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Premium Upgrade Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 mb-12"
      >
        <div className="glass-card p-8 border border-accent-cyan/30 text-center space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Unlock Premium</h2>
            <p className="text-white/60">
              Get unlimited generations, exclusive modes, and advanced features
            </p>
          </div>
          <div className="flex flex-wrap gap-4 justify-center text-sm text-white/70">
            <div>✨ Unlimited Stories</div>
            <div>🎨 All Modes Unlocked</div>
            <div>⚡ Priority Processing</div>
            <div>📱 Mobile App Access</div>
          </div>
          <a
            href="https://buy.stripe.com/aFa4gA4Ap7XU9pi5bk0Fi06"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-lg btn-primary font-semibold hover:shadow-lg hover:shadow-accent-cyan/50 transition-all"
          >
            Start Free Trial
            <span>→</span>
          </a>
        </div>
      </motion.div>

      {/* Footer Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 text-center"
      >
        <p className="text-white/40 text-sm">
          All your creations are saved and interconnected. Build a universe of stories.
        </p>
      </motion.div>
    </div>
  )
}
