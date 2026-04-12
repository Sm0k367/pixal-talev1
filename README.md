# 🌌 PixelTale 1000X - Civilization-Scale Creative Platform

**Transform a single photo into infinite creative possibilities across 10 radical modes.**

**Live Demo:** https://pixal-tale.vercel.app  
**GitHub:** https://github.com/Sm0k367/pixal-tale

---

## 🎯 Vision

PixelTale 1000X is not just an app—it's a creative ecosystem. Every image becomes a gateway to:
- **Immersive stories** with AI narration
- **Evolving autobiographies** that grow over time
- **Graphic novels** with AI-generated dialogue
- **Family sagas** spanning generations
- **Personalized bedtime tales** for children
- **AI-composed music** inspired by photos
- **RPG worlds** for tabletop adventures
- **Global memory networks** connecting humanity's stories
- **Augmented reality time capsules** at meaningful locations
- **Therapeutic journaling** for emotional healing

---

## ✨ Features & Modes

### 🟢 MVP - Available Now

#### 📖 Story Mode
Transform photos into immersive narratives with:
- 8 story genres (Cinematic, Fantasy, Mystery, Romance, Horror, Adventure, Bedtime, Sci-Fi)
- 4 narrator voices with unique audio profiles
- Real-time AI story generation via Groq API
- Web Speech API narration
- Story archive and history

#### 📚 Life Book Mode
Create an evolving autobiography:
- Upload photos organized by date
- AI-generates memoir chapters (150-200 words)
- Timeline visualization
- Persistent book storage
- Multiple life books per user

#### 🎨 Comics Mode
Build graphic novels from images:
- Batch image upload for panel sequencing
- AI-generated panel dialogue and captions
- Drag-and-drop panel reordering
- Edit dialogue directly
- Export sequences

### 🟡 Coming Soon (Phase 2)

- **Family Lore** - Multi-generational storytelling
- **Bedtime Stories** - Child-centric AI narratives
- **Songwriter** - Music generation from images
- **RPG Assistant** - World-building for tabletop games
- **Memory Tapestry** - Global interconnected narratives
- **Time Capsules** - Geolocation-based AR experiences
- **Healing Journal** - Therapeutic storytelling with privacy controls

---

## 🛠️ Tech Stack

### Frontend Architecture
```
React 18.3 + TypeScript 5.3    - Type-safe UI framework
Vite 6.0                        - Lightning-fast bundler (<100ms HMR)
React Router 6.20               - Multi-mode navigation
Framer Motion 11                - Premium animations
Zustand 4.4                     - Global state management
Tailwind CSS 3.4                - Utility-first styling
Lucide React 0.468              - Icon system
date-fns 2.30                   - Date manipulation
uuid 9.0.1                      - Unique IDs
```

### Backend & APIs
```
Vercel Serverless               - Auto-scaling Edge Functions
Groq API (llama-4-scout-17b)    - Vision+Language AI
Web Speech API                  - Browser narration
```

### Design System
```
Color Palette:
  - Primary: Cyan-500 (#06B6D4)
  - Secondary: Purple-500 (#A855F7)
  - Accent: Pink-500 (#EC4899)
  - Background: Dark-950 (#030712)

Typography:
  - Display: Space Grotesk
  - Body: Inter
  
Effects:
  - Glass Morphism (backdrop-blur-xl)
  - Gradient Overlays
  - GPU-accelerated animations
  - Smooth transitions (cubic-bezier)
```

---

## 📊 Architecture

### Multi-Mode Router
```
App.tsx
├── ModeRouter (React Router 6)
│   ├── / (ModeSelector - home)
│   ├── /mode/story (StoryMode)
│   ├── /mode/lifebook (LifeBookMode)
│   ├── /mode/comics (ComicsMode)
│   └── [coming soon modes]
├── Header (with navigation)
└── Layout (responsive grid)
```

### State Management (Zustand)
```
useStore
├── Global Loading State
├── Story Mode
│   ├── selectedGenre, selectedVoice
│   ├── currentStory, storyHistory
│   └── story operations (add, update)
├── LifeBook Mode
│   ├── lifeBooks[], currentLifeBook
│   └── chapter operations (create, edit)
├── Comics Mode
│   ├── comicsSequences[], currentComicsSequence
│   └── panel operations (add, reorder, delete)
└── Mode Switching (currentMode)
```

### API Handler (Vercel Serverless)
```
/api/generate (POST)
├── Image analysis via Groq Vision
├── Mode-specific prompts (story, lifebook, comics)
├── JSON response parsing
├── Fallback text generation
└── Error handling
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Groq API Key (free at https://console.groq.com)

### Local Development

```bash
# 1. Clone repository
git clone https://github.com/Sm0k367/pixal-tale.git
cd pixal-tale

# 2. Install dependencies
npm install

# 3. Create .env file
cat > .env << EOF
GROQ_API_KEY=your_groq_api_key_here
EOF

# 4. Start dev server
npm run dev
# Opens http://localhost:5173

# 5. Type checking
npm run type-check

# 6. Production build
npm run build
# Output: dist/ (104KB gzipped)
```

### Environment Variables

```env
# Required for API
GROQ_API_KEY=gsk_xxxxxxxxxxxxx

# Optional for deployment
VERCEL_URL=your-production-domain.vercel.app
```

---

## 📁 Project Structure

```
pixeltale/
├── src/
│   ├── App.tsx                          # Router & layout
│   ├── main.tsx                         # Entry point
│   ├── store.ts                         # Zustand state management
│   ├── index.css                        # Global styles + Tailwind
│   ├── components/
│   │   ├── Header.tsx                   # Navigation
│   │   ├── ModeSelector.tsx             # Home/landing
│   │   ├── UploadZone.tsx               # Drag-drop file upload
│   │   ├── GenreSelector.tsx            # Story genre picker
│   │   ├── VoiceSelector.tsx            # Narrator voice picker
│   │   ├── StoryDisplay.tsx             # Story card display
│   │   └── History.tsx                  # Story archive sidebar
│   └── modes/
│       ├── StoryMode.tsx                # 📖 Single photo → story
│       ├── LifeBookMode.tsx             # 📚 Timeline autobiography
│       └── ComicsMode.tsx               # 🎨 Sequential narratives
├── api/
│   └── generate.ts                      # Vercel serverless function
├── public/
│   └── [static assets]
├── index.html                           # HTML shell
├── tailwind.config.js                   # Design tokens
├── tsconfig.json                        # TypeScript config
├── vite.config.ts                       # Vite build config
├── package.json                         # Dependencies (v3.0.0)
├── README.md                            # This file
├── PIXELTALE_1000X_VISION.md            # Full 10-feature roadmap
└── .env                                 # Local environment
```

---

## 🎮 Usage Guide

### Story Mode
1. Click "Story Mode" on home
2. Upload a photo (drag or click)
3. Select story genre (8 options)
4. Choose narrator voice (4 options)
5. Click "Generate Story"
6. Click "Listen to Story" for narration
7. Stories auto-save to history

### LifeBook Mode
1. Click "Life Book" on home
2. Create a new book with title & description
3. Click "Add Chapter"
4. Fill in chapter title and date
5. Upload a photo from that memory
6. AI generates a memoir chapter
7. Chapters organized chronologically
8. Create multiple life books

### Comics Mode
1. Click "Comics Studio" on home
2. Create sequence with title
3. Upload multiple images in order
4. AI generates dialogue and captions for each panel
5. Reorder panels by dragging
6. Edit dialogue directly
7. Add more panels incrementally

---

## 🔌 API Reference

### POST `/api/generate`

**Request:**
```json
{
  "imageBase64": "string",          // Base64-encoded image
  "mimeType": "string",              // e.g., "image/jpeg"
  "mode": "story|lifebook|comics",   // Default: "story"
  "genre": "string",                 // For story mode (optional)
  "prompt": "string"                 // Custom prompt (optional)
}
```

**Response:**
```json
{
  "title": "string",
  "mood": "string",
  "story": "string",
  "content": "string"
}
```

**Modes:**
- `story` - Uses genre prompts
- `lifebook` - 150-200 word memoir chapters
- `comics` - Panel-by-panel dialogue

---

## 🎨 Design Guidelines

### Colors
```css
/* Primary Gradient */
bg-gradient-to-r from-accent-cyan via-accent-purple to-accent-pink

/* Glass Morphism */
background: rgba(255, 255, 255, 0.05);
backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.1);

/* Hover States */
hover:bg-white/10
hover:border-accent-cyan/50
hover:shadow-lg hover:shadow-accent-cyan/50
```

### Components
- Use `glass-card` class for card backgrounds
- Use `btn-primary` for main actions
- Use `btn-secondary` for secondary actions
- Animations via Framer Motion
- Icons from Lucide React

---

## 📦 Bundle Analysis

```
dist/
├── index.html               1.09 kB
├── assets/index-*.css      27.38 kB → 5.28 kB (gzip)
└── assets/index-*.js      334.22 kB → 104.28 kB (gzip)

Total: 104 KB gzipped ✅ (target: <200 KB)
```

---

## 🧪 Testing

### Type Checking
```bash
npm run type-check
```

### Development Build
```bash
npm run build
```

### Preview Build
```bash
npm run preview
```

---

## 🚢 Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Vercel Auto-Deploy**
   - Connect your GitHub repo to Vercel
   - Set environment variable: `GROQ_API_KEY`
   - Deploys automatically on push

3. **Manual Deploy**
   ```bash
   npm install -g vercel
   vercel env add GROQ_API_KEY
   vercel --prod
   ```

### Environment Setup
```env
# .env.production
GROQ_API_KEY=your_groq_api_key
VITE_API_URL=https://your-domain.vercel.app
```

---

## 🔒 Security & Privacy

### Image Handling
- Images sent only to Groq API for processing
- Processed images not stored server-side
- Base64 encoding for safe transmission
- No image retention logs

### User Data
- Local browser storage via Zustand
- No external database tracking
- Optional: Deploy without analytics
- GDPR-compliant data flows

### API Security
- Groq API key stored securely in Vercel environment
- Rate limiting via Vercel Edge Functions
- CORS configured appropriately
- Error messages sanitized

---

## 🐛 Troubleshooting

### Build Errors
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Dev Server Issues
```bash
# Kill existing process on port 5173
lsof -ti:5173 | xargs kill -9
npm run dev
```

### API Errors
- Check `GROQ_API_KEY` is set
- Verify image is valid (PNG, JPG, GIF)
- Check image size < 10MB
- Monitor Groq API status

### TypeScript Errors
```bash
npm run type-check
```

---

## 📚 Documentation

- **PIXELTALE_1000X_VISION.md** - Full feature roadmap for all 10 modes
- **API Reference** - Detailed endpoint documentation (above)
- **Code Comments** - Inline documentation in source files

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m "feat: add amazing feature"`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Code Style
- TypeScript for all code
- Functional components with hooks
- Tailwind CSS for styling
- Framer Motion for animations
- Zustand for state

---

## 📝 Roadmap

### Phase 1 (Complete ✅)
- [x] Story Mode MVP
- [x] LifeBook Mode MVP
- [x] Comics Mode MVP
- [x] React Router architecture
- [x] Multi-mode state management
- [x] Vercel deployment

### Phase 2 (Q2 2026)
- [ ] Family Lore mode
- [ ] Bedtime Stories mode
- [ ] Songwriter mode
- [ ] Social sharing features
- [ ] User authentication
- [ ] Cloud storage integration

### Phase 3 (Q3 2026)
- [ ] RPG Assistant mode
- [ ] Memory Tapestry mode
- [ ] Time Capsule mode with AR
- [ ] Geolocation tagging
- [ ] Mobile app (React Native)

### Phase 4 (Q4 2026)
- [ ] Healing Journal mode
- [ ] Mental health integrations
- [ ] Therapist-friendly exports
- [ ] Enterprise features
- [ ] API for third-party integrations

---

## 📞 Support

- **Issues:** GitHub Issues (https://github.com/Sm0k367/pixal-tale/issues)
- **Email:** support@pixeltale.dev
- **Docs:** https://docs.pixeltale.dev

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

- **Groq** - Vision AI powering image analysis
- **Vercel** - Serverless hosting
- **React Ecosystem** - React Router, Framer Motion, Zustand
- **Tailwind Labs** - Tailwind CSS

---

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=Sm0k367/pixal-tale&type=Date)](https://star-history.com/#Sm0k367/pixal-tale&Date)

---

**Built with ❤️ by the PixelTale Team**

*Transform your photos into infinite stories.*
