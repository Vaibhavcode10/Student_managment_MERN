import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./context/UserProvider";
export default function Cards() {
  const navigate = useNavigate();

  const { email: userEmail, theme, role, currentUserDetails } = useUser();
  const [isVisible, setIsVisible] = useState(false);

  // 🧠 Normalize role for safe matching
  const normalizedRole = (currentUserDetails?.Role || role || "").toLowerCase();

  // Optional: debug logs
  console.log("👤 Role:", normalizedRole);
  console.log("📋 User Details:", currentUserDetails);

  // ⛑️ Safe fallback (optional UI)
  if (!currentUserDetails && !role) return <div>Loading your dashboard...</div>;

  // 🗂️ Card data
  const cardData = [
    {
      id: "details",
      icon: "📋",
      title: "Personal Info",
      description: currentUserDetails
        ? `Hi ${currentUserDetails.name}, you're a ${currentUserDetails.Role}`
        : "Loading your personal info...",
      color: "from-white to-gray-100", // 🌤️ Soft neutral for light mode
      darkColor: "from-gray-200 to-gray-300", // 🕶️ Light gray in dark theme
      size: "small",
      link: "/dashboard/updatedetails",
      visible: !!currentUserDetails,
      userInfo: currentUserDetails
    },

    {
      id: "crud",
      icon: "⚙️",
      title: "CRUD Students",
      description: "Manage student records efficiently",
      color: "from-orange-500 to-red-600",
      darkColor: "from-orange-600 to-red-700",
      size: "small",
      link: "/dashboard/students",
      visible: ["admin", "superadmin"].includes(normalizedRole)
    },
    {
      id: "reports",
      icon: "📈",
      title: "Reports",
      description: "Analyze student data and  reports",
      color: "from-indigo-500 to-fuchsia-600",
      darkColor: "from-indigo-600 to-fuchsia-700",
      size: "small",
      link: "/dashboard/reports",
      visible: ["admin", "superadmin"].includes(normalizedRole),
      width: 266
    },
    {
      id: "enrollments",
      icon: "📚",
      title: "Manage Enrollments",
      description: "Handle course assignments",
      color: "from-cyan-500 to-blue-600",
      darkColor: "from-cyan-600 to-blue-700",
      size: "small",
      link: "/dashboard/enrollments",
      visible: ["admin", "superadmin"].includes(normalizedRole)
    },
    {
      id: "roles",
      icon: "📚",
      title: "Manage roles",
      description: "Handle course assignments",
      color: "from-purple-500 via-blue-500 to-teal-400",
      darkColor: "from-cyan-600 to-blue-700",
      size: "small",
      link: "/dashboard/roles",
      visible: [ "superadmin"].includes(normalizedRole)
    },
    {
      id: "notes",
      icon: "📝",
      title: "Study Notes",
      description: "Access curated notes and study materials",
      color: "from-yellow-400 to-yellow-600",
      darkColor: "from-yellow-500 to-yellow-700",
      size: "small",
      link: "https://w3chedo.web.app/note-web-view",
      visible: normalizedRole === "student"
    },
    {
      id: "mcq",
      icon: "🧠",
      title: "MCQ Quiz",
      description: "Practice and test your knowledge",
      color: "from-emerald-500 to-lime-600",
      darkColor: "from-emerald-600 to-lime-700",
      size: "small",
      link: "/dashboard/mcq",
      visible: normalizedRole === "student"
    },
    {
      id: "mynotes",
      icon: "📓",
      title: "My Notes",
      description: "Your saved study notes and materials",
      color: "from-sky-500 to-blue-600",
      darkColor: "from-sky-600 to-blue-700",
      size: "small",
      link: "/dashboard/notes",
      visible: ["student", "admin", "superadmin"].includes(normalizedRole)
    },
    {
      id: "receipts",
      icon: "🧾",
      title: "My Receipts",
      description: "View your payment history and receipts",
      color: "from-rose-500 to-pink-600",
      darkColor: "from-rose-600 to-pink-700",
      size: "small",
      link: "/dashboard/receipts",
      visible: normalizedRole === "student"
    },
    {
      id: "complaints",
      icon: "📣",
      title: "Complaints",
      description: "View and manage student complaints",
      color: "from-rose-500 to-pink-600",
      darkColor: "from-rose-600 to-pink-700",
      size: "small",
      link: "/dashboard/complaints",
      visible: ["student", "admin", "superadmin"].includes(normalizedRole)
    },
    {
      id: "interview",
      icon: "🎯",
      title: "Interview Prep",
      description: "Practice DSA, puzzles & HR questions",
      color: "from-blue-500 to-indigo-600",
      darkColor: "from-blue-600 to-indigo-700",
      size: "small",
      link: "/dashboard/interview",
      visible: ["student", "admin", "superadmin"].includes(normalizedRole)
    }
  ];

  const visibleCards = cardData.filter((card) => card.visible);

  // 🧩 Card classes
  const getCardClasses = (size) => {
    const baseClasses =
      "group relative overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer";
    switch (size) {
      case "large":
        return `${baseClasses} col-span-2 row-span-2 min-h-[280px]`;
      case "medium":
        return `${baseClasses} col-span-1 row-span-2 min-h-[240px]`;
      case "small":
        return `${baseClasses} col-span-1 row-span-1 min-h-[140px]`;
      default:
        return `${baseClasses} col-span-1 row-span-1 min-h-[160px]`;
    }
  };

  // 🖱️ Click handler
  const handleCardClick = (card) => {
    if (card.link) {
      navigate(card.link);
    } else {
      console.log(`Clicked: ${card.title}`);
    }
  };

  //theme card
 

  const textColor = theme === "dark" ? "text-gray-100" : "text-gray-800";
  const secondaryTextColor =
    theme === "dark" ? "text-gray-300" : "text-gray-600";
  const cardBg =
    theme === "dark"
      ? "bg-gray-700/60 border-gray-600"
      : "bg-white/60 border-white/20";

  return (
    <>
      {/* Body */}
      <div  className="overflow-x-hidden">
        {/* stats */}
        {/* Toggle Button (Only visible on md and up) */}
        <div className="w-full flex justify-start mt-2 md:ml-4 ">
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="hidden md:inline-block border border-blue-600 text-blue-600 text-sm font-medium py-2 px-3 rounded-lg hover:bg-blue-50 transition-all duration-200"
          >
            {isVisible ? "Hide Stats" : "Show Stats"}
          </button>
        </div>

        {/* The Cards (only shown if visible AND on md+ screens) */}
      {isVisible && (
  <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-x-3 gap-y-2 px-2 md:px-4 justify-center hidden md:grid mt-2">
    {/* Current Role */}
    <div className={`${cardBg} w-[380px] mx-auto backdrop-blur-sm rounded-xl p-2.5 border transition-all duration-200`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`${secondaryTextColor} text-[15px] font-medium`}>Current Role</p>
          <p className={`text-[15px] font-bold ${textColor} capitalize`}>
            {role || "User"}
          </p>
        </div>
        <div className="w-7 h-7 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
          <span className="text-white text-lg">🎯</span>
        </div>
      </div>
    </div>

    {/* Total Users */}
    <div className={`${cardBg} w-[380px] mx-auto backdrop-blur-sm rounded-xl p-2.5 border transition-all duration-200`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`${secondaryTextColor} text-[15px] font-medium`}>Total Users</p>
          <p className={`text-[15px] font-bold ${textColor}`}>4</p>
        </div>
        <div className="w-7 h-7 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
          <span className="text-white text-sm">👥</span>
        </div>
      </div>
    </div>

    {/* Active Sessions */}
    <div className={`${cardBg} w-[380px] mx-auto backdrop-blur-sm rounded-xl p-2.5 border transition-all duration-200`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`${secondaryTextColor} text-[15px] font-medium`}>Active Sessions</p>
          <p className={`text-[15px] font-bold ${textColor}`}>1</p>
        </div>
        <div className="w-7 h-7 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white text-sm">📊</span>
        </div>
      </div>
    </div>
  </div>
)}

        {/* heading for grid */}
      
        {/* grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-min px-3 mt-2 mb-2">
          {visibleCards.map((card) => (
            <div
              onClick={() => {
                if (card.link.startsWith("http")) {
                  window.open(card.link, "_blank"); // 🔗 Open external links in new tab
                } else {
                  navigate(card.link); // 🔁 Internal routing
                }
              }}
              className={getCardClasses(card.size)}
            >
              {/* Backgrounds and effects */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${
                  theme === "dark" ? card.darkColor : card.color
                } opacity-90`}
              ></div>

              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 -left-4 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
                <div
                  className="absolute bottom-0 -right-4 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-pulse"
                  style={{ animationDelay: "2s" }}
                ></div>
              </div>

              {/* 🧠 Content Area */}
              {card.id === "details" ? (
                <div className="relative z-10 p-6 h-full flex flex-col justify-between text-gray-900">
                  {card.userInfo ? (
                    <>
                      {/* Personal Details */}
                      <div className="space-y-3">
                        <h3 className="text-xl font-bold text-indigo-800 flex items-center gap-2">
                          👋 Hello, <span>{card.userInfo.name}</span>
                        </h3>
                        <div className="text-sm">
                          <span className="block text-gray-600 font-medium">
                            📧 Email:
                          </span>
                          <span className="block text-gray-800 font-bold">
                            {card.userInfo.email}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="block text-gray-600 font-medium">
                            🧩 Role:
                          </span>
                          <span className="block text-gray-800 font-bold capitalize">
                            {card.userInfo.Role}
                          </span>
                        </div>
                      </div>

                      {/* Button */}
                      <div className="mt-4 flex justify-end">
                        <button
                          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition duration-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCardClick(card);
                          }}
                        >
                          View Full Info
                          <svg
                            className="w-4 h-4 ml-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </button>
                      </div>

                      {/* Badge */}
                      <div className="absolute top-4 right-4 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold shadow-sm">
                        You
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-600 animate-pulse">
                      Loading your info...
                    </p>
                  )}
                </div>
              ) : (
                <div className="relative z-10 p-6 h-full flex flex-col justify-between text-white">
                  <div>
                    <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                      {card.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-yellow-200 transition-colors duration-300">
                      {card.title}
                    </h3>
                    <p className="text-white/80 text-sm leading-relaxed">
                      {card.description}
                    </p>
                  </div>

                  <div className="mt-4">
                    <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-white font-medium hover:bg-white/30 transition-all duration-300 transform hover:scale-105">
                      {card.link ? "Get Started" : "Open"}
                      <svg
                        className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </div>
                  </div>

                  {(card.id === "crud" || card.id === "enrollments") && (
                    <div className="absolute top-4 right-4 px-2 py-1 bg-yellow-400/20 backdrop-blur-md rounded-full text-xs font-medium text-yellow-100">
                      Admin
                    </div>
                  )}
                  {card.id === "roles" && (
                    <div className="absolute top-4 right-4 px-2 py-1 bg-pink-400/20 backdrop-blur-md rounded-full text-xs font-medium text-pink-100">
                      Super Admin
                    </div>
                  )}
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
