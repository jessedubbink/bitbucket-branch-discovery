export interface Repository {
  uuid: string;
  name: string;
  slug: string;
  full_name: string;
  description?: string;
  is_private: boolean;
  created_on: string;
  updated_on: string;
  project: {
    key: string;
    name: string;
    type: string;
    links: {
      html: {
        href: string;
      }
      self: {
        href: string;
      }
      avatar: {
        href: string;
      }
    }
  }
  mainbranch: {
    name: string;
    type: string;
  },
  links: {
    self: {
        href: string;
    },
    html: {
      href: string;
    },
    avatar: {
      href: string;
    },
    pullrequests: {
      href: string;
    },
    commits: {
      href: string;
    },
    forks: {
      href: string;
    },
    watchers: {
      href: string;
    },
    branches: {
      href: string;
    },
    tags: {
      href: string;
    },
    downloads: {
      href: string;
    },
    source: {
      href: string;
    }
  };
}

export interface Branch {
  name: string;
  target: {
    type: string;
    hash: string;
    date: string;
    repository: {
      name: string;
    },
    parents: Array<{
      hash: string;
      links: {
        self: {
          href: string;
        };
        html: {
          href: string;
        };
      };
      type: string;
    }>,
    author: {
      user?: {
        display_name: string;
        uuid: string;
        account_id: string;
        links: {
          avatar: {
            href: string;
          };
        }
      };
      raw: string;
    };
    links: {
      html: {
        href: string;
      };
    }
  };
  links: {
    self: {
        href: string;
    },
    commits: {
        href: string;
    },
    html: {
        href: string;
    },
    pullrequest_create: {
        href: string;
    }
  };
}

export interface User {
  uuid: string;
  display_name: string;
  account_id: string;
}

export interface GroupedBranches {
  [repositoryName: string]: {
    [userName: string]: Branch[];
  };
}

export interface BitbucketConfig {
  workspace: string;
  accessToken: string;
}