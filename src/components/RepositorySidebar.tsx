import { Repository } from '@/types/bitbucket';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GitBranch, Lock, Unlock } from 'lucide-react';
import { useState } from 'react';
import { Input } from './ui/input';
import { useNavigate, useLocation } from 'react-router-dom';

interface RepositorySidebarProps {
  repositories: Repository[];
  branchCounts: { [repoName: string]: number };
}

export function RepositorySidebar({ 
  repositories, 
  branchCounts 
}: RepositorySidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'branches'>('name');
  const navigate = useNavigate();
  const location = useLocation();

  const filteredRepos = repositories
    .filter(repo => repo.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else {
        const branchCountA = branchCounts[a.name] || 0;
        const branchCountB = branchCounts[b.name] || 0;
        return branchCountB - branchCountA; // Sort by branch count descending
      }
    });

  const totalBranches = Object.values(branchCounts).reduce((sum, count) => sum + count, 0);
  
  // Get current selected repo from URL
  const selectedRepo = location.pathname.includes('/repository/') 
    ? decodeURIComponent(location.pathname.split('/repository/')[1]) 
    : null;

  const handleRepoClick = (repoName: string) => {
    navigate(`/repository/${encodeURIComponent(repoName)}`);
  };

  return (
    <div className="w-96 border-r bg-muted/10 flex flex-col">
      <div className="p-4 border-b flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <GitBranch className="w-5 h-5" />
              Repositories
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {repositories.length} repositories found
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {totalBranches} branches found
            </p>
          </div>
          <div>
            <Select value={sortBy} onValueChange={(value: 'name' | 'branches') => setSortBy(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Sort by Name (A-Z)</SelectItem>
                <SelectItem value="branches">Sort by Branch Count</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Input
          type="text"
          placeholder="Search repositories..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="mt-3 w-full"
        />
      </div>
      
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-2 space-y-2">
            {filteredRepos.map((repo) => (
              <Card
                key={repo.uuid}
                className={`cursor-pointer transition-colors hover:bg-accent/50 ${
                  selectedRepo === repo.name ? 'border-primary' : ''
                }`}
                onClick={() => handleRepoClick(repo.name)}
              >
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {repo.is_private ? (
                          <Lock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                        ) : (
                          <Unlock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                        )}
                        <h3 className="font-medium text-sm truncate">{repo.name}</h3>
                      </div>
                      {repo.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {repo.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {branchCounts[repo.name] || 0} branches
                    </Badge>
                    {repo.is_private && (
                      <Badge variant="outline" className="text-xs">
                        Private
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}