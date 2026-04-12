import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from './store'
import Header from './components/Header'
import ModeSelector from './components/ModeSelector'
import StoryMode from './modes/StoryMode'
import LifeBookMode from './modes/LifeBookMode'
import ComicsMode from './modes/ComicsMode'
import FamilyLoreMode from './modes/FamilyLoreMode'
import BedtimeStoriesMode from './modes/BedtimeStoriesMode'
import SongwriterMode from './modes/SongwriterMode'
import RPGAssistantMode from './modes/RPGAssistantMode'
import MemoryTapestryMode from './modes/MemoryTapestryMode'
import TimeCapsuleMode from './modes/TimeCapsuleMode'
import HealingJournalMode from './modes/HealingJournalMode'
import History from './components/History'

function ModeRouter() {
  const location = useLocation()
  const { currentMode, setCurrentMode, storyHistory } = useStore()

  useEffect(() => {
    const pathMatch = location.pathname.match(/^\/mode\/(.+)$/)
    if (pathMatch) {
      const mode = pathMatch[1] as any
      setCurrentMode(mode)
    }
  }, [location.pathname, setCurrentMode])

  return (
    <div className="min-h-screen bg-dark-950">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatePresence mode="wait">
          <div key={location.pathname} className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Routes location={location}>
                <Route index element={<ModeSelector />} />
                <Route path="/mode/story" element={<StoryMode />} />
                <Route path="/mode/lifebook" element={<LifeBookMode />} />
                <Route path="/mode/comics" element={<ComicsMode />} />
                <Route path="/mode/family-lore" element={<FamilyLoreMode />} />
                <Route path="/mode/bedtime" element={<BedtimeStoriesMode />} />
                <Route path="/mode/songwriter" element={<SongwriterMode />} />
                <Route path="/mode/rpg" element={<RPGAssistantMode />} />
                <Route path="/mode/memory-tapestry" element={<MemoryTapestryMode />} />
                <Route path="/mode/time-capsule" element={<TimeCapsuleMode />} />
                <Route path="/mode/therapy-journal" element={<HealingJournalMode />} />
              </Routes>
            </div>

            {/* Sidebar - History (only show on story mode) */}
            {currentMode === 'story' && storyHistory.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="lg:col-span-1"
              >
                <History stories={storyHistory} />
              </motion.div>
            )}
          </div>
        </AnimatePresence>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <ModeRouter />
    </Router>
  )
}
