import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Cards from './Cards';
import { useUser } from './context/UserProvider';
import { Home } from 'lucide-react'; // or any icon lib

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const isMainDashboard = location.pathname === '/dashboard';
  const { sidebarExpanded, theme } = useUser();

  const [sidebarWidth, setSidebarWidth] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // 🧠 Detect screen size on mount + resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // tailwind md breakpoint
    };

    checkScreenSize(); // run once
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setSidebarWidth(sidebarExpanded ? 256 : 90);
    } else {
      setSidebarWidth(0);
    }
  }, [sidebarExpanded, isMobile]);

  return (
    <div
      className={`h-screen flex flex-col relative ${
        theme === 'dark' ? 'bg-[#121212]' : 'bg-white'
      }`}
    >
      {/* Navbar */}
      <div className="z-50 relative">
        <Navbar />
      </div>

      {/* Sidebar + Main */}
      <div className="flex flex-1 relative z-0 overflow-hidden">
        {/* Sidebar */}
        {!isMobile && (
          <div
            className="absolute top-0 left-0 h-full transition-all duration-150 ease-in-out"
            style={{ width: `${sidebarWidth}px` }}
          >
            <Sidebar />
          </div>
        )}

        {/* Floating Home Btn on Mobile */}
        

        {/* Main Content */}
             {/* Main Content */}
        <div
          className="flex flex-col flex-1 overflow-y-auto overflow-hidden transition-all duration-150 ease-in-out"
          style={{
            marginLeft: isMobile ? 0 : `${sidebarWidth}px`,
            minHeight: '100%',
          }}
        >
          {/* Floating Home Btn on Mobile (Top Right) */}
          {isMobile && (
            <button
              onClick={() => navigate('/dashboard')}
              className="absolute top-4 right-4 z-50 bg-blue-600 text-white p-2 rounded-full shadow-md hover:bg-blue-700 transition"
              title="Go to Dashboard"
            >
              <Home className="w-5 h-5" />
            </button>
          )}

          {/* Main Body */}
          <div className="flex-1 w-full my-scrollable-div ">
            {isMainDashboard ? <Cards /> : <Outlet />}
          </div>
        </div>

      </div>
    </div>
  );
}
