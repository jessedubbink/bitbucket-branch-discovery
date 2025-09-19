import { useMemo, useState } from 'react';
import { Branch } from '@/types/bitbucket';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, GitBranch, Calendar, Hash } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface BranchGroupProps {
  userName: string;
  avatarUrl?: string;
  branches: Branch[];
  searchTerm: string;
}

export function BranchGroup({ userName, avatarUrl, branches, searchTerm }: BranchGroupProps) {
  const [isOpen, setIsOpen] = useState(true);

  const filteredBranches = useMemo(() => {
    return branches
      .filter(branch => branch.name.toLowerCase().includes(searchTerm.toLowerCase()))
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
    <Card className="mb-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" className="p-0 h-auto">
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4 text-white" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-white" />
                  )}
                </Button>
                <div className="flex items-center gap-2">
                  <img
                    className="w-8 h-8 rounded-full"
                    src={avatarUrl || 'https://www.gravatar.com/avatar/?d=mp&f=y'}
                    alt={userName}
                  />
                  <span className="text-base">{userName}</span>
                </div>
              </div>
              <Badge variant="secondary">
                {filteredBranches.length} branch{filteredBranches.length !== 1 ? 'es' : ''}
              </Badge>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {filteredBranches.map((branch) => (
                <div
                  key={branch.name}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <GitBranch className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <a href={branch.links.html.href} target='_blank' rel='noopener noreferrer' className="font-medium text-sm">{branch.name}</a>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <div className="flex items-center gap-1">
                          <Hash className="w-3 h-3" />
                          <span className="font-mono">{branch.target.hash.slice(0, 7)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {formatDistanceToNow(new Date(branch.target.date), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {branch.target.author.user?.display_name || branch.target.author.raw}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}