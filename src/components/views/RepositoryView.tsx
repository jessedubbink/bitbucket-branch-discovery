import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { BranchGroup } from '@/components/BranchGroup';
import { SearchBar } from '@/components/SearchBar';
import { LoadingSkeleton } from '@/components/LoadingState';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, GitBranch, Users, Lock, Unlock, ExternalLink } from 'lucide-react';
import { useBitbucketData } from '@/hooks/useBitbucketData';
import { UserBranchGroup } from '../UserBranchGroup';

export default function RepositoryView() {
  const { repoName } = useParams<{ repoName: string }>();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  const {
    repositories,
    groupedBranches,
    loading,
  } = useBitbucketData();

  const selectedRepository = useMemo(() => {
    return repositories.find(repo => repo.name === repoName);
  }, [repositories, repoName]);

  const currentRepoData = useMemo(() => {
    if (!repoName || !groupedBranches[repoName]) {
      return null;
    }
    return groupedBranches[repoName];
  }, [repoName, groupedBranches]);

  const totalBranches = useMemo(() => {
    if (!currentRepoData) return 0;
    return Object.values(currentRepoData).reduce((total, branches) => total + branches.length, 0);
  }, [currentRepoData]);

  const filteredBranches = useMemo(() => {
    if (!currentRepoData) return 0;
    return Object.values(currentRepoData).reduce((total, branches) => {
      const filtered = branches.filter(branch =>
        branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (branch.target.author.user?.display_name || branch.target.author.raw || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
      return total + filtered.length;
    }, 0);
  }, [currentRepoData, searchTerm]);

  // Redirect to home if repository is not found
  useEffect(() => {
    if (repositories.length > 0 && !selectedRepository) {
      navigate('/');
    }
  }, [repositories, selectedRepository, navigate]);

  if (!selectedRepository || !currentRepoData) {
    return (
      <div className="flex items-center justify-center flex-1 bg-muted/5">
        <div className="text-center p-8 bg-card rounded-lg border shadow-sm">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <GitBranch className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">Repository Not Found</h3>
          <p className="text-muted-foreground mb-4">
            The requested repository "{repoName}" could not be found.
          </p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Repositories
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Repository Header */}
      <div className="flex-shrink-0 p-6 pb-4 border-b bg-muted/30">
        <div className="space-y-4">
          <div className="flex flex-col gap-4">
            <div className="flex">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Overview
              </Button>
            </div>
            
            <div className="bg-card p-4 rounded-lg border shadow-sm flex-1">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold">
                  {repoName}
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(selectedRepository.links.html.href, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View in Bitbucket
                </Button>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  {selectedRepository.is_private ? (
                    <div className='flex items-center bg-red-50 dark:bg-red-950 px-2 py-1 rounded-md'>
                      <Lock className='w-4 h-4 mr-2 text-red-600 dark:text-red-400' /> 
                      <span className="text-red-700 dark:text-red-300">Private</span>
                    </div>
                  ) : (
                    <div className='flex items-center bg-green-50 dark:bg-green-950 px-2 py-1 rounded-md'>
                      <Unlock className='w-4 h-4 mr-2 text-green-600 dark:text-green-400' /> 
                      <span className="text-green-700 dark:text-green-300">Public</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-950 px-2 py-1 rounded-md">
                  <GitBranch className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-blue-700 dark:text-blue-300">{totalBranches} branches</span>
                </div>
                
                <div className="flex items-center gap-1 bg-purple-50 dark:bg-purple-950 px-2 py-1 rounded-md">
                  <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-purple-700 dark:text-purple-300">{Object.keys(currentRepoData).length} contributors</span>
                </div>
                
                {selectedRepository.project && (
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Project:</span>
                    <a 
                      href={selectedRepository.project.links.html.href} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="hover:text-primary transition-colors font-medium"
                    >
                      {selectedRepository.project.name}
                    </a>
                  </div>
                )}
              </div>
              
              {selectedRepository.description && (
                <p className="text-sm text-muted-foreground mt-2">
                  {selectedRepository.description}
                </p>
              )}
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
                  <UserBranchGroup
                    key={userName}
                    userName={userName}
                    branches={branches}
                    searchTerm={searchTerm}
                    showRepository={false}
                  />
                ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
