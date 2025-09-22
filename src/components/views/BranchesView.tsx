import { useState, useMemo } from 'react';
import { BranchGroup } from '@/components/features/branches/BranchGroup';
import { SearchBar } from '@/components/features/search/SearchBar';
import { LoadingSkeleton, LoadingSpinner } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GitBranch, Layers } from 'lucide-react';
import { useBitbucketData } from '@/hooks/useBitbucketData';

export default function BranchesView() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const {
    repositories,
    flatBranches,
    loading,
    error,
    retry,
  } = useBitbucketData();

  const totalBranches = flatBranches.length;

  const filteredBranches = useMemo(() => {
    return flatBranches.filter(branch =>
      branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.target.repository.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (branch.target.author.user?.display_name || branch.target.author.raw || '').toLowerCase().includes(searchTerm.toLowerCase())
    ).length;
  }, [flatBranches, searchTerm]);

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
      {/* Header Section */}
      <div className="flex-shrink-0 p-6 pb-4 border-b bg-muted/30">
        <div className="space-y-4">
          <div className="bg-card p-4 rounded-lg border shadow-sm">
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <Layers className="w-5 h-5" />
              All Branches Overview
            </h2>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-950 px-2 py-1 rounded-md">
                <GitBranch className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-blue-700 dark:text-blue-300">{totalBranches} branches</span>
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
            ) : flatBranches.length === 0 ? (
              <div className="flex items-center justify-center flex-1 py-12">
                <div className="text-center p-8 bg-card rounded-lg border shadow-sm">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <GitBranch className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No Branches Found</h3>
                  <p className="text-muted-foreground">
                    No branches are available to display. Check your repository configuration.
                  </p>
                </div>
              </div>
            ) : (
              flatBranches
              .sort((a, b) => {
                // Sort by date
                return b.target.date.localeCompare(a.target.date);
              })
              .map((branch) => (
                <div key={'branchview-' + branch.target.repository.name + '-' + branch.name} className="mb-4">
                  <BranchGroup
                    branches={[branch]}
                    searchTerm={searchTerm}
                    showRepository={true}
                  />
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}