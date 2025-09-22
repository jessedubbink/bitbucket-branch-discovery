import { GitBranch, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "./ThemeProvider";
import ThemeSwitch from "./ThemeSwitch";

interface NavBarProps {
  loading: boolean;
  refresh: () => void;
}

export default function NavBar({ loading, refresh }: NavBarProps) {
  const { theme } = useTheme();

  // Reusable GitHub button component
  const GitHubButton = () => (
    <a
      href="https://github.com/jessedubbink/bitbucket-branch-discovery"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="GitHub Repository"
      className="text-sm text-muted-foreground hover:text-primary transition-colors"
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
    <div className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/60 flex-shrink-0 z-40 shadow-sm">
      <div className="flex items-center justify-between p-4">
        {/* Title (left) */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
            <GitBranch className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold flex items-center whitespace-nowrap">
              Bitbucket Branch Discovery
            </h1>
            <div className="flex items-center">
              <p className=""></p>
              <GitHubButton />
            </div>
          </div>
        </div>

        {/* Links (center) */}
        <div className="flex-1 flex justify-center">
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

        {/* Helper buttons (right) */}
        <div className="flex items-center gap-2">
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
      </div>
    </div>
  );
}
