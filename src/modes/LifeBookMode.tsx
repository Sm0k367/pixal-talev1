import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, BookOpen, Calendar, Sparkles, Zap } from 'lucide-react'
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

  const {
    lifeBooks,
    currentLifeBook,
    isLoading,
    addLifeBook,
    updateLifeBook,
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
      title: bookTitle || 'My Life Story',
      description: bookDescription,
      chapters: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    addLifeBook(newBook)
    setCurrentLifeBook(newBook)
  }

  const addChapter = async () => {
    if (!selectedFile || !currentLifeBook || !chapterTitle) return

    useStore.setState({ isLoading: true })

    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string).split(',')[1]

        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64,
            mimeType: selectedFile.type,
            mode: 'lifebook',
            prompt: `Write a personal memoir chapter titled "${chapterTitle}" dated ${chapterDate}`,
          }),
        })

        if (!response.ok) throw new Error('Generation failed')

        const data = await response.json()
        const newChapter: LifeBookChapter = {
          id: uuidv4(),
          title: chapterTitle,
          date: chapterDate,
          imageUrl: preview,
          content: data.story || data.content,
          mood: data.mood || 'nostalgic',
        }

        updateLifeBook(currentLifeBook.id, {
          chapters: [...currentLifeBook.chapters, newChapter],
        })

        // Reset form
        setSelectedFile(null)
        setPreview('')
        setChapterTitle('')
        setChapterDate(new Date().toISOString().split('T')[0])
      }
      reader.readAsDataURL(selectedFile)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      useStore.setState({ isLoading: false })
    }
  }

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
                rows={4}
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
              <h3 className="text-lg font-semibold text-white">Your Books</h3>
              {lifeBooks.map((book) => (
                <motion.button
                  key={book.id}
                  onClick={() => setCurrentLifeBook(book)}
                  whileHover={{ scale: 1.02 }}
                  className="w-full text-left p-4 rounded-lg bg-white/5 border border-white/10 hover:border-accent-purple/50 hover:bg-white/10 transition-all"
                >
                  <h4 className="font-semibold text-white">{book.title}</h4>
                  <p className="text-white/60 text-sm mt-1">{book.chapters.length} chapters</p>
                </motion.button>
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
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-4xl font-bold text-white mb-2">{currentLifeBook.title}</h2>
            {currentLifeBook.description && (
              <p className="text-white/60 mb-4">{currentLifeBook.description}</p>
            )}
            <div className="flex items-center justify-center gap-4">
              <span className="text-white/80">
                {currentLifeBook.chapters.length} Chapters
              </span>
              <button
                onClick={() => setCurrentLifeBook(null)}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/80 text-sm"
              >
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
                <label className="block text-white/80 font-medium mb-3">Date</label>
                <input
                  type="date"
                  value={chapterDate}
                  onChange={(e) => setChapterDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-purple focus:ring-2 focus:ring-accent-purple/20 transition-all"
                />
              </div>

              {/* Upload Zone */}
              <UploadZone
                preview={preview}
                onFileSelect={handleFileSelect}
                isLoading={isLoading}
              />

              {/* Generate Button */}
              {selectedFile && (
                <motion.button
                  onClick={addChapter}
                  disabled={isLoading || !chapterTitle}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-dark-950/30 border-t-dark-950 rounded-full animate-spin" />
                      <span>Generating Chapter...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      <span>Create Chapter</span>
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Chapters Timeline */}
          {currentLifeBook.chapters.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="max-w-4xl mx-auto space-y-4"
            >
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Chapters
              </h3>
              <div className="space-y-4">
                {currentLifeBook.chapters.map((chapter, idx) => (
                  <motion.div
                    key={chapter.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    className="glass-card p-6 space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-lg font-bold text-white">{chapter.title}</h4>
                        <p className="text-white/60 text-sm flex items-center gap-1 mt-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(chapter.date).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="px-2 py-1 rounded bg-accent-purple/20 text-accent-purple text-xs font-medium">
                        {chapter.mood}
                      </span>
                    </div>
                    {chapter.imageUrl && (
                      <img
                        src={chapter.imageUrl}
                        alt={chapter.title}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    )}
                    <p className="text-white/80 line-clamp-3">{chapter.content}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  )
}
