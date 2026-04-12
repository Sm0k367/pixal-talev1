import { create } from 'zustand'

export interface Story {
  id: string
  title: string
  mood: string
  story: string
  genre: string
  imageUrl: string
  createdAt: number
}

interface UIState {
  selectedGenre: string
  selectedVoice: string
  isLoading: boolean
  currentStory: Story | null
  history: Story[]
  
  setSelectedGenre: (genre: string) => void
  setSelectedVoice: (voice: string) => void
  setIsLoading: (loading: boolean) => void
  setCurrentStory: (story: Story | null) => void
  addToHistory: (story: Story) => void
  clearHistory: () => void
}

export const useStore = create<UIState>((set) => ({
  selectedGenre: 'cinematic',
  selectedVoice: 'nova',
  isLoading: false,
  currentStory: null,
  history: [],
  
  setSelectedGenre: (genre) => set({ selectedGenre: genre }),
  setSelectedVoice: (voice) => set({ selectedVoice: voice }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setCurrentStory: (story) => set({ currentStory: story }),
  
  addToHistory: (story) => set((state) => ({
    history: [story, ...state.history].slice(0, 50),
  })),
  
  clearHistory: () => set({ history: [] }),
}))
