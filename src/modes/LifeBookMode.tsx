import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, BookOpen, Calendar, Sparkles, Zap, Trash2, Edit2, Check, X, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react'
import { useStore, LifeBook, LifeBookChapter } from '../store'
import UploadZone from '../components/UploadZone'
import { v4 as uuidv4 } from 'uuid'

export default function LifeBookMode() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [chapterTitle, setChapterTitle] = useState('')
  const [chapterDate, setChapterDate] = useState(new Date().toISOString().split('T')[0])
  const [bookTitle, setBookTitle] = useState('My Life Story')
  const [bookDescription, setBookDescription] = useState('An evolving autobiography')

  // Edit chapter state
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDate, setEditDate] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editMood, setEditMood] = useState('')

  // Expand/collapse chapter content
  const [expandedChapterIds, setExpandedChapterIds] = useState<Set<string>>(new Set())

  // Confirm delete
  const [deletingChapterId, setDeletingChapterId] = useState<string | null>(null)
  const [deletingBookId, setDeletingBookId] = useState<string | null>(null)

  const {
    lifeBooks,
    currentLifeBook,
    isLoading,
    addLifeBook,
    updateLifeBook,
    deleteLifeBook,
    deleteChapter,
    updateChapter,
    setCurrentLifeBook,
  } = useStore()

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const createNewBook = () => {
    const newBook: LifeBook = {
      id: uuidv4(),
      title: bookTitle.trim() || 'My Life Story',
      description: bookDescription.trim(),
      chapters: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    addLifeBook(newBook)
    setCurrentLifeBook(newBook)
    setBookTitle('My Life Story')
    setBookDescription('An evolving autobiography')
  }

  const addChapter = async () => {
    if (!selectedFile || !currentLifeBook || !chapterTitle.trim()) return

    useStore.setState({ isLoading: true })

    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const base64 = (e.target?.result as string).split(',')[1]

          const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: base64,
              mimeType: selectedFile.type,
              mode: 'lifebook',
              prompt: `Write a personal memoir chapter titled "${chapterTitle}" dated ${chapterDate}. Include vivid sensory details, emotional reflection, and personal significance. Return ONLY JSON: { "title": "${chapterTitle}", "mood": "one word emotion", "story": "text", "content": "text" }`,
            }),
          })

          if (!response.ok) throw new Error(`Generation failed: ${response.status}`)

          const data = await response.json()
          const newChapter: LifeBookChapter = {
            id: uuidv4(),
            title: chapterTitle.trim(),
            date: chapterDate,
            imageUrl: preview,
            content: data.content || data.story || 'Chapter content generated.',
            mood: data.mood || 'nostalgic',
          }

          // Get the latest book from store to avoid stale closure
          const latestBook = useStore.getState().lifeBooks.find((b) => b.id === currentLifeBook.id)
          const latestChapters = latestBook?.chapters ?? currentLifeBook.chapters

          updateLifeBook(currentLifeBook.id, {
            chapters: [...latestChapters, newChapter],
          })

          // Reset form
          setSelectedFile(null)
          setPreview('')
          setChapterTitle('')
          setChapterDate(new Date().toISOString().split('T')[0])
        } catch (innerErr) {
          console.error('Chapter generation error:', innerErr)
        } finally {
          useStore.setState({ isLoading: false })
        }
      }
      reader.onerror = () => {
        console.error('FileReader error')
        useStore.setState({ isLoading: false })
      }
      reader.readAsDataURL(selectedFile)
    } catch (error) {
      console.error('Error:', error)
      useStore.setState({ isLoading: false })
    }
  }

  const startEditChapter = (chapter: LifeBookChapter) => {
    setEditingChapterId(chapter.id)
    setEditTitle(chapter.title)
    setEditDate(chapter.date)
    setEditContent(chapter.content)
    setEditMood(chapter.mood)
  }

  const saveEditChapter = () => {
    if (!currentLifeBook || !editingChapterId) return
    updateChapter(currentLifeBook.id, editingChapterId, {
      title: editTitle.trim() || 'Untitled Chapter',
      date: editDate,
      content: editContent,
      mood: editMood,
    })
    setEditingChapterId(null)
  }

  const cancelEdit = () => {
    setEditingChapterId(null)
  }

  const handleDeleteChapter = (chapterId: string) => {
    if (!currentLifeBook) return
    deleteChapter(currentLifeBook.id, chapterId)
    setDeletingChapterId(null)
  }

  const handleDeleteBook = (bookId: string) => {
    deleteLifeBook(bookId)
    setDeletingBookId(null)
  }

  const toggleChapterExpand = (chapterId: string) => {
    setExpandedChapterIds((prev) => {
      const next = new Set(prev)
      if (next.has(chapterId)) next.delete(chapterId)
      else next.add(chapterId)
      return next
    })
  }

  // Sort chapters chronologically by date
  const sortedChapters = currentLifeBook
    ? [...currentLifeBook.chapters].sort((a, b) => {
        const da = new Date(a.date).getTime()
        const db = new Date(b.date).getTime()
        return da - db
      })
    : []

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-purple/10 border border-accent-purple/30 mb-4">
          <Sparkles className="w-4 h-4 text-accent-purple" />
          <span className="text-sm font-medium text-accent-purple">Life Book Mode</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-display font-bold mb-4 bg-gradient-to-r from-accent-purple via-accent-pink to-accent-cyan bg-clip-text text-transparent">
          Create Your Autobiography
        </h1>
        <p className="text-xl text-white/60 max-w-2xl mx-auto">
          Build an evolving chronicle of your life story, one chapter at a time
        </p>
      </motion.div>

      {/* Book Setup or Chapters View */}
      {!currentLifeBook ? (
        // Book Setup
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto space-y-6"
        >
          <div className="glass-card p-8 space-y-6">
            <h2 className="text-2xl font-bold text-white">Start Your Life Book</h2>

            {/* Book Title */}
            <div>
              <label className="block text-white/80 font-medium mb-3">Book Title</label>
              <input
                type="text"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                placeholder="My Life Story"
                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-accent-purple focus:ring-2 focus:ring-accent-purple/20 transition-all"
              />
            </div>

            {/* Book Description */}
            <div>
              <label className="block text-white/80 font-medium mb-3">Description</label>
              <textarea
                value={bookDescription}
                onChange={(e) => setBookDescription(e.target.value)}
                placeholder="A brief description of your autobiography..."
                rows={3}
                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-accent-purple focus:ring-2 focus:ring-accent-purple/20 transition-all resize-none"
              />
            </div>

            {/* Create Button */}
            <motion.button
              onClick={createNewBook}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full btn-primary flex items-center justify-center gap-2 py-3"
            >
              <Plus className="w-5 h-5" />
              Create Life Book
            </motion.button>
          </div>

          {/* Previous Books */}
          {lifeBooks.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Your Books ({lifeBooks.length})</h3>
              {lifeBooks.map((book) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative group"
                >
                  <motion.button
                    onClick={() => setCurrentLifeBook(book)}
                    whileHover={{ scale: 1.01 }}
                    className="w-full text-left p-4 rounded-lg bg-white/5 border border-white/10 hover:border-accent-purple/50 hover:bg-white/10 transition-all pr-12"
                  >
                    <h4 className="font-semibold text-white">{book.title}</h4>
                    {book.description && (
                      <p className="text-white/50 text-sm mt-0.5 truncate">{book.description}</p>
                    )}
                    <p className="text-white/40 text-xs mt-1">
                      {book.chapters.length} chapter{book.chapters.length !== 1 ? 's' : ''} ·{' '}
                      {new Date(book.createdAt).toLocaleDateString()}
                    </p>
                  </motion.button>

                  {/* Delete book button */}
                  {deletingBookId === book.id ? (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                      <button
                        onClick={() => handleDeleteBook(book.id)}
                        className="p-1.5 rounded bg-red-500/80 hover:bg-red-500 text-white transition-colors"
                        title="Confirm delete"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingBookId(null)}
                        className="p-1.5 rounded bg-white/10 hover:bg-white/20 text-white/70 transition-colors"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeletingBookId(book.id)
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-white/40 opacity-0 group-hover:opacity-100 transition-all"
                      title="Delete book"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      ) : (
        // Chapters View
        <div className="space-y-8">
          {/* Book Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-4xl mx-auto"
          >
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-3xl font-bold text-white">{currentLifeBook.title}</h2>
                {currentLifeBook.description && (
                  <p className="text-white/60 mt-1">{currentLifeBook.description}</p>
                )}
                <p className="text-white/40 text-sm mt-1">
                  {currentLifeBook.chapters.length} chapter{currentLifeBook.chapters.length !== 1 ? 's' : ''}
                  {sortedChapters.length > 0 && (
                    <> · Timeline: {new Date(sortedChapters[0].date).toLocaleDateString()} → {new Date(sortedChapters[sortedChapters.length - 1].date).toLocaleDateString()}</>
                  )}
                </p>
              </div>
              <button
                onClick={() => setCurrentLifeBook(null)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/80 text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Books
              </button>
            </div>
          </motion.div>

          {/* Add Chapter Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto space-y-6"
          >
            <div className="glass-card p-8 space-y-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <Plus className="w-6 h-6" />
                Add Chapter
              </h3>

              {/* Chapter Title */}
              <div>
                <label className="block text-white/80 font-medium mb-3">Chapter Title</label>
                <input
                  type="text"
                  value={chapterTitle}
                  onChange={(e) => setChapterTitle(e.target.value)}
                  placeholder="e.g., First Day of School"
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-accent-purple focus:ring-2 focus:ring-accent-purple/20 transition-all"
                />
              </div>

              {/* Chapter Date */}
              <div>
                <label className="block text-white/80 font-medium mb-3">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date
                </label>
                <input
                  type="date"
                  value={chapterDate}
                  onChange={(e) => setChapterDate(e.target.value)}
                  max="2099-12-31"
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-purple focus:ring-2 focus:ring-accent-purple/20 transition-all"
                  style={{ colorScheme: 'dark' }}
                />
              </div>

              {/* Upload Zone */}
              <UploadZone
                preview={preview}
                onFileSelect={handleFileSelect}
                isLoading={isLoading}
              />

              {/* Generate Button */}
              <motion.button
                onClick={addChapter}
                disabled={isLoading || !chapterTitle.trim() || !selectedFile}
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                className="w-full btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-dark-950/30 border-t-dark-950 rounded-full animate-spin" />
                    <span>Generating Chapter...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    <span>
                      {!selectedFile
                        ? 'Upload an Image First'
                        : !chapterTitle.trim()
                        ? 'Enter Chapter Title'
                        : 'Create Chapter'}
                    </span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Chapters Timeline */}
          {sortedChapters.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="max-w-4xl mx-auto space-y-4"
            >
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-accent-purple" />
                Timeline — {sortedChapters.length} Chapter{sortedChapters.length !== 1 ? 's' : ''}
                <span className="text-white/40 text-sm font-normal ml-1">(sorted chronologically)</span>
              </h3>

              <div className="relative space-y-4">
                {/* Timeline line */}
                <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gradient-to-b from-accent-purple/60 via-accent-pink/40 to-transparent" />

                {sortedChapters.map((chapter, idx) => {
                  const isEditing = editingChapterId === chapter.id
                  const isExpanded = expandedChapterIds.has(chapter.id)
                  const isDeleting = deletingChapterId === chapter.id

                  return (
                    <motion.div
                      key={chapter.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: 0.05 * idx }}
                      className="relative pl-14"
                    >
                      {/* Timeline dot */}
                      <div className="absolute left-4 top-6 w-4 h-4 rounded-full bg-accent-purple border-2 border-dark-950 z-10" />

                      <div className="glass-card p-6 space-y-4">
                        {isEditing ? (
                          // Edit mode
                          <div className="space-y-4">
                            <div>
                              <label className="block text-white/60 text-xs mb-1">Title</label>
                              <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent-purple transition-all"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-white/60 text-xs mb-1">Date</label>
                                <input
                                  type="date"
                                  value={editDate}
                                  onChange={(e) => setEditDate(e.target.value)}
                                  className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent-purple transition-all"
                                  style={{ colorScheme: 'dark' }}
                                />
                              </div>
                              <div>
                                <label className="block text-white/60 text-xs mb-1">Mood</label>
                                <input
                                  type="text"
                                  value={editMood}
                                  onChange={(e) => setEditMood(e.target.value)}
                                  className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent-purple transition-all"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-white/60 text-xs mb-1">Content</label>
                              <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                rows={6}
                                className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent-purple transition-all resize-none"
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={saveEditChapter}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent-purple/80 hover:bg-accent-purple text-white text-sm transition-colors"
                              >
                                <Check className="w-4 h-4" />
                                Save
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 text-sm transition-colors"
                              >
                                <X className="w-4 h-4" />
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          // View mode
                          <>
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <h4 className="text-lg font-bold text-white truncate">{chapter.title}</h4>
                                <p className="text-white/60 text-sm flex items-center gap-1 mt-1">
                                  <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                                  {new Date(chapter.date + 'T00:00:00').toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  })}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="px-2 py-1 rounded bg-accent-purple/20 text-accent-purple text-xs font-medium">
                                  {chapter.mood}
                                </span>
                                <button
                                  onClick={() => startEditChapter(chapter)}
                                  className="p-1.5 rounded bg-white/5 hover:bg-white/15 text-white/50 hover:text-white/90 transition-all"
                                  title="Edit chapter"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                {isDeleting ? (
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => handleDeleteChapter(chapter.id)}
                                      className="p-1.5 rounded bg-red-500/80 hover:bg-red-500 text-white transition-colors"
                                      title="Confirm delete"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => setDeletingChapterId(null)}
                                      className="p-1.5 rounded bg-white/10 hover:bg-white/20 text-white/70 transition-colors"
                                      title="Cancel"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setDeletingChapterId(chapter.id)}
                                    className="p-1.5 rounded bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-all"
                                    title="Delete chapter"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {chapter.imageUrl && (
                              <img
                                src={chapter.imageUrl}
                                alt={chapter.title}
                                className="w-full h-48 object-cover rounded-lg"
                              />
                            )}

                            <div>
                              <p className={`text-white/80 text-sm leading-relaxed ${!isExpanded ? 'line-clamp-4' : ''}`}>
                                {chapter.content}
                              </p>
                              {chapter.content && chapter.content.length > 200 && (
                                <button
                                  onClick={() => toggleChapterExpand(chapter.id)}
                                  className="flex items-center gap-1 mt-2 text-accent-purple/80 hover:text-accent-purple text-xs transition-colors"
                                >
                                  {isExpanded ? (
                                    <>
                                      <ChevronUp className="w-3.5 h-3.5" />
                                      Show less
                                    </>
                                  ) : (
                                    <>
                                      <ChevronDown className="w-3.5 h-3.5" />
                                      Read more
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  )
}
