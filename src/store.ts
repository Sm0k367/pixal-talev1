import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

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
  mood: string
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
  geography?: string
  culture?: string
  magicSystem?: string
  adventureHooks?: string[]
  mood: string
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
  message?: string
  createdAt: number
}

// ============ Healing Journal Mode ============
export interface JournalEntry {
  id: string
  date: string
  content: string
  mood: string
  title?: string
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
  currentMode: Mode
  setCurrentMode: (mode: Mode) => void

  selectedGenre: string
  selectedVoice: string
  setSelectedGenre: (genre: string) => void
  setSelectedVoice: (voice: string) => void
  currentStory: Story | null
  setCurrentStory: (story: Story | null) => void
  storyHistory: Story[]
  addStoryToHistory: (story: Story) => void

  lifeBooks: LifeBook[]
  currentLifeBook: LifeBook | null
  setCurrentLifeBook: (book: LifeBook | null) => void
  addLifeBook: (book: LifeBook) => void
  updateLifeBook: (id: string, updates: Partial<LifeBook>) => void
  deleteLifeBook: (id: string) => void
  deleteChapter: (bookId: string, chapterId: string) => void
  updateChapter: (bookId: string, chapterId: string, updates: Partial<LifeBookChapter>) => void

  comicsSequences: ComicsSequence[]
  currentComicsSequence: ComicsSequence | null
  setCurrentComicsSequence: (seq: ComicsSequence | null) => void
  addComicsSequence: (seq: ComicsSequence) => void
  updateComicsSequence: (id: string, updates: Partial<ComicsSequence>) => void

  familyLores: FamilyLore[]
  currentFamilyLore: FamilyLore | null
  setCurrentFamilyLore: (lore: FamilyLore | null) => void
  addFamilyLore: (lore: FamilyLore) => void
  updateFamilyLore: (id: string, updates: Partial<FamilyLore>) => void
  deleteFamilyLore: (id: string) => void

  bedtimeStories: BedtimeStory[]
  addBedtimeStory: (story: BedtimeStory) => void
  deleteBedtimeStory: (id: string) => void

  songs: Song[]
  addSong: (song: Song) => void
  updateSong: (id: string, updates: Partial<Song>) => void
  deleteSong: (id: string) => void

  rpgWorlds: RPGWorld[]
  addRPGWorld: (world: RPGWorld) => void
  updateRPGWorld: (id: string, updates: Partial<RPGWorld>) => void
  deleteRPGWorld: (id: string) => void

  memoryTapestries: MemoryTapestry[]
  currentMemoryTapestry: MemoryTapestry | null
  setCurrentMemoryTapestry: (tapestry: MemoryTapestry | null) => void
  addMemoryTapestry: (tapestry: MemoryTapestry) => void
  addMemoryToTapestry: (tapestryId: string, memory: Memory) => void
  updateMemoryInTapestry: (tapestryId: string, memory: Memory) => void
  deleteMemoryFromTapestry: (tapestryId: string, memoryId: string) => void

  timeCapsules: TimeCapsule[]
  addTimeCapsule: (capsule: TimeCapsule) => void
  deleteTimeCapsule: (id: string) => void

  healingJournals: HealingJournal[]
  currentHealingJournal: HealingJournal | null
  setCurrentHealingJournal: (journal: HealingJournal | null) => void
  addHealingJournal: (journal: HealingJournal) => void
  deleteHealingJournal: (id: string) => void
  addJournalEntry: (journalId: string, entry: JournalEntry) => void
  updateJournalEntry: (journalId: string, entryId: string, updates: Partial<JournalEntry>) => void
  deleteJournalEntry: (journalId: string, entryId: string) => void

  isLoading: boolean
  setIsLoading: (loading: boolean) => void

  clearAllData: () => void
}

export const useStore = create<UIState>()(persist((set) => ({
  currentMode: 'story',
  setCurrentMode: (mode) => set({ currentMode: mode }),

  selectedGenre: 'cinematic',
  selectedVoice: 'nova',
  setSelectedGenre: (genre) => set({ selectedGenre: genre }),
  setSelectedVoice: (voice) => set({ selectedVoice: voice }),
  currentStory: null,
  setCurrentStory: (story) => set({ currentStory: story }),
  storyHistory: [],
  addStoryToHistory: (story) =>
    set((state) => ({ storyHistory: [story, ...state.storyHistory].slice(0, 50) })),

  lifeBooks: [],
  currentLifeBook: null,
  setCurrentLifeBook: (book) => set({ currentLifeBook: book }),
  addLifeBook: (book) => set((state) => ({ lifeBooks: [book, ...state.lifeBooks] })),
  updateLifeBook: (id, updates) =>
    set((state) => ({
      lifeBooks: state.lifeBooks.map((b) =>
        b.id === id ? { ...b, ...updates, updatedAt: Date.now() } : b
      ),
      currentLifeBook:
        state.currentLifeBook?.id === id
          ? { ...state.currentLifeBook, ...updates, updatedAt: Date.now() }
          : state.currentLifeBook,
    })),
  deleteLifeBook: (id) =>
    set((state) => ({
      lifeBooks: state.lifeBooks.filter((b) => b.id !== id),
      currentLifeBook: state.currentLifeBook?.id === id ? null : state.currentLifeBook,
    })),
  deleteChapter: (bookId, chapterId) =>
    set((state) => {
      const mapBook = (b: LifeBook) =>
        b.id === bookId
          ? { ...b, chapters: b.chapters.filter((c) => c.id !== chapterId), updatedAt: Date.now() }
          : b
      return {
        lifeBooks: state.lifeBooks.map(mapBook),
        currentLifeBook: state.currentLifeBook ? mapBook(state.currentLifeBook) : null,
      }
    }),
  updateChapter: (bookId, chapterId, updates) =>
    set((state) => {
      const mapBook = (b: LifeBook) =>
        b.id === bookId
          ? {
              ...b,
              chapters: b.chapters.map((c) => (c.id === chapterId ? { ...c, ...updates } : c)),
              updatedAt: Date.now(),
            }
          : b
      return {
        lifeBooks: state.lifeBooks.map(mapBook),
        currentLifeBook: state.currentLifeBook ? mapBook(state.currentLifeBook) : null,
      }
    }),

  comicsSequences: [],
  currentComicsSequence: null,
  setCurrentComicsSequence: (seq) => set({ currentComicsSequence: seq }),
  addComicsSequence: (seq) => set((state) => ({ comicsSequences: [seq, ...state.comicsSequences] })),
  updateComicsSequence: (id, updates) =>
    set((state) => ({
      comicsSequences: state.comicsSequences.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      currentComicsSequence:
        state.currentComicsSequence?.id === id
          ? { ...state.currentComicsSequence, ...updates }
          : state.currentComicsSequence,
    })),

  familyLores: [],
  currentFamilyLore: null,
  setCurrentFamilyLore: (lore) => set({ currentFamilyLore: lore }),
  addFamilyLore: (lore) => set((state) => ({ familyLores: [lore, ...state.familyLores] })),
  updateFamilyLore: (id, updates) =>
    set((state) => ({
      familyLores: state.familyLores.map((l) => (l.id === id ? { ...l, ...updates } : l)),
      currentFamilyLore:
        state.currentFamilyLore?.id === id
          ? { ...state.currentFamilyLore, ...updates }
          : state.currentFamilyLore,
    })),
  deleteFamilyLore: (id) =>
    set((state) => ({
      familyLores: state.familyLores.filter((l) => l.id !== id),
      currentFamilyLore: state.currentFamilyLore?.id === id ? null : state.currentFamilyLore,
    })),

  bedtimeStories: [],
  addBedtimeStory: (story) =>
    set((state) => ({ bedtimeStories: [story, ...state.bedtimeStories].slice(0, 50) })),
  deleteBedtimeStory: (id) =>
    set((state) => ({ bedtimeStories: state.bedtimeStories.filter((s) => s.id !== id) })),

  songs: [],
  addSong: (song) => set((state) => ({ songs: [song, ...state.songs].slice(0, 50) })),
  updateSong: (id, updates) => set((state) => ({
    songs: state.songs.map(s => s.id === id ? { ...s, ...updates } : s),
  })),
  deleteSong: (id) => set((state) => ({
    songs: state.songs.filter(s => s.id !== id),
  })),

  rpgWorlds: [],
  addRPGWorld: (world) => set((state) => ({ rpgWorlds: [world, ...state.rpgWorlds].slice(0, 50) })),
  updateRPGWorld: (id, updates) =>
    set((state) => ({ rpgWorlds: state.rpgWorlds.map((w) => (w.id === id ? { ...w, ...updates } : w)) })),
  deleteRPGWorld: (id) =>
    set((state) => ({ rpgWorlds: state.rpgWorlds.filter((w) => w.id !== id) })),

  memoryTapestries: [],
  currentMemoryTapestry: null,
  setCurrentMemoryTapestry: (tapestry) => set({ currentMemoryTapestry: tapestry }),
  addMemoryTapestry: (tapestry) =>
    set((state) => ({ memoryTapestries: [tapestry, ...state.memoryTapestries] })),
  addMemoryToTapestry: (tapestryId, memory) =>
    set((state) => ({
      memoryTapestries: state.memoryTapestries.map((t) =>
        t.id === tapestryId ? { ...t, memories: [memory, ...t.memories] } : t
      ),
      currentMemoryTapestry:
        state.currentMemoryTapestry?.id === tapestryId
          ? { ...state.currentMemoryTapestry, memories: [memory, ...state.currentMemoryTapestry.memories] }
          : state.currentMemoryTapestry,
    })),
  updateMemoryInTapestry: (tapestryId, memory) =>
    set((state) => ({
      memoryTapestries: state.memoryTapestries.map((t) =>
        t.id === tapestryId
          ? {
              ...t,
              memories: t.memories.map((m) => (m.id === memory.id ? memory : m)),
            }
          : t
      ),
      currentMemoryTapestry:
        state.currentMemoryTapestry?.id === tapestryId
          ? {
              ...state.currentMemoryTapestry,
              memories: state.currentMemoryTapestry.memories.map((m) => (m.id === memory.id ? memory : m)),
            }
          : state.currentMemoryTapestry,
    })),
  deleteMemoryFromTapestry: (tapestryId, memoryId) =>
    set((state) => ({
      memoryTapestries: state.memoryTapestries.map((t) =>
        t.id === tapestryId
          ? {
              ...t,
              memories: t.memories.filter((m) => m.id !== memoryId),
            }
          : t
      ),
      currentMemoryTapestry:
        state.currentMemoryTapestry?.id === tapestryId
          ? {
              ...state.currentMemoryTapestry,
              memories: state.currentMemoryTapestry.memories.filter((m) => m.id !== memoryId),
            }
          : state.currentMemoryTapestry,
    })),

  timeCapsules: [],
  addTimeCapsule: (capsule) =>
    set((state) => ({ timeCapsules: [capsule, ...state.timeCapsules].slice(0, 50) })),
  deleteTimeCapsule: (id) =>
    set((state) => ({ timeCapsules: state.timeCapsules.filter((c) => c.id !== id) })),

  healingJournals: [],
  currentHealingJournal: null,
  setCurrentHealingJournal: (journal) => set({ currentHealingJournal: journal }),
  addHealingJournal: (journal) =>
    set((state) => ({ healingJournals: [journal, ...state.healingJournals] })),
  deleteHealingJournal: (id) =>
    set((state) => ({ 
      healingJournals: state.healingJournals.filter((j) => j.id !== id),
      currentHealingJournal: state.currentHealingJournal?.id === id ? null : state.currentHealingJournal,
    })),
  addJournalEntry: (journalId, entry) =>
    set((state) => ({
      healingJournals: state.healingJournals.map((j) =>
        j.id === journalId ? { ...j, entries: [entry, ...j.entries] } : j
      ),
      currentHealingJournal:
        state.currentHealingJournal?.id === journalId
          ? { ...state.currentHealingJournal, entries: [entry, ...state.currentHealingJournal.entries] }
          : state.currentHealingJournal,
    })),
  updateJournalEntry: (journalId, entryId, updates) =>
    set((state) => ({
      healingJournals: state.healingJournals.map((j) =>
        j.id === journalId
          ? {
              ...j,
              entries: j.entries.map((e) => (e.id === entryId ? { ...e, ...updates } : e)),
            }
          : j
      ),
      currentHealingJournal:
        state.currentHealingJournal?.id === journalId
          ? {
              ...state.currentHealingJournal,
              entries: state.currentHealingJournal.entries.map((e) => (e.id === entryId ? { ...e, ...updates } : e)),
            }
          : state.currentHealingJournal,
    })),
  deleteJournalEntry: (journalId, entryId) =>
    set((state) => ({
      healingJournals: state.healingJournals.map((j) =>
        j.id === journalId
          ? {
              ...j,
              entries: j.entries.filter((e) => e.id !== entryId),
            }
          : j
      ),
      currentHealingJournal:
        state.currentHealingJournal?.id === journalId
          ? {
              ...state.currentHealingJournal,
              entries: state.currentHealingJournal.entries.filter((e) => e.id !== entryId),
            }
          : state.currentHealingJournal,
    })),

  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  clearAllData: () =>
    set({
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
}),
{
  name: 'pixeltale-store',
  storage: createJSONStorage(() => localStorage),
  // Don't persist loading state or current* pointers that reference large data
  partialize: (state) => ({
    comicsSequences: state.comicsSequences,
    storyHistory: state.storyHistory,
    lifeBooks: state.lifeBooks,
    familyLores: state.familyLores,
    bedtimeStories: state.bedtimeStories,
    songs: state.songs,
    rpgWorlds: state.rpgWorlds,
    memoryTapestries: state.memoryTapestries,
    timeCapsules: state.timeCapsules,
    healingJournals: state.healingJournals,
    selectedGenre: state.selectedGenre,
    selectedVoice: state.selectedVoice,
  }),
}))
