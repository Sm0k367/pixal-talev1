import { motion } from 'framer-motion'
import { useStore } from '../store'

interface Genre {
  id: string
  name: string
  emoji: string
  color: string
}

interface GenreSelectorProps {
  genres: Genre[]
}

export default function GenreSelector({ genres }: GenreSelectorProps) {
  const { selectedGenre, setSelectedGenre } = useStore()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.15 }}
      className="space-y-4"
    >
      <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Choose a Genre</h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {genres.map((genre, idx) => (
          <motion.button
            key={genre.id}
            onClick={() => setSelectedGenre(genre.id)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`relative p-4 rounded-xl transition-all duration-300 group overflow-hidden ${
              selectedGenre === genre.id
                ? 'bg-gradient-to-br ' + genre.color + ' shadow-lg'
                : 'glass-effect border border-white/10 hover:border-white/20'
            }`}
          >
            <div className={`absolute inset-0 ${genre.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
            
            <div className="relative z-10 text-center space-y-2">
              <div className="text-2xl">{genre.emoji}</div>
              <p className={`text-sm font-semibold ${
                selectedGenre === genre.id ? 'text-dark-950' : 'text-white'
              }`}>
                {genre.name}
              </p>
            </div>

            {selectedGenre === genre.id && (
              <motion.div
                layoutId="genre-indicator"
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
