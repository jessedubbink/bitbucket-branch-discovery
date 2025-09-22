import { Repository, Branch, BitbucketConfig } from '@/types/bitbucket';
import { toast } from 'sonner';

interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: number; // Unix timestamp when the rate limit resets
  resource: string;
  nearLimit: boolean;
}

interface RequestOptions {
  retryCount?: number;
  maxRetries?: number;
}

class BitbucketAPI {
  private config: BitbucketConfig = {
    workspace: import.meta.env.VITE_BITBUCKET_WORKSPACE || '',
    accessToken: import.meta.env.VITE_BITBUCKET_ACCESS_TOKEN || '',
  };

  private baseUrl = 'https://api.bitbucket.org/2.0';
  
  // Rate limiting properties
  public rateLimitInfo: RateLimitInfo = {
    limit: 1000, // Default for authenticated requests
    remaining: 1000,
    resetTime: Date.now() + 3600000, // 1 hour from now
    resource: 'api',
    nearLimit: false,
  };
  private readonly MAX_RETRIES = 3;
  private readonly BASE_RETRY_DELAY = 1000; // 1 second

  constructor() {
    this.validateEnvironmentConfig();
  }

  private validateEnvironmentConfig(): void {
    const { workspace, accessToken } = this.config;
    
    if (!workspace && !accessToken) {
      toast.warning('Bitbucket environment variables not configured. Using localStorage configuration instead.');
      return;
    }
    
    if (!workspace) {
      toast.warning('VITE_BITBUCKET_WORKSPACE environment variable is not set');
    }
    
    if (!accessToken) {
      toast.warning('VITE_BITBUCKET_ACCESS_TOKEN environment variable is not set');
    }
    
    if (workspace && accessToken) {
      toast.success('Bitbucket environment configuration loaded successfully');
    }
  }

  public isConfigured(): boolean {
    return !!(this.config.workspace && this.config.accessToken);
  }

  public getConfigSource(): 'environment' | 'manual' | 'none' {
    const envWorkspace = import.meta.env.VITE_BITBUCKET_WORKSPACE;
    const envToken = import.meta.env.VITE_BITBUCKET_ACCESS_TOKEN;
    
    if (envWorkspace && envToken) {
      return 'environment';
    } else if (this.config.workspace && this.config.accessToken) {
      return 'manual';
    } else {
      return 'none';
    }
  }

  private updateRateLimitInfo(response: Response): void {
    const limit = response.headers.get('X-RateLimit-Limit');
    const resource = response.headers.get('X-RateLimit-Resource');
    const nearLimit = response.headers.get('X-RateLimit-NearLimit');

    if (limit) {
      this.rateLimitInfo.limit = parseInt(limit, 10);
    }
    if (resource) {
      this.rateLimitInfo.resource = resource.replace(/"/g, ''); // Remove quotes
    }
    if (nearLimit) {
      this.rateLimitInfo.nearLimit = nearLimit.toLowerCase() === 'true';
    }

    // Calculate remaining requests based on near limit status
    if (this.rateLimitInfo.nearLimit) {
      this.rateLimitInfo.remaining = Math.floor(this.rateLimitInfo.limit * 0.2); // Less than 20%
    } else {
      // Estimate remaining requests (we don't get exact count from headers)
      this.rateLimitInfo.remaining = Math.floor(this.rateLimitInfo.limit * 0.8);
    }

    // Update reset time (1 hour rolling window)
    this.rateLimitInfo.resetTime = Date.now() + 3600000;
  }

  private async checkRateLimit(): Promise<void> {
    const now = Date.now();
    
    // Reset rate limit info if the window has passed
    if (now >= this.rateLimitInfo.resetTime) {
      this.rateLimitInfo.remaining = this.rateLimitInfo.limit;
      this.rateLimitInfo.resetTime = now + 3600000;
      this.rateLimitInfo.nearLimit = false;
    }

    // If we're near the limit, add a small delay
    if (this.rateLimitInfo.nearLimit && this.rateLimitInfo.remaining < 10) {
      console.warn('Approaching rate limit, adding delay...');
      await this.delay(2000); // 2 second delay when near limit
    }
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async makeRequestWithRetry(url: string, options: RequestInit, requestOptions: RequestOptions = {}): Promise<Response> {
    const { retryCount = 0, maxRetries = this.MAX_RETRIES } = requestOptions;

    await this.checkRateLimit();

    try {
      const response = await fetch(url, options);
      
      // Update rate limit info from response headers
      this.updateRateLimitInfo(response);

      if (response.status === 429) {
        // Rate limited
        if (retryCount < maxRetries) {
          const retryAfter = response.headers.get('Retry-After');
          const delayMs = retryAfter 
            ? parseInt(retryAfter, 10) * 1000 
            : this.BASE_RETRY_DELAY * Math.pow(2, retryCount); // Exponential backoff
          
          console.warn(`Rate limited. Retrying in ${delayMs}ms... (Attempt ${retryCount + 1}/${maxRetries})`);
          await this.delay(delayMs);
          
          return this.makeRequestWithRetry(url, options, { 
            retryCount: retryCount + 1, 
            maxRetries 
          });
        } else {
          throw new Error('Rate limit exceeded. Maximum retries reached.');
        }
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      if (retryCount < maxRetries && error instanceof TypeError) {
        // Network error, retry with exponential backoff
        const delayMs = this.BASE_RETRY_DELAY * Math.pow(2, retryCount);
        console.warn(`Network error. Retrying in ${delayMs}ms... (Attempt ${retryCount + 1}/${maxRetries})`);
        await this.delay(delayMs);
        
        return this.makeRequestWithRetry(url, options, { 
          retryCount: retryCount + 1, 
          maxRetries 
        });
      }
      throw error;
    }
  }

  private getAuthHeaders() {
    if (!this.isConfigured()) {
      throw new Error('Bitbucket configuration not set. Please configure workspace and access token.');
    }
    
    return {
      'Authorization': `Bearer ${this.config.accessToken}`,
      'Accept': 'application/json',
    };
  }

  async getRepositories(): Promise<Repository[]> {
    if (!this.isConfigured()) {
      // Try to load from environment variables as fallback
      const envWorkspace = import.meta.env.VITE_BITBUCKET_WORKSPACE;
      const envToken = import.meta.env.VITE_BITBUCKET_ACCESS_TOKEN;
      
      if (envWorkspace && envToken) {
        this.config = {
          workspace: envWorkspace,
          accessToken: envToken,
        };
        toast.success('Loaded configuration from environment variables');
      } else {
        toast.error('Bitbucket configuration is missing. Please set VITE_BITBUCKET_WORKSPACE and VITE_BITBUCKET_ACCESS_TOKEN environment variables or configure manually.');
        throw new Error('Bitbucket configuration not set. Please configure workspace and access token.');
      }
    }

    try {
      const response = await this.makeRequestWithRetry(
        `${this.baseUrl}/repositories/${this.config.workspace}?pagelen=100`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      const data = await response.json();
      const repositories = data.values || [];
      
      return repositories;
    } catch (error) {
      console.error('Error fetching repositories:', error);
      throw error;
    }
  }

  async getBranches(repoName: string): Promise<Branch[]> {
    if (!this.isConfigured()) {
      throw new Error('Bitbucket configuration not set. Please configure workspace and access token.');
    }

    try {
      const response = await this.makeRequestWithRetry(
        `${this.baseUrl}/repositories/${this.config.workspace}/${repoName}/refs/branches?pagelen=100`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      const data = await response.json();
      const branches = data.values || [];
      
      return branches;
    } catch (error) {
      console.error(`Error fetching branches for ${repoName}:`, error);
      throw error;
    }
  }

  async getAllBranches(repositories: Repository[]): Promise<{ [repoName: string]: Branch[] }> {
    const branchPromises = repositories.map(async (repo) => {
      try {
        const branches = await this.getBranches(repo.slug);
        return { [repo.name]: branches };
      } catch (error) {
        console.error(`Failed to fetch branches for ${repo.name}:`, error);
        return { [repo.name]: [] };
      }
    });

    const results = await Promise.all(branchPromises);
    return results.reduce((acc, curr) => ({ ...acc, ...curr }), {});
  }

  // Public method to get rate limit status
  getRateLimitStatus(): RateLimitInfo {
    return { ...this.rateLimitInfo };
  }

  // Public method to check if near rate limit
  isNearRateLimit(): boolean {
    return this.rateLimitInfo.nearLimit || this.rateLimitInfo.remaining < 50;
  }

  // Public method to get time until rate limit reset
  getTimeUntilReset(): number {
    return Math.max(0, this.rateLimitInfo.resetTime - Date.now());
  }
}

export const bitbucketApi = new BitbucketAPI();