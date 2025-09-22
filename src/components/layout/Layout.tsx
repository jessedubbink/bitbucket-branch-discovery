import { Outlet } from "react-router-dom";
import { RepositorySidebar } from "./RepositorySidebar";
import { useBitbucketData } from "@/hooks/useBitbucketData";
import { useMemo, useState } from "react";
import { NavBar } from "./NavBar";
import { useIsMobile } from "@/hooks/use-mobile";

export function Layout() {
  const { repositories, allBranches, loading, refresh } = useBitbucketData();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      <NavBar 
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        loading={loading}
        refresh={refresh}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Overlay */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          ${isMobile ? 'fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-in-out' : 'relative'}
          ${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'}
          ${!isMobile ? 'w-80 lg:w-96' : ''}
        `}>
          <RepositorySidebar
            repositories={repositories}
            branchCounts={branchCounts}
            onClose={() => setSidebarOpen(false)}
            isMobile={isMobile}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
