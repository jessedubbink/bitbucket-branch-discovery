import { useMemo } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { LoadingSkeleton, LoadingSpinner } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GitBranch, Users } from 'lucide-react';
import { useBitbucketData } from '@/hooks/useBitbucketData';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { UserBranchGroup } from './components/UserBranchGroup';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'amount' | 'date'>('date');
  
  const {
    repositories,
    groupedBranches,
    loading,
    error,
    retry,
  } = useBitbucketData();

  // For the main page, show all branches from all repositories
  const allRepoData = useMemo(() => {
    const combined: { [userName: string]: any[] } = {};
    Object.entries(groupedBranches).forEach(([repoName, repoData]) => {
      Object.entries(repoData).forEach(([userName, branches]) => {
        if (!combined[userName]) {
          combined[userName] = [];
        }
        // Add repository context to each branch
        const branchesWithRepo = branches.map(branch => ({
          ...branch,
          repositoryName: repoName
        }));
        combined[userName].push(...branchesWithRepo);
      });
    });
    return combined;
  }, [groupedBranches]);

  const totalBranches = useMemo(() => {
    return Object.values(allRepoData).reduce((total, branches) => total + branches.length, 0);
  }, [allRepoData]);

  const filteredBranches = useMemo(() => {
    return Object.values(allRepoData).reduce((total, branches) => {
      const filtered = branches.filter(branch =>
        branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.repositoryName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        branch.target.author.user?.display_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return total + filtered.length;
    }, 0);
  }, [allRepoData, searchTerm]);

  if (error) {
    return (
      <div className="flex items-center justify-center flex-1 bg-muted/5">
        <ErrorState error={error} onRetry={retry} />
      </div>
    );
  }

  if (loading && repositories.length === 0) {
    return (
      <div className="flex items-center justify-center flex-1 bg-muted/5">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Search and Stats */}
      <div className="flex-shrink-0 p-6 pb-4 border-b bg-muted/30">
        <div className="space-y-4">
          <div className="bg-card p-4 rounded-lg border shadow-sm">
            <h2 className="text-xl font-semibold mb-2">All Repositories Overview</h2>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-950 px-2 py-1 rounded-md">
                <GitBranch className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-blue-700 dark:text-blue-300">{totalBranches} total branches</span>
              </div>
              <div className="flex items-center gap-1 bg-green-50 dark:bg-green-950 px-2 py-1 rounded-md">
                <span className="text-green-700 dark:text-green-300">{repositories.length} repositories</span>
              </div>
                
              <div className="flex items-center gap-1 bg-purple-50 dark:bg-purple-950 px-2 py-1 rounded-md">
                <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-purple-700 dark:text-purple-300">{Object.keys(allRepoData).length} contributors</span>
              </div>
            </div>
          </div>
          <div className="flex flex-row gap-4">
            <div className='w-full'>
              <SearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                totalBranches={totalBranches}
                filteredBranches={filteredBranches}
              />
            </div>
            <Select value={sortBy} onValueChange={(value: 'date' | 'amount') => setSortBy(value)}>
              <SelectTrigger className="w-50 min-w-[150px]">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Sort by Date</SelectItem>
                <SelectItem value="amount">Sort by Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Branch Groups */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6 pt-4 bg-muted/10">
            {loading ? (
              <LoadingSkeleton />
            ) : Object.keys(allRepoData).length === 0 ? (
              <div className="flex items-center justify-center flex-1 py-12">
              <div className="text-center p-8 bg-card rounded-lg border shadow-sm">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <GitBranch className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No Branches Found</h3>
                <p className="text-muted-foreground">
                Select a repository from the sidebar to view its branches
                </p>
              </div>
              </div>
            ) : (
              Object.entries(allRepoData)
              .sort(([, aBranches], [, bBranches]) => {
                if (sortBy === 'amount') {
                return bBranches.length - aBranches.length;
                } else {
                // sort by latest branch date in each group
                const aLatest = Math.max(...aBranches.map(b => new Date(b.target.date).getTime()));
                const bLatest = Math.max(...bBranches.map(b => new Date(b.target.date).getTime()));
                return bLatest - aLatest;
                }
              })
              .map(([userName, branches]) => (
                <UserBranchGroup
                  key={userName}
                  userName={userName}
                  avatarUrl={branches[0]?.target.author.user?.links.avatar.href}
                  branches={branches}
                  searchTerm={searchTerm}
                  showRepository={true}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

export default App;