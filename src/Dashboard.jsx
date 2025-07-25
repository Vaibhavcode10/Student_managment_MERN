import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Cards from './Cards';
import { useUser } from './context/UserProvider';

export default function Dashboard() {
  const location = useLocation();
  const isMainDashboard = location.pathname === '/dashboard';

  const { sidebarExpanded ,theme} = useUser(); // 🔥 Only need this now

  const [sidebarWidth, setSidebarWidth] = useState(0);

  // ✅ Update sidebar width based on expanded state
  useEffect(() => {
    setSidebarWidth(sidebarExpanded ? 256 : 90);
  }, [sidebarExpanded]);

  return (
    <div
    className={`h-screen flex flex-col relative ${
      theme === "dark" ? "bg-[#121212]" : "bg-white"
    }`}
  >
   
  
      {/* Navbar */}
      <div className="z-50 relative">
        <Navbar />
      </div>

      {/* Sidebar + Main Content */}
      <div className="flex flex-1 relative z-0 overflow-hidden">
        {/* Sidebar */}
        <div
          className="absolute top-0 left-0 h-full transition-all duration-150 ease-in-out"
          style={{ width: `${sidebarWidth}px` }}
        >
          <Sidebar />
        </div>

        {/* Main Body */}
        <div
          className="flex flex-col flex-1 overflow-y-auto transition-all duration-150 ease-in-out"
          style={{
            marginLeft: `${sidebarWidth}px`,
            minHeight: '100%',
          }}
        >
          {isMainDashboard ? (
            <div className="flex-1">
              <Cards />
            </div>
          ) : (
            <Outlet />
          )}
        </div>
      </div>
    </div>
  );
}
