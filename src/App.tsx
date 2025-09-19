import { useState, useMemo } from 'react';
import { RepositorySidebar } from '@/components/RepositorySidebar';
import { BranchGroup } from '@/components/BranchGroup';
import { SearchBar } from '@/components/SearchBar';
import { LoadingSkeleton, LoadingSpinner } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GitBranch, Users, RefreshCw, Lock, Unlock } from 'lucide-react';
import { useBitbucketData } from '@/hooks/useBitbucketData';
import { Repository } from './types/bitbucket';
import { useTheme } from './components/ThemeProvider';
import ThemeSwitch from './components/ThemeSwitch';

function App() {
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [selectedRepoObject, setSelectedRepoObject] = useState<Repository | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { theme } = useTheme()

  
  const {
    repositories,
    allBranches,
    groupedBranches,
    loading,
    error,
    retry,
    refresh,
  } = useBitbucketData();

  const branchCounts = useMemo(() => {
    const counts: { [repoName: string]: number } = {};
    Object.entries(allBranches).forEach(([repoName, branches]) => {
      counts[repoName] = branches.length;
    });
    return counts;
  }, [allBranches]);

  const currentRepoData = useMemo(() => {
    if (!selectedRepo || !groupedBranches[selectedRepo]) {
      return null;
    }
    return groupedBranches[selectedRepo];
  }, [selectedRepo, groupedBranches]);

  const totalBranches = useMemo(() => {
    if (!currentRepoData) return 0;
    return Object.values(currentRepoData).reduce((total, branches) => total + branches.length, 0);
  }, [currentRepoData]);

  const filteredBranches = useMemo(() => {
    if (!currentRepoData) return 0;
    return Object.values(currentRepoData).reduce((total, branches) => {
      const filtered = branches.filter(branch =>
        branch.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return total + filtered.length;
    }, 0);
  }, [currentRepoData, searchTerm]);

  // Auto-select first repo when repositories load
  useState(() => {
    if (repositories.length > 0 && !selectedRepo) {
      setSelectedRepo(repositories[0].name);
      setSelectedRepoObject(repositories[0]);
    }
  });

  // Reusable GitHub button component
  const GitHubButton = () => (
    <Button 
      variant="link" 
      size="sm" 
      onClick={() => window.open('https://github.com/jessedubbink/bitbucket-branch-discovery', '_blank')}
    >
      <svg
        role="img"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-12 h-12 text-primary ${theme === 'dark' ? 'invert' : ''}`}
        style={theme === 'dark' ? { filter: 'invert(1)' } : undefined}
      >
        <title>GitHub</title>
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
      </svg>
    </Button>
  );

  // Common header component to avoid repetition
  const renderHeader = () => (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">
        Bitbucket Branch Discovery - Jesse Dubbink 
        <GitHubButton />
      </h1>
    </div>
  );

  if (error) {
    return (
      <div className="min-h-screen bg-background p-4">
        {renderHeader()}
        <ErrorState error={error} onRetry={retry} />
      </div>
    );
  }

  if (loading && repositories.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4">
        {renderHeader()}
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/60 flex-shrink-0 z-40 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
              <GitBranch className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">
                Bitbucket Branch Discovery - Jesse Dubbink 
                <GitHubButton />
              </h1>
              {selectedRepo && (
                <p className="text-sm text-muted-foreground">
                  {selectedRepo} • {totalBranches} branches
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <ThemeSwitch />
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={loading}
              className="shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <RepositorySidebar
          repositories={repositories}
          selectedRepo={selectedRepo}
          onRepoSelect={setSelectedRepo}
          onRepoSelectObject={setSelectedRepoObject}
          branchCounts={branchCounts}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedRepo && selectedRepoObject && currentRepoData ? (
            <>
              {/* Search and Stats */}
              <div className="flex-shrink-0 p-6 pb-4 border-b bg-muted/30">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="bg-card p-4 rounded-lg border shadow-sm flex-1 mr-4">
                      <h2 className="text-xl font-semibold mb-2">
                        <a href={selectedRepoObject.links.html.href} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                          {selectedRepo}
                        </a>
                      </h2>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          {selectedRepoObject?.is_private ? (
                            <div className='flex items-center bg-red-50 dark:bg-red-950 px-2 py-1 rounded-md'>
                              <Lock className='w-4 h-4 mr-2 text-red-600 dark:text-red-400' /> 
                              <p className="text-red-700 dark:text-red-300">Private</p>
                            </div>
                            ) : (
                            <div className='flex items-center bg-green-50 dark:bg-green-950 px-2 py-1 rounded-md'>
                              <Unlock className='w-4 h-4 mr-2 text-green-600 dark:text-green-400' /> 
                              <p className="text-green-700 dark:text-green-300">Public</p>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-950 px-2 py-1 rounded-md">
                          <GitBranch className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span className="text-blue-700 dark:text-blue-300">{totalBranches} branches</span>
                        </div>
                        <div className="flex items-center gap-1 bg-purple-50 dark:bg-purple-950 px-2 py-1 rounded-md">
                          <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <p className="text-purple-700 dark:text-purple-300">{Object.keys(currentRepoData).length} contributors</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Project:</span>
                          <a href={selectedRepoObject.project.links.html.href} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors font-medium">
                            {selectedRepoObject.project.name}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <SearchBar
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    totalBranches={totalBranches}
                    filteredBranches={filteredBranches}
                  />
                </div>
              </div>

              {/* Branch Groups */}
              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="p-6 pt-4 bg-muted/10">
                    {loading ? (
                      <LoadingSkeleton />
                    ) : (
                      Object.entries(currentRepoData)
                        .sort(([, aBranches], [, bBranches]) => bBranches.length - aBranches.length)
                        .map(([userName, branches]) => (
                          <BranchGroup
                            key={userName}
                            userName={userName}
                            avatarUrl={branches[0]?.target.author.user?.links.avatar.href}
                            branches={branches}
                            searchTerm={searchTerm}
                          />
                        ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center flex-1 bg-muted/5">
              <div className="text-center p-8 bg-card rounded-lg border shadow-sm">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <GitBranch className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">Select a Repository</h3>
                <p className="text-muted-foreground">
                  Choose a repository from the sidebar to view its branches
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;