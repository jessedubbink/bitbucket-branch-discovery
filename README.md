# Bitbucket Branch Discovery 🌳

A modern React application for exploring and managing Bitbucket repositories and their branches. Built with TypeScript, Vite, and Tailwind CSS, this tool provides an intuitive interface to visualize branches across multiple repositories in your Bitbucket workspace.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## ✨ Features

- 🏢 **Multi-Repository Support**: Browse all repositories in your Bitbucket workspace
- 👥 **Branch Grouping**: Organize branches by author for better visibility
- 🔍 **Smart Search**: Filter branches and authors with real-time search
- 📊 **Branch Analytics**: View branch counts and statistics per repository
- ⚡ **Performance Optimized**: Built-in caching and rate limiting for Bitbucket API
- 🎨 **Modern UI**: Clean, responsive design with shadcn/ui components
- 🔧 **Flexible Configuration**: Support for environment variables or runtime configuration
- 📱 **Mobile Responsive**: Works seamlessly on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Bitbucket workspace access with App Password

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jessedubbink/bitbucket-branch-discovery.git
   cd bitbucket-branch-discovery
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Configure Bitbucket access**
   
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your Bitbucket credentials:
   ```bash
   VITE_BITBUCKET_WORKSPACE=your-workspace-name
   VITE_BITBUCKET_ACCESS_TOKEN=your-access-token
   ```

4. **Start the development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173`

## 🔐 Bitbucket Setup

### Creating an Access Token

1. Go to your Bitbucket workspace settings
2. Navigate to **Access tokens** under **Access management**
3. Click **Create access token**
4. Give it a descriptive name (e.g., "Branch Discovery Tool")
5. Select the following permissions:
   - **Repositories: Read**
   - **Account: Read**
6. Copy the generated password - you won't see it again!

### Configuration

**Environment Variables**
- Set `VITE_BITBUCKET_WORKSPACE` and `VITE_BITBUCKET_ACCESS_TOKEN` in your `.env` file
- The app will automatically use these credentials

## 🏗️ Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # Reusable UI components (shadcn/ui)
│   ├── BranchGroup.tsx  # Branch grouping and display
│   ├── ErrorState.tsx   # Error handling UI
│   ├── LoadingState.tsx # Loading indicators
│   ├── RepositorySidebar.tsx # Repository navigation
│   └── SearchBar.tsx    # Search functionality
├── hooks/               # Custom React hooks
│   ├── useBitbucketData.ts # Main data fetching hook
│   └── use-mobile.tsx   # Mobile detection utility
├── services/            # API services
│   └── bitbucketApi.ts  # Bitbucket API client
├── types/               # TypeScript definitions
│   └── bitbucket.ts     # Bitbucket API types
├── lib/                 # Utilities
│   └── utils.ts         # Helper functions
└── App.tsx              # Main application component
```

## 🔧 Available Scripts

```bash
# Development
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm lint         # Run ESLint

# Using npm
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

## 🎨 Tech Stack

### Core Technologies
- **React 18** - UI library with modern hooks
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework

### UI Components
- **Radix UI** - Accessible component primitives
- **shadcn/ui** - Pre-built component library
- **Lucide React** - Beautiful icon library
- **Sonner** - Toast notifications

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

## 🚀 Performance Features

### API Optimization
- **Response Caching**: API responses cached for 5 minutes
- **Rate Limiting**: Built-in protection against API rate limits
- **Retry Logic**: Automatic retry with exponential backoff
- **Request Deduplication**: Prevents duplicate API calls

### React Optimization
- **useCallback**: Memoized functions to prevent unnecessary re-renders
- **useMemo**: Cached computed values for better performance
- **Code Splitting**: Optimized bundle loading

## 🔄 API Integration

The application integrates with the Bitbucket REST API v2:

- **Repositories**: Fetches all repositories in the workspace
- **Branches**: Retrieves branch information for each repository
- **Authors**: Groups branches by commit author
- **Metadata**: Includes commit dates, branch names, and author info

### Rate Limiting
- Respects Bitbucket API rate limits
- Automatic retry with exponential backoff
- Visual indicators for rate limit status

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Troubleshooting

### Common Issues

**"Authentication failed"**
- Verify your App Password has the correct permissions
- Check that your workspace name is correct
- Ensure the access token is properly set

**"No repositories found"**
- Confirm you have access to repositories in the workspace
- Check if the workspace name is spelled correctly
- Verify the App Password has "Repositories: Read" permission

**Rate limit errors**
- The app automatically handles rate limits with retry logic
- If you hit limits frequently, consider reducing the refresh frequency

### Getting Help

- Check the [Issues](https://github.com/jessedubbink/bitbucket-branch-discovery/issues) page
- Create a new issue with detailed information about your problem
- Include browser console errors

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Radix UI](https://www.radix-ui.com/) for accessible primitives
- [Lucide](https://lucide.dev/) for the icon set
- [Bitbucket API](https://developer.atlassian.com/bitbucket/api/2/reference/) for the data access

---

Made with ❤️ by [Jesse Dubbink](https://github.com/jessedubbink)