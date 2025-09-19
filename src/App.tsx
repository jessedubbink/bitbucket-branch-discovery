import { useState, useMemo } from 'react';
import { RepositorySidebar } from '@/components/RepositorySidebar';
import { BranchGroup } from '@/components/BranchGroup';
import { SearchBar } from '@/components/SearchBar';
import { LoadingSkeleton, LoadingSpinner } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { GitBranch, Users, RefreshCw } from 'lucide-react';
import { useBitbucketData } from '@/hooks/useBitbucketData';
import { Repository } from './types/bitbucket';

function App() {
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [selectedRepoObject, setSelectedRepoObject] = useState<Repository | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const {
    repositories,
    allBranches,
    groupedBranches,
    loading,
    error,
    retry,
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

  if (error) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Bitbucket Branch Manager</h1>
        </div>
        <ErrorState error={error} onRetry={retry} />
      </div>
    );
  }

  if (loading && repositories.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Bitbucket Branch Manager</h1>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-shrink-0 z-40">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <GitBranch className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Bitbucket Branch Discovery</h1>
              {selectedRepo && (
                <p className="text-sm text-muted-foreground">
                  {selectedRepo} • {totalBranches} branches
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={retry}
              disabled={loading}
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
              <div className="flex-shrink-0 p-6 pb-4 border-b bg-background">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold">
                        <a href={selectedRepoObject?.links.html.href} target="_blank" rel="noopener noreferrer">
                          {selectedRepo}
                        </a>
                      </h2>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <GitBranch className="w-4 h-4" />
                          <span>{totalBranches} branches</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <p>{Object.keys(currentRepoData).length} contributors</p>
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {searchTerm ? `${filteredBranches} filtered` : `${totalBranches} total`}
                    </Badge>
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
                  <div className="p-6 pt-4">
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
            <div className="flex items-center justify-center flex-1">
              <div className="text-center">
                <GitBranch className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
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