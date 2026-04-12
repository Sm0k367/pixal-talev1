import { useRef } from 'react'
import { motion } from 'framer-motion'
import { Upload, Image as ImageIcon } from 'lucide-react'

interface UploadZoneProps {
  preview: string
  onFileSelect: (file: File) => void
  isLoading: boolean
}

export default function UploadZone({ preview, onFileSelect, isLoading }: UploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file?.type.startsWith('image/')) {
      onFileSelect(file)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onFileSelect(file)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      onClick={() => !preview && fileInputRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDragDrop}
      className="group relative w-full"
    >
      {preview ? (
        <div className="relative w-full h-96 rounded-2xl overflow-hidden glass-effect border border-accent-cyan/30">
          <img
            src={preview}
            alt="preview"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-950/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <button
            onClick={(e) => {
              e.stopPropagation()
              fileInputRef.current?.click()
            }}
            className="absolute top-4 right-4 px-4 py-2 rounded-lg bg-accent-cyan/80 text-dark-950 font-semibold hover:bg-accent-cyan transition-colors"
          >
            Change Image
          </button>
        </div>
      ) : (
        <div className="relative w-full h-96 rounded-2xl border-2 border-dashed border-accent-cyan/50 glass-effect flex flex-col items-center justify-center cursor-pointer overflow-hidden group">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/5 via-transparent to-accent-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Content */}
          <div className="relative z-10 text-center space-y-4">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex justify-center"
            >
              <div className="p-4 rounded-full bg-accent-cyan/10 border border-accent-cyan/30">
                <Upload className="w-8 h-8 text-accent-cyan" />
              </div>
            </motion.div>
            
            <div>
              <p className="text-lg font-semibold text-white">
                Drag your image here
              </p>
              <p className="text-sm text-white/50 mt-1">
                or click to browse
              </p>
            </div>
            
            <p className="text-xs text-white/40">
              PNG, JPG, GIF up to 10MB
            </p>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={isLoading}
        className="hidden"
      />
    </motion.div>
  )
}
