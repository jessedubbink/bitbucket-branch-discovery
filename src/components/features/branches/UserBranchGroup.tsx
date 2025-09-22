import { useMemo, useState } from 'react';
import { Branch } from '@/types/bitbucket';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { BranchGroup } from './BranchGroup';
import { useIsMobile } from '@/hooks/use-mobile';

interface UserBranchGroupProps {
  userName: string;
  avatarUrl?: string;
  branches: Branch[];
  searchTerm: string;
  showRepository?: boolean;
}

export function UserBranchGroup({ userName, avatarUrl, branches, searchTerm, showRepository = false }: UserBranchGroupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const filteredBranches = useMemo(() => {
    return branches
      .filter(branch => {
        const branchMatch = branch.name.toLowerCase().includes(searchTerm.toLowerCase());
        const repoMatch = showRepository && branch.target.repository.name
          ? branch.target.repository.name.toLowerCase().includes(searchTerm.toLowerCase())
          : false;

        const authorMatch = branch.target.author.user?.display_name.toLowerCase().includes(searchTerm.toLowerCase());
        return branchMatch || repoMatch || authorMatch;
      })
      .sort((a, b) => {
      const isVersion = (name: string) =>
        // A version branch typically follows patterns like 'v1.0', 'versions/1.0', 'versions/1.0.0' 'release/1.0', 'release/1.0.0', and we also have a versions/ASFT/v1.0 and versions/ASFT/v1.0.0 etc.
        /^(v|versions\/|release\/)?\d+(\.\d+)*(-[\w\d]+)?$/.test(name);

      const order = (name: string) => {
        if (isVersion(name)) return 2; // version/release branches last
        if (name === 'master') return 0;
        if (name.startsWith('develop')) return 1;
        return 1;
      };

      const orderA = order(a.name);
      const orderB = order(b.name);

      if (orderA !== orderB) {
        return orderA - orderB;
      }

      // If both are version/release branches, sort by version number descending
      if (orderA === 2 && orderB === 2) {
        // Extract version numbers for comparison
        const extractVersion = (name: string) => {
        const match = name.match(/(\d+(\.\d+)*)(-[\w\d]+)?/);
        return match ? match[1] : '';
        };
        const versionA = extractVersion(a.name);
        const versionB = extractVersion(b.name);

        // Compare version numbers descending (biggest last)
        if (versionA && versionB) {
        const splitA = versionA.split('.').map(Number);
        const splitB = versionB.split('.').map(Number);
        for (let i = 0; i < Math.max(splitA.length, splitB.length); i++) {
          const numA = splitA[i] || 0;
          const numB = splitB[i] || 0;
          if (numA !== numB) {
          return numA - numB;
          }
        }
        }
        // Fallback to name
        return a.name.localeCompare(b.name);
      }

      // Otherwise, sort by date descending (most recent first)
      return b.target.date.localeCompare(a.target.date);
      });
  }, [branches, searchTerm]);

  if (filteredBranches.length === 0) {
    return null;
  }

  return (
    <Card className={`${isMobile ? 'mb-3' : 'mb-4'}`}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className={`cursor-pointer ${isMobile ? 'py-3' : ''}`}>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" className="p-0 h-auto">
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </Button>
                <div className="flex items-center gap-2">
                  <img
                    className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} rounded-full`}
                    src={avatarUrl || 'https://www.gravatar.com/avatar/?d=mp&f=y'}
                    alt={userName}
                  />
                  <span className={`${isMobile ? 'text-sm' : 'text-base'}`}>{userName}</span>
                </div>
              </div>
              <Badge variant="secondary" className={isMobile ? 'text-xs' : ''}>
                {filteredBranches.length} branch{filteredBranches.length !== 1 ? 'es' : ''}
              </Badge>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className={`pt-0 ${isMobile ? 'px-3 pb-3' : ''}`}>
            <BranchGroup branches={filteredBranches} searchTerm={searchTerm} showRepository />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}