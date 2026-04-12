import { create } from 'zustand'

// ============ Story Mode ============
export interface Story {
  id: string
  title: string
  mood: string
  story: string
  genre: string
  imageUrl: string
  createdAt: number
}

// ============ LifeBook Mode ============
export interface LifeBookChapter {
  id: string
  title: string
  date: string
  imageUrl?: string
  content: string
  mood: string
}

export interface LifeBook {
  id: string
  title: string
  description?: string
  chapters: LifeBookChapter[]
  createdAt: number
  updatedAt: number
}

// ============ Comics Mode ============
export interface ComicsPanel {
  id: string
  imageUrl: string
  dialogue: string
  caption?: string
  mood: string
}

export interface ComicsSequence {
  id: string
  title: string
  description?: string
  panels: ComicsPanel[]
  createdAt: number
}

// ============ Mode Type ============
export type Mode = 'story' | 'lifebook' | 'comics' | 'family-lore' | 'bedtime' | 'songwriter' | 'rpg' | 'memory-tapestry' | 'time-capsule' | 'therapy-journal'

interface UIState {
  // Current Mode
  currentMode: Mode
  setCurrentMode: (mode: Mode) => void
  
  // Story Mode
  selectedGenre: string
  selectedVoice: string
  setSelectedGenre: (genre: string) => void
  setSelectedVoice: (voice: string) => void
  currentStory: Story | null
  setCurrentStory: (story: Story | null) => void
  storyHistory: Story[]
  addStoryToHistory: (story: Story) => void
  
  // LifeBook Mode
  lifeBooks: LifeBook[]
  currentLifeBook: LifeBook | null
  setCurrentLifeBook: (book: LifeBook | null) => void
  addLifeBook: (book: LifeBook) => void
  updateLifeBook: (id: string, updates: Partial<LifeBook>) => void
  
  // Comics Mode
  comicsSequences: ComicsSequence[]
  currentComicsSequence: ComicsSequence | null
  setCurrentComicsSequence: (seq: ComicsSequence | null) => void
  addComicsSequence: (seq: ComicsSequence) => void
  updateComicsSequence: (id: string, updates: Partial<ComicsSequence>) => void
  
  // Global Loading State
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  
  // Clear All Data
  clearAllData: () => void
}

export const useStore = create<UIState>((set) => ({
  // Current Mode
  currentMode: 'story',
  setCurrentMode: (mode) => set({ currentMode: mode }),
  
  // Story Mode
  selectedGenre: 'cinematic',
  selectedVoice: 'nova',
  setSelectedGenre: (genre) => set({ selectedGenre: genre }),
  setSelectedVoice: (voice) => set({ selectedVoice: voice }),
  currentStory: null,
  setCurrentStory: (story) => set({ currentStory: story }),
  storyHistory: [],
  addStoryToHistory: (story) => set((state) => ({
    storyHistory: [story, ...state.storyHistory].slice(0, 50),
  })),
  
  // LifeBook Mode
  lifeBooks: [],
  currentLifeBook: null,
  setCurrentLifeBook: (book) => set({ currentLifeBook: book }),
  addLifeBook: (book) => set((state) => ({
    lifeBooks: [book, ...state.lifeBooks],
  })),
  updateLifeBook: (id, updates) => set((state) => ({
    lifeBooks: state.lifeBooks.map(book => 
      book.id === id ? { ...book, ...updates, updatedAt: Date.now() } : book
    ),
    currentLifeBook: state.currentLifeBook?.id === id 
      ? { ...state.currentLifeBook, ...updates, updatedAt: Date.now() } 
      : state.currentLifeBook,
  })),
  
  // Comics Mode
  comicsSequences: [],
  currentComicsSequence: null,
  setCurrentComicsSequence: (seq) => set({ currentComicsSequence: seq }),
  addComicsSequence: (seq) => set((state) => ({
    comicsSequences: [seq, ...state.comicsSequences],
  })),
  updateComicsSequence: (id, updates) => set((state) => ({
    comicsSequences: state.comicsSequences.map(seq => 
      seq.id === id ? { ...seq, ...updates } : seq
    ),
    currentComicsSequence: state.currentComicsSequence?.id === id 
      ? { ...state.currentComicsSequence, ...updates } 
      : state.currentComicsSequence,
  })),
  
  // Global Loading
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  // Clear All
  clearAllData: () => set({
    currentMode: 'story',
    selectedGenre: 'cinematic',
    selectedVoice: 'nova',
    currentStory: null,
    storyHistory: [],
    lifeBooks: [],
    currentLifeBook: null,
    comicsSequences: [],
    currentComicsSequence: null,
    isLoading: false,
  }),
}))
