import { Button } from '@/components/ui/button';
import { Menu, RefreshCw } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { ThemeSwitch, useTheme } from '../common';

interface NavBarProps {
  onToggleSidebar: () => void;
  title?: string;
  loading?: boolean;
  refresh?: () => void;
}

export function NavBar({ onToggleSidebar, title = "Bitbucket Branch Discovery", loading, refresh }: NavBarProps) {
  const isMobile = useIsMobile();
  const { theme } = useTheme();

  // Reusable GitHub button component
  const GitHubButton = () => (
    <a
      href="https://github.com/jessedubbink/bitbucket-branch-discovery"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="GitHub Repository"
      className="text-sm text-muted-foreground transition-colors"
      style={{ display: "inline-flex", alignItems: "center" }}
    >
      By Jesse Dubbink
      <svg
        width={18}
        height={18}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`ml-2 ${theme === "dark" ? "invert" : ""}`}
        style={theme === "dark" ? { filter: "invert(1)" } : undefined}
        aria-hidden="true"
      >
        <title>GitHub</title>
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
    </a>
  );

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 gap-4">
        {isMobile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="h-8 w-8 p-0"
          >
            <Menu className="h-4 w-4" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        )}

        <div className={`flex ${isMobile ? 'flex-1 flex-col' : 'gap-4'}`}>
          <h1 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold tracking-tight`}>
            {title}
          </h1>
          <GitHubButton />
        </div>

        <div className="hidden lg:flex flex-1 justify-center">
          <div className="flex items-center gap-4">
            <a href="/" className="text-sm text-blue-600 dark:text-blue-400">
              View Repositories
            </a>
            <a
              href="/branches"
              className="text-sm text-blue-600 dark:text-blue-400"
            >
              View Branches
            </a>
          </div>
        </div>
        
        <div className="hidden lg:flex items-center gap-2">
          <ThemeSwitch />
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={loading}
            className="shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <div className="flex lg:hidden items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={loading}
            className="shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>


      </div>
    </header>
  );
}