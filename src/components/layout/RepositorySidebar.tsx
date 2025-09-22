import { Repository } from '@/types/bitbucket';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, GitBranch, Lock, Unlock, X } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeSwitch } from '../common';

interface RepositorySidebarProps {
  repositories: Repository[];
  branchCounts: { [repoName: string]: number };
  onClose?: () => void;
  isMobile?: boolean;
}

export function RepositorySidebar({ 
  repositories, 
  branchCounts,
  onClose,
  isMobile = false
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
    // Close sidebar on mobile after selection
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <div className="w-full h-full border-r bg-muted/90 flex flex-col">
      {/* Mobile header with close button */}
      {isMobile && (
        <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur">
          <h2 className="font-semibold text-lg">Repositories</h2>
          <div className="flex items-center gap-2">
            <ThemeSwitch />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      )}
      
      <div className="p-2 border-b flex-shrink-0">
        {!isMobile && (
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
        )}
        {isMobile && (
          <div className="flex items-center justify-between mb-2">
            <Button variant="outline" size="sm" onClick={() => {navigate('/'); if (onClose) onClose();}}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              All Repositories
            </Button>
            <Button variant="outline" size="sm" onClick={() => {navigate('/branches'); if (onClose) onClose();}}>
              <GitBranch className="w-4 h-4 mr-2" />
              All Branches
            </Button>
          </div>
        )}
        <Input
          type="text"
          placeholder="Search repositories..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className={`w-full bg-background ${!isMobile ? 'mt-3' : ''}`}
        />
      </div>
      
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className={`${isMobile ? 'p-2' : 'p-4'} space-y-2`}>
            {filteredRepos.map((repo) => (
              <Card
                key={repo.uuid}
                className={`cursor-pointer transition-colors hover:bg-accent/50 ${
                  selectedRepo === repo.name ? 'border-primary' : ''
                }`}
                onClick={() => handleRepoClick(repo.name)}
              >
                <div className={`${isMobile ? 'p-2' : 'p-3'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {repo.is_private ? (
                          <Lock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                        ) : (
                          <Unlock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                        )}
                        <h3 className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'} truncate`}>{repo.name}</h3>
                      </div>
                      {repo.description && !isMobile && (
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