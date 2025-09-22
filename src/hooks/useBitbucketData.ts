import { useState, useEffect, useCallback, useRef } from 'react';
import { Repository, Branch, GroupedBranches } from '@/types/bitbucket';
import { bitbucketApi } from '@/services/bitbucketApi';
import { toast } from 'sonner';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export function useBitbucketData() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [allBranches, setAllBranches] = useState<{
    [repoName: string]: Branch[];
  }>({});
  const [flatBranches, setFlatBranches] = useState<Branch[]>([]);
  const [groupedBranches, setGroupedBranches] = useState<GroupedBranches>(
    {}
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const hasAutoFetched = useRef(false);
  
  // Cache state and constants
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

  // Cache helper functions using localStorage
  const getCacheKey = useCallback((endpoint: string): string => {
    const configSource = bitbucketApi.getConfigSource();
    const workspace = configSource === 'environment' 
      ? import.meta.env.VITE_BITBUCKET_WORKSPACE 
      : bitbucketApi.getConfigSource() !== 'none' ? 'manual' : 'unknown';
    return `bitbucket_cache_${workspace}_${endpoint}`;
  }, []);

  const isValidCacheEntry = useCallback(<T>(entry: CacheEntry<T>): boolean => {
    return Date.now() < entry.expiresAt;
  }, []);

  const getCachedData = useCallback(<T>(key: string): T | null => {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;
      
      const entry = JSON.parse(cached) as CacheEntry<T>;
      if (entry && isValidCacheEntry(entry)) {
        return entry.data;
      }
      
      // Remove expired entry
      localStorage.removeItem(key);
      return null;
    } catch (error) {
      console.warn('Failed to read from cache:', error);
      localStorage.removeItem(key);
      return null;
    }
  }, [isValidCacheEntry]);

  const setCachedData = useCallback(<T>(key: string, data: T): void => {
    try {
      const now = Date.now();
      const entry: CacheEntry<T> = {
        data,
        timestamp: now,
        expiresAt: now + CACHE_DURATION,
      };
      localStorage.setItem(key, JSON.stringify(entry));
    } catch (error) {
      console.warn('Failed to write to cache:', error);
    }
  }, [CACHE_DURATION]);

  const clearCache = useCallback((): void => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('bitbucket_cache_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }, []);

  const clearExpiredCache = useCallback((): void => {
    try {
      const keys = Object.keys(localStorage);
      const now = Date.now();
      
      keys.forEach(key => {
        if (key.startsWith('bitbucket_cache_')) {
          try {
            const cached = localStorage.getItem(key);
            if (cached) {
              const entry = JSON.parse(cached) as CacheEntry<unknown>;
              if (now >= entry.expiresAt) {
                localStorage.removeItem(key);
              }
            }
          } catch {
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.warn('Failed to clear expired cache:', error);
    }
  }, []);

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

  // Cached API calls
  const getRepositoriesWithCache = useCallback(async (): Promise<Repository[]> => {
    const cacheKey = getCacheKey('repositories');
    const cachedData = getCachedData<Repository[]>(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }

    const repos = await bitbucketApi.getRepositories();
    setCachedData(cacheKey, repos);
    return repos;
  }, [getCacheKey, getCachedData, setCachedData]);

  const getBranchesWithCache = useCallback(async (repoName: string): Promise<Branch[]> => {
    const cacheKey = getCacheKey(`branches:${repoName}`);
    const cachedData = getCachedData<Branch[]>(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }

    const branches = await bitbucketApi.getBranches(repoName);
    setCachedData(cacheKey, branches);
    return branches;
  }, [getCacheKey, getCachedData, setCachedData]);

  const getAllBranchesWithCache = useCallback(async (repositories: Repository[]): Promise<{ [repoName: string]: Branch[] }> => {
    // Clean up expired cache entries before processing
    clearExpiredCache();
    
    const branchPromises = repositories.map(async (repo) => {
      try {
        const branches = await getBranchesWithCache(repo.slug);
        return { [repo.name]: branches };
      } catch (error) {
        console.error(`Failed to fetch branches for ${repo.name}:`, error);
        return { [repo.name]: [] };
      }
    });

    const results = await Promise.all(branchPromises);
    return results.reduce((acc, curr) => ({ ...acc, ...curr }), {});
  }, [getBranchesWithCache, clearExpiredCache]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const repos = await getRepositoriesWithCache();
      setRepositories(repos);

      const branches = await getAllBranchesWithCache(repos);
      setAllBranches(branches);

      setFlatBranches(Object.values(branches).flat());

      const grouped = groupBranchesByUser(branches);
      setGroupedBranches(grouped);

      setIsConfigured(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      setIsConfigured(false);
    } finally {
      setLoading(false);
    }
  }, [getRepositoriesWithCache, getAllBranchesWithCache, groupBranchesByUser]); // `groupBranchesByUser` is a stable memoized function, so it's fine here.

  useEffect(() => {
    const checkAndFetchConfig = async () => {
      const configSource = await bitbucketApi.getConfigSource(); // Assuming this is async
      if (configSource !== 'none') {
        setIsConfigured(true);
        if (configSource === 'environment' && !hasAutoFetched.current) {
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

  const refresh = useCallback(() => {
    clearCache();
    toast.success('Cache cleared - fetching fresh data');
    fetchData();
  }, [clearCache, fetchData]);

  const isVersionBranch = (name: string) =>
    // A version branch typically follows patterns like 'v1.0', 'versions/1.0', 'versions/1.0.0', 'release/1.0', 'release/1.0.0', 'versions/ASFT/v1.0', 'versions/ASFT/v1.0.0', 'versions/v1.9.1', etc.
    /^(v\d+(\.\d+)*|versions(\/[\w-]+)*\/v?\d+(\.\d+)*|release\/\d+(\.\d+)*)(-[\w\d]+)?$/.test(name);

  const isBranchStale = useCallback(async (branch: Branch): Promise<boolean> => {
    try {
      if (isVersionBranch(branch.name)) return false;
      if (branch.name === 'master') return false;
      if (branch.name === 'main') return false;
      if (branch.name.startsWith('develop')) return false;

      return await bitbucketApi.isBranchStale(branch, 30);
    } catch (error) {
      console.error('Failed to determine if branch is stale:', error);
      return false; // Assume not stale on error
    }
  }, []);

  return {
    repositories,
    allBranches,
    groupedBranches,
    flatBranches,
    loading,
    error,
    isConfigured,
    handleConfigSubmit,
    retry,
    refresh,
    clearCache,
    isBranchStale,
    isVersionBranch,
  };
}