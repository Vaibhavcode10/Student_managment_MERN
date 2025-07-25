import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "./context/UserProvider"; // make sure this exists

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, email: userEmail, theme, toggleTheme, role } = useUser();
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".relative")) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout(); // clear user data from context
    navigate("/login"); // redirect to login
  };

  const navbarBg =
    theme === "dark"
      ? "bg-black/10 border-gray-800" // Lighter black with 80% opacity, paired with a dark border
      : "bg-white/80 border-white/20";

  // Get page title based on current route
  const getPageTitle = () => {
    switch (location.pathname) {
      case "/dashboard/interview":
        return "DSA (Chedo Sheets)";
      case "/dashboard/mcq":
        return "MCQ Practice";
      case "/dashboard/notes":
        return "Notes";
      default:
        return null;
    }
  };

  const pageTitle = getPageTitle();

  return (
    <>
      <div className={`backdrop-blur-md ${navbarBg} border-b shadow-sm`}>
        <div className="flex justify-between items-center px-3 sm:px-4 md:px-6 py-2 min-h-[56px] sm:min-h-[60px]">
          {/* Left Side - Logo and Title */}
          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 flex-shrink-0">
            <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm sm:text-base md:text-lg">D</span>
            </div>
            <h1
              className={`text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r ${
                theme === "dark"
                  ? "from-gray-100 to-gray-300"
                  : "from-gray-800 to-gray-600"
              } bg-clip-text text-transparent hidden xs:block`}
            >
              Dashboard
            </h1>
            {/* Show abbreviated title on very small screens */}
            <h1
              className={`text-lg font-bold bg-gradient-to-r ${
                theme === "dark"
                  ? "from-gray-100 to-gray-300"
                  : "from-gray-800 to-gray-600"
              } bg-clip-text text-transparent block xs:hidden`}
            >
              DB
            </h1>
          </div>

          {/* Center: Page title - responsive positioning */}
          {pageTitle && (
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 hidden sm:block">
              <h1 className={`text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold leading-tight text-center ${
                location.pathname === "/dashboard/interview" 
                  ? "bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text"
                  : theme === "dark" ? "text-gray-200" : "text-gray-800"
              }`}>
                <span className="hidden md:inline">{pageTitle}</span>
                <span className="md:hidden">
                  {location.pathname === "/dashboard/interview" && "DSA"}
                  {location.pathname === "/dashboard/mcq" && "MCQ"}
                  {location.pathname === "/dashboard/notes" && "Notes"}
                </span>
              </h1>
            </div>
          )}

          {/* Mobile page title below navbar on small screens */}
          {pageTitle && (
            <div className="sm:hidden absolute left-0 right-0 top-full bg-inherit border-b border-gray-200/20 px-3 py-2">
              <h1 className={`text-base font-bold text-center ${
                location.pathname === "/dashboard/interview" 
                  ? "bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text"
                  : theme === "dark" ? "text-gray-200" : "text-gray-800"
              }`}>
                {pageTitle}
              </h1>
            </div>
          )}

          {/* Right Side - User Dropdown */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowDropdown((prev) => !prev)}
              className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 ${
                theme === "dark" ? "bg-gray-700/50" : "bg-white/50"
              } rounded-full shadow-sm transition hover:shadow-md`}
            >
              <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs sm:text-sm font-medium">
                  {userEmail ? userEmail.charAt(0).toUpperCase() : "U"}
                </span>
              </div>
              
              {/* Username - responsive display */}
              <span
                className={`${
                  theme === "dark" ? "text-gray-200" : "text-gray-700"
                } font-medium text-xs sm:text-sm md:text-base hidden min-[480px]:block`}
              >
                {userEmail?.split('@')[0]}
              </span>
              
              {/* Abbreviated username for very small screens */}
              <span
                className={`${
                  theme === "dark" ? "text-gray-200" : "text-gray-700"
                } font-medium text-xs block min-[480px]:hidden`}
              >
                {userEmail?.split('@')[0]?.substring(0, 3)}...
              </span>

              <svg
                className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 hidden sm:block"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Dropdown Menu - responsive positioning and sizing */}
            {showDropdown && (
              <div
                className={`absolute right-0 mt-1 sm:mt-2 w-40 sm:w-48 rounded-lg sm:rounded-xl shadow-xl z-50 ${
                  theme === "dark" ? "bg-gray-800" : "bg-white"
                } border ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}
              >
                {/* Theme toggle */}
                <button
                  onClick={() => {
                    toggleTheme();
                    setShowDropdown(false);
                  }}
                  className={`w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-t-lg sm:rounded-t-xl hover:${
                    theme === "dark" ? "bg-gray-700" : "bg-gray-50"
                  } transition-colors ${
                    theme === "dark" ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  <span className="block sm:hidden">{theme === "dark" ? "☀️" : "🌙"}</span>
                  <span className="hidden sm:block">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                </button>

                {/* Change Password */}
                <button
                  onClick={() => {
                    navigate("/dashboard/changepassword");
                    setShowDropdown(false);
                  }}
                  className={`w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base hover:${
                    theme === "dark" ? "bg-gray-700" : "bg-gray-50"
                  } transition-colors ${
                    theme === "dark" ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  <span className="block sm:hidden">🔑</span>
                  <span className="hidden sm:block">Change Password</span>
                </button>

                {/* Edit Notes - only for superadmin */}
                {role === "superadmin" && (
                  <button
                    onClick={() => {
                      navigate("/dashboard/editnotes");
                      setShowDropdown(false);
                    }}
                    className={`w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base hover:${
                      theme === "dark" ? "bg-gray-700" : "bg-gray-50"
                    } transition-colors ${
                      theme === "dark" ? "text-green-300" : "text-green-700"
                    }`}
                  >
                    <span className="block sm:hidden">✏️</span>
                    <span className="hidden sm:block">Edit Notes</span>
                  </button>
                )}

                {/* Logout */}
                <button
                  onClick={() => {
                    handleLogout();
                    setShowDropdown(false);
                  }}
                  className={`w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 rounded-b-lg sm:rounded-b-xl font-medium text-sm sm:text-base hover:${
                    theme === "dark" ? "bg-red-900/20" : "bg-red-50"
                  } transition-colors ${
                    theme === "dark" ? "text-red-400" : "text-red-600"
                  }`}
                >
                  <span className="block sm:hidden">🚪</span>
                  <span className="hidden sm:block">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}