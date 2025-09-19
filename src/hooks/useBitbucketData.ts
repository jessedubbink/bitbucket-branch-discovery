import { useState, useEffect, useCallback, useRef } from 'react';
import { Repository, Branch, GroupedBranches } from '@/types/bitbucket';
import { bitbucketApi } from '@/services/bitbucketApi';
import { toast } from 'sonner';

export function useBitbucketData() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [allBranches, setAllBranches] = useState<{
    [repoName: string]: Branch[];
  }>({});
  const [groupedBranches, setGroupedBranches] = useState<GroupedBranches>(
    {}
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const hasAutoFetched = useRef(false);

  const groupBranchesByUser = useCallback(
    (branches: { [repoName: string]: Branch[] }): GroupedBranches => {
      const grouped: GroupedBranches = {};

      Object.entries(branches).forEach(([repoName, repoBranches]) => {
        grouped[repoName] = {};

        repoBranches.forEach((branch) => {
          const userName =
            branch.target.author.user?.display_name ||
            branch.target.author.raw ||
            'Unknown';

          if (!grouped[repoName][userName]) {
            grouped[repoName][userName] = [];
          }

          grouped[repoName][userName].push(branch);
        });
      });

      return grouped;
    },
    []
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const repos = await bitbucketApi.getRepositories();
      setRepositories(repos);

      const branches = await bitbucketApi.getAllBranches(repos);
      setAllBranches(branches);

      const grouped = groupBranchesByUser(branches);
      setGroupedBranches(grouped);

      setIsConfigured(true);
      toast.success('Data fetched successfully');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      setIsConfigured(false);
    } finally {
      setLoading(false);
    }
  }, [groupBranchesByUser]); // `groupBranchesByUser` is a stable memoized function, so it's fine here.

  useEffect(() => {
    const checkAndFetchConfig = async () => {
      const configSource = await bitbucketApi.getConfigSource(); // Assuming this is async
      if (configSource !== 'none') {
        setIsConfigured(true);
        if (configSource === 'environment' && !hasAutoFetched.current) {
          toast.success('Using environment configuration');
          hasAutoFetched.current = true;
          await fetchData(); // Await fetchData to ensure sequential execution
        }
      }
    };
    checkAndFetchConfig();
  }, [fetchData]); // `fetchData` is a stable memoized function, so it's fine here.

  const handleConfigSubmit = useCallback(() => {
    setIsConfigured(true);
    fetchData();
  }, [fetchData]);

  const retry = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    repositories,
    allBranches,
    groupedBranches,
    loading,
    error,
    isConfigured,
    handleConfigSubmit,
    retry,
  };
}