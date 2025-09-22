import { useEffect, useMemo, useState } from 'react';
import { Branch } from '@/types/bitbucket';
import { Badge } from '@/components/ui/badge';
import { GitBranch, Calendar, Hash, Database } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';
import { useBitbucketData } from '@/hooks/useBitbucketData';

interface BranchGroupProps {
  branches: Branch[];
  searchTerm: string;
  showRepository?: boolean;
}

export function BranchGroup({ branches, searchTerm, showRepository = false }: BranchGroupProps) {
  const isMobile = useIsMobile();
  const [staleBranches, setStaleBranches] = useState<Record<string, boolean>>({});
  const { isBranchStale, isVersionBranch } = useBitbucketData();

  useEffect(() => {
    let isMounted = true;
    const checkStale = async () => {
      const results: Record<string, boolean> = {};
      await Promise.all(
        branches.map(async (branch) => {
          try {
            results[branch.name] = await isBranchStale(branch);
          } catch {
            results[branch.name] = false;
          }
        })
      );
      if (isMounted) setStaleBranches(results);
    };
    checkStale();
    return () => {
      isMounted = false;
    };
  }, [branches, isBranchStale]);

  const filteredBranches = useMemo(() => {
    return branches
      .filter(branch => {
        const branchMatch = branch.name.toLowerCase().includes(searchTerm.toLowerCase());
        const repoMatch = showRepository && branch.target.repository.name 
          ? branch.target.repository.name .toLowerCase().includes(searchTerm.toLowerCase())
          : false;

        const authorMatch = branch.target.author.user?.display_name.toLowerCase().includes(searchTerm.toLowerCase());
        return branchMatch || repoMatch || authorMatch;
      })
      .sort((a, b) => {
      

      const order = (name: string) => {
        if (isVersionBranch(name)) return 2; // version/release branches last
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
    <div className={`${isMobile ? 'space-y-2' : 'space-y-3'}`}>
      {filteredBranches.map((branch) => (
        <div
          key={'branchgroup-' + branch.target.repository.name + '-' + branch.name}
          className={`${isMobile ? 'flex flex-col gap-2 p-2' : 'flex items-center justify-between p-3'} border rounded-lg hover:bg-muted/20 transition-colors`}
        >
          <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-3'}`}>
            <GitBranch className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex gap-1">
                <a 
                  href={branch.links.html.href} 
                  target='_blank' 
                  rel='noopener noreferrer' 
                  className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'} truncate block`}
                >
                  {branch.name}
                </a>
              </div>
              <div className={`flex items-center ${isMobile ? 'gap-2 flex-wrap' : 'gap-4'} text-xs text-muted-foreground mt-1`}>
                <div className='flex items-center gap-1'>
                  <Database className="w-3 h-3" />
                  <a 
                    href={`/repository/${encodeURIComponent(branch.target.repository.name)}`} 
                    className="text-sm text-blue-600 dark:text-blue-400"
                  >
                    {branch.target.repository.name}
                  </a>
                </div>
                <div className="flex items-center gap-1">
                  <Hash className="w-3 h-3" />
                  <span className="font-mono">
                    <a href={`${branch.target.links.html.href}`} target='_blank' rel='noopener noreferrer'>
                      {branch.target.hash.slice(0, 7)}
                    </a>
                  </span>
                </div>
                <div className={`flex items-center gap-1 ${staleBranches[branch.name] === true ? 'text-red-600 dark:text-red-400' : ''}`}>
                  <Calendar className="w-3 h-3" />
                  <span>
                    {formatDistanceToNow(new Date(branch.target.date), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className={`flex items-center gap-2 ${isMobile ? 'self-start mt-1' : ''}`}>
            <Badge variant="outline" className="text-xs">
              {branch.target.author.user?.display_name || branch.target.author.raw}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}