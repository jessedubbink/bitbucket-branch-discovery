import { Outlet } from "react-router-dom";
import { RepositorySidebar } from "./RepositorySidebar";
import { useBitbucketData } from "@/hooks/useBitbucketData";
import { useMemo } from "react";
import NavBar from "./NavBar";

export function Layout() {
  const { repositories, allBranches, loading, refresh } = useBitbucketData();

  const branchCounts = useMemo(() => {
    const counts: { [repoName: string]: number } = {};
    Object.entries(allBranches).forEach(([repoName, branches]) => {
      counts[repoName] = branches.length;
    });
    return counts;
  }, [allBranches]);

  return (
    <div className="h-screen w-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <NavBar loading={loading} refresh={refresh} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <RepositorySidebar
          repositories={repositories}
          branchCounts={branchCounts}
        />

        {/* Main Content */}
        <Outlet />
      </div>
    </div>
  );
}
