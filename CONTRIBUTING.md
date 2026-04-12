# Contributing to PixelTale

Thank you for your interest in contributing to PixelTale! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and constructive in all interactions with other community members.

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Git
- Groq API Key (for local testing)

### Local Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/pixal-talev1.git
   cd pixal-talev1
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Set up environment variables**
   ```bash
   echo "GROQ_API_KEY=your_key_here" > .env
   ```

5. **Start the dev server**
   ```bash
   npm run dev
   ```

## Development Workflow

### Making Changes

1. **Create a feature branch** from `main`
   ```bash
   git checkout -b feature/descriptive-name
   ```

2. **Make your changes**
   - Keep commits atomic and focused
   - Write clear commit messages
   - Follow the existing code style

3. **Test your changes**
   ```bash
   npm run type-check  # TypeScript check
   npm run build       # Production build
   ```

4. **Commit with a clear message**
   ```bash
   git commit -m "feat: add descriptive feature description"
   ```

### Commit Message Guidelines

Follow this format:
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that don't affect code meaning (formatting, missing semicolons, etc.)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Code change that improves performance
- `test`: Adding missing tests
- `chore`: Changes to build process, dependencies, etc.

**Examples:**
- `feat(modes): add Family Lore mode with multi-generational storytelling`
- `fix(api): resolve Groq API timeout on large images`
- `docs: update API documentation with new examples`

## Pull Request Process

1. **Push your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request**
   - Use the PR template provided
   - Link related issues
   - Provide clear description of changes
   - Include screenshots for UI changes

3. **Respond to Reviews**
   - Address reviewer feedback promptly
   - Push additional commits for changes (don't amend)
   - Mark conversations as resolved when addressed

4. **Merge**
   - PR must pass all status checks
   - At least one approval required
   - Squash and merge to keep history clean

## Coding Standards

### TypeScript
- Use strict mode
- Type all function parameters and returns
- Avoid `any` types
- Use interfaces for complex objects

### React Components
- Functional components with hooks
- Clear prop typing
- Meaningful component names
- One component per file (unless small shared helpers)

### CSS & Styling
- Use Tailwind utility classes
- Follow existing color scheme
- Use CSS variables from `index.css`
- Mobile-first responsive design

### Testing
- Add tests for new features
- Keep tests focused and readable
- Aim for high coverage on critical paths

## Adding a New Mode

If you're adding a new creative mode to PixelTale:

1. **Create mode component** in `src/modes/{ModeName}Mode.tsx`
2. **Add state management** in `src/store.ts`
3. **Add API prompt** in `api/generate.ts`
4. **Add route** in `src/App.tsx`
5. **Update ModeSelector** in `src/components/ModeSelector.tsx`
6. **Test thoroughly**
7. **Document** in MODES_GUIDE.md

## Running Tests

```bash
# Type checking
npm run type-check

# Production build
npm run build

# Development server
npm run dev
```

## Reporting Bugs

- Use the Bug Report issue template
- Provide clear reproduction steps
- Include environment details
- Add screenshots if applicable
- Specify which mode is affected

## Requesting Features

- Use the Feature Request issue template
- Clearly describe the use case
- Explain why this would benefit PixelTale
- Link to related issues or discussion

## Documentation

- Update README.md for user-facing changes
- Update MODES_GUIDE.md when adding modes
- Update API_GUIDE.md for API changes
- Add JSDoc comments for complex code
- Keep documentation up-to-date

## Style Guide

### Naming Conventions
- Components: `PascalCase` (e.g., `StoryMode`)
- Functions/variables: `camelCase` (e.g., `generateStory`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_FILE_SIZE`)
- Files: `kebab-case` for configs, `PascalCase` for components

### File Organization
```
src/
├── modes/        # Mode components
├── components/   # Shared components
├── App.tsx
├── store.ts      # Zustand store
└── index.css     # Global styles
```

## Deployment

- Changes to `main` branch auto-deploy to Vercel
- Ensure all tests pass before merging
- Verify production build succeeds
- Test deployed version before closing PR

## Getting Help

- Check existing issues and discussions
- Review documentation in README.md
- Ask in discussions or open an issue
- Reach out to maintainers

## License

By contributing to PixelTale, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to PixelTale! 🌟
