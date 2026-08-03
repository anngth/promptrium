# Promptrium 🚀

[![Release and Deploy](https://github.com/nguyenthanhan/promptrium/workflows/Deploy%20and%20Release/badge.svg)](https://github.com/nguyenthanhan/promptrium/actions/workflows/deploy-and-release.yml)
[![Deploy on Vercel](https://img.shields.io/badge/Deploy%20on-Vercel-black)](https://vercel.com/heimers-projects/promptrium)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**Promptrium** is a modern, offline-first AI prompt management application that helps you organize, search, and reuse your AI prompts efficiently. Built with Next.js 16, React 19, and TypeScript, it provides a beautiful, responsive interface for managing your prompt library.

## ✨ Features

### 📝 **Prompt Management**

- **Create, Edit & Delete**: Full CRUD operations for prompt management
- **Rich Text Support**: Store detailed prompts with titles, content, and descriptions
- **Tagging System**: Organize prompts with custom tags for better categorization
- **Favorites**: Mark important prompts as favorites for quick access

### 🔍 **Search & Discovery**

- **Advanced Search**: Real-time search across prompt titles, content, and descriptions
- **Tag Filtering**: Filter prompts by one or multiple tags
- **Favorites Filter**: Quickly view only your favorite prompts
- **Smart Sorting**: Sort by creation date or last updated

### 📊 **Analytics & Tracking**

- **Usage Statistics**: Track how often you use each prompt
- **Creation & Update Timestamps**: Keep track of when prompts were created and modified
- **Prompt Statistics**: View total prompts, favorites, and tag counts at a glance

### 🎨 **User Experience**

- **Modern Layout**: A new, improved layout with a responsive sidebar, header, and main content area
- **Grid View**: Clean 3-column grid layout for optimal prompt browsing
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark/Light Mode**: Manual theme toggle with smooth transitions and persistent preference
- **Theme System**: CSS-first theming with TailwindCSS v4 for consistent colors across modes
- **One-Click Copy**: Copy prompts to clipboard with visual feedback
- **Toast Notifications**: Immediate feedback for all user actions
- **Loading States**: Smooth loading experience with skeleton screens

### 💾 **Data Management**

- **Local Storage**: All data stored locally in your browser (no server required)
- **Import/Export**: Backup and restore your prompts via JSON files
- **Data Validation**: Robust validation to ensure data integrity
- **Offline First**: Works completely offline once loaded

### 🔧 **Developer Experience**

- **TypeScript**: Full type safety throughout the application
- **Modern React**: Built with React 19 and modern hooks
- **Next.js 16**: App Router with Turbopack as default dev bundler
- **TailwindCSS v4**: CSS-first configuration with native CSS variables and animations
- **Component Architecture**: Well-structured, reusable components
- **Performance Optimized**: Memoized components and efficient state management
- **Code Formatting**: Integrated with Prettier for consistent code style
- **Theme Variables**: Centralized color system with CSS variables for easy customization

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (recommended: latest LTS)
- [pnpm](https://pnpm.io/) (recommended; project uses `packageManager: "pnpm@10.18.1"`) or npm/yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/nguyenthanhan/promptrium.git
   cd promptrium
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

   Or with npm: `npm install`

3. **Start the development server**

   ```bash
   pnpm dev
   ```

   This runs Next.js 16 with Turbopack. Open [http://localhost:3000](http://localhost:3000) in your browser.

   With npm: `npm run dev`

### Available Scripts

All commands below use **pnpm**; replace with `npm run <script>` if you use npm.

```bash
# Development
pnpm dev          # Start dev server (Next.js 16 + Turbopack)
pnpm dev:turbo    # Same as dev (Turbopack is default in Next.js 16)

# Build & Deploy
pnpm build        # Build for production
pnpm start        # Start production server

# Code quality
pnpm lint         # Run ESLint
pnpm format       # Format code with Prettier
pnpm format:check # Check formatting without writing
pnpm clean        # Remove .next and node_modules cache

# Release
pnpm release             # Create a new release
pnpm release:patch       # Patch release (0.0.x)
pnpm release:minor       # Minor release (0.x.0)
pnpm release:major       # Major release (x.0.0)
pnpm changelog           # Extract changelog
```

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
5. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style and conventions
- Add TypeScript types for new features
- Test your changes across different screen sizes
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js 16](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Fonts from [Vercel](https://vercel.com/font)

---

**Made with ❤️ for the AI community**
