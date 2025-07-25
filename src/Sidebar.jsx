import React from 'react';
import { useUser } from './context/UserProvider';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  MdDashboard,
  MdAssignment,
  MdChecklist,
  MdCalendarToday,
  MdSettings,
  MdChevronLeft,
  MdChevronRight,
} from 'react-icons/md';

export default function Sidebar() {
  const { theme, sidebarExpanded, setSidebarExpanded } = useUser();

  const location = useLocation();
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = React.useState(
    location.pathname.split('/')[1] || 'dashboard'
  );

  const menuItems = [
    { name: 'Dashboard', icon: <MdDashboard size={24} />, id: 'dashboard' },
    { name: 'Projects', icon: <MdAssignment size={24} />, id: 'projects' },
    { name: 'Tasks', icon: <MdChecklist size={24} />, id: 'tasks' },
    { name: 'Calendar', icon: <MdCalendarToday size={24} />, id: 'calendar' },
    { name: 'Settings', icon: <MdSettings size={24} />, id: 'settings' },
  ];

  const handleClick = (id) => {
    setActiveItem(id);
    navigate(`/${id}`);
  };

  const collapsedWidth = 'w-[90px]';

  const isCollapsed = !sidebarExpanded;

  return (
    <div
      className={`h-full flex flex-col justify-between transition-all duration-150 ease-in-out rounded-r-xl border-r overflow-hidden
        ${theme === 'dark'
          ? 'bg-gradient-to-br from-[#1a1a1a] via-[#1f1f1f] to-[#1a1a1a] text-gray-200 border-gray-700 shadow-[4px_0_20px_rgba(0,0,0,0.5)]'
          : 'bg-gradient-to-br from-white via-[#f9f9f9] to-white text-gray-900 border-gray-200 shadow-[4px_0_20px_rgba(0,0,0,0.1)]'}
        ${isCollapsed ? `${collapsedWidth} px-2 py-3 items-center` : 'w-64 px-4 py-5 items-start'}
      `}
    >
      {/* Logo */}
      <div className={`flex items-center mb-6 font-bold ${isCollapsed ? 'justify-center w-full' : ''}`}>
        <span className="text-xl bg-gradient-to-r from-indigo-500 to-pink-500 text-transparent bg-clip-text">🚀</span>
        {!isCollapsed && (
          <span className="ml-2 text-lg bg-gradient-to-r from-indigo-500 to-pink-500 text-transparent bg-clip-text">
            SmartPanel
          </span>
        )}
      </div>

      {/* Menu Items */}
      <ul className={`flex flex-col w-full ${isCollapsed ? 'gap-y-2' : 'gap-y-3'}`}>
        {menuItems.map((item) => {
          const isActive = activeItem === item.id;
          return (
            <li key={item.id} title={isCollapsed ? item.name : ''}>
              <button
                onClick={() => handleClick(item.id)}
                className={`w-full flex items-center h-10 rounded-lg font-medium text-sm transition-all
                  ${isCollapsed ? 'justify-center px-1' : 'justify-start pl-3 pr-2'}
                  ${isActive
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md scale-[0.97]'
                    : theme === 'dark'
                    ? 'hover:bg-gray-700/40 text-gray-300'
                    : 'hover:bg-gray-100 text-gray-700'}
                `}
              >
                <span className="min-w-[24px]">{item.icon}</span>
                {!isCollapsed && <span className="ml-3 truncate">{item.name}</span>}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Footer – Toggle Button */}
      <div className={`w-full mt-auto ${isCollapsed ? 'flex justify-center' : 'pl-2'}`}>
        <button
          onClick={() => setSidebarExpanded(!sidebarExpanded)}
          className={`flex items-center text-sm px-2 py-1.5 rounded-full transition duration-150
            ${theme === 'dark'
              ? 'bg-gray-800/60 hover:bg-gray-700/60 text-gray-200'
              : 'bg-gray-200/60 hover:bg-gray-300/60 text-gray-800'}
            ${isCollapsed ? 'justify-center w-9' : 'w-full'}
          `}
        >
          {isCollapsed ? <MdChevronRight size={20} /> : <MdChevronLeft size={20} />}
          {!isCollapsed && <span className="ml-2">{isCollapsed ? 'Expand' : 'Collapse'}</span>}
        </button>
      </div>
    </div>
  );
}
