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

// ============ Family Lore Mode ============
export interface FamilyMember {
  id: string
  name: string
  imageUrl?: string
  relation?: string
  bio?: string
}

export interface FamilyLore {
  id: string
  title: string
  members: FamilyMember[]
  saga: string
  createdAt: number
}

// ============ Bedtime Stories Mode ============
export interface BedtimeStory {
  id: string
  title: string
  story: string
  ageGroup: string
  imageUrl: string
  createdAt: number
}

// ============ Songwriter Mode ============
export interface Song {
  id: string
  title: string
  lyrics: string
  genre: string
  imageUrl: string
  mood: string
  createdAt: number
}

// ============ RPG Assistant Mode ============
export interface RPGWorld {
  id: string
  title: string
  description: string
  worldBuilding: string
  imageUrl: string
  createdAt: number
}

// ============ Memory Tapestry Mode ============
export interface Memory {
  id: string
  title: string
  content: string
  imageUrl: string
  tags: string[]
  createdAt: number
}

export interface MemoryTapestry {
  id: string
  title: string
  memories: Memory[]
  createdAt: number
}

// ============ Time Capsule Mode ============
export interface TimeCapsule {
  id: string
  title: string
  content: string
  imageUrl: string
  targetDate: string
  location?: string
  createdAt: number
}

// ============ Healing Journal Mode ============
export interface JournalEntry {
  id: string
  date: string
  content: string
  mood: string
  imageUrl?: string
  createdAt: number
}

export interface HealingJournal {
  id: string
  title: string
  entries: JournalEntry[]
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
  
  // Family Lore Mode
  familyLores: FamilyLore[]
  currentFamilyLore: FamilyLore | null
  setCurrentFamilyLore: (lore: FamilyLore | null) => void
  addFamilyLore: (lore: FamilyLore) => void
  updateFamilyLore: (id: string, updates: Partial<FamilyLore>) => void
  
  // Bedtime Stories Mode
  bedtimeStories: BedtimeStory[]
  addBedtimeStory: (story: BedtimeStory) => void
  
  // Songwriter Mode
  songs: Song[]
  addSong: (song: Song) => void
  
  // RPG Assistant Mode
  rpgWorlds: RPGWorld[]
  addRPGWorld: (world: RPGWorld) => void
  
  // Memory Tapestry Mode
  memoryTapestries: MemoryTapestry[]
  currentMemoryTapestry: MemoryTapestry | null
  setCurrentMemoryTapestry: (tapestry: MemoryTapestry | null) => void
  addMemoryTapestry: (tapestry: MemoryTapestry) => void
  addMemoryToTapestry: (tapestryId: string, memory: Memory) => void
  
  // Time Capsule Mode
  timeCapsules: TimeCapsule[]
  addTimeCapsule: (capsule: TimeCapsule) => void
  
  // Healing Journal Mode
  healingJournals: HealingJournal[]
  currentHealingJournal: HealingJournal | null
  setCurrentHealingJournal: (journal: HealingJournal | null) => void
  addHealingJournal: (journal: HealingJournal) => void
  addJournalEntry: (journalId: string, entry: JournalEntry) => void
  
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
  
  // Family Lore Mode
  familyLores: [],
  currentFamilyLore: null,
  setCurrentFamilyLore: (lore) => set({ currentFamilyLore: lore }),
  addFamilyLore: (lore) => set((state) => ({
    familyLores: [lore, ...state.familyLores],
  })),
  updateFamilyLore: (id, updates) => set((state) => ({
    familyLores: state.familyLores.map(lore => 
      lore.id === id ? { ...lore, ...updates } : lore
    ),
    currentFamilyLore: state.currentFamilyLore?.id === id 
      ? { ...state.currentFamilyLore, ...updates } 
      : state.currentFamilyLore,
  })),
  
  // Bedtime Stories Mode
  bedtimeStories: [],
  addBedtimeStory: (story) => set((state) => ({
    bedtimeStories: [story, ...state.bedtimeStories].slice(0, 50),
  })),
  
  // Songwriter Mode
  songs: [],
  addSong: (song) => set((state) => ({
    songs: [song, ...state.songs].slice(0, 50),
  })),
  
  // RPG Assistant Mode
  rpgWorlds: [],
  addRPGWorld: (world) => set((state) => ({
    rpgWorlds: [world, ...state.rpgWorlds].slice(0, 50),
  })),
  
  // Memory Tapestry Mode
  memoryTapestries: [],
  currentMemoryTapestry: null,
  setCurrentMemoryTapestry: (tapestry) => set({ currentMemoryTapestry: tapestry }),
  addMemoryTapestry: (tapestry) => set((state) => ({
    memoryTapestries: [tapestry, ...state.memoryTapestries],
  })),
  addMemoryToTapestry: (tapestryId, memory) => set((state) => ({
    memoryTapestries: state.memoryTapestries.map(t =>
      t.id === tapestryId ? { ...t, memories: [memory, ...t.memories] } : t
    ),
    currentMemoryTapestry: state.currentMemoryTapestry?.id === tapestryId
      ? { ...state.currentMemoryTapestry, memories: [memory, ...state.currentMemoryTapestry.memories] }
      : state.currentMemoryTapestry,
  })),
  
  // Time Capsule Mode
  timeCapsules: [],
  addTimeCapsule: (capsule) => set((state) => ({
    timeCapsules: [capsule, ...state.timeCapsules].slice(0, 50),
  })),
  
  // Healing Journal Mode
  healingJournals: [],
  currentHealingJournal: null,
  setCurrentHealingJournal: (journal) => set({ currentHealingJournal: journal }),
  addHealingJournal: (journal) => set((state) => ({
    healingJournals: [journal, ...state.healingJournals],
  })),
  addJournalEntry: (journalId, entry) => set((state) => ({
    healingJournals: state.healingJournals.map(j =>
      j.id === journalId ? { ...j, entries: [entry, ...j.entries] } : j
    ),
    currentHealingJournal: state.currentHealingJournal?.id === journalId
      ? { ...state.currentHealingJournal, entries: [entry, ...state.currentHealingJournal.entries] }
      : state.currentHealingJournal,
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
    familyLores: [],
    currentFamilyLore: null,
    bedtimeStories: [],
    songs: [],
    rpgWorlds: [],
    memoryTapestries: [],
    currentMemoryTapestry: null,
    timeCapsules: [],
    healingJournals: [],
    currentHealingJournal: null,
    isLoading: false,
  }),
}))
