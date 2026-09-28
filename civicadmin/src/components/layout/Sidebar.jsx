/* eslint-disable no-unused-vars */
// src/components/layout/Sidebar.jsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  HomeModernIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  CubeIcon,
  ChartBarIcon,
  MapIcon,
  Cog6ToothIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusCircleIcon,
  DocumentTextIcon,
  QuestionMarkCircleIcon,
  BuildingLibraryIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    {
      name: 'Dashboard',
      path: '/',
      icon: HomeModernIcon,
      badge: null
    },
    {
      name: 'Issues',
      path: '/issues',
      icon: ClipboardDocumentListIcon,
      badge: '12+',
     
    },
    // Added a new top-level item for Flagged Issues
    {
      name: 'Flagged Issues',
      path: '/flagged-issues',
      icon: ExclamationTriangleIcon,
      badge: null
    },
    {
      name: 'Officers',
      path: '/officers',
      icon: UsersIcon,
      badge: null
    },
    {
      name: 'Inventory',
      path: '/inventory',
      icon: CubeIcon,
      badge: '3',
    
    },
    {
      name: 'Analytics',
      path: '/analytics',
      icon: ChartBarIcon,
      badge: null
    },
    {
      name: 'Live Map',
      path: '/map',
      icon: MapIcon,
      badge: 'Live'
    },
    // {
    //   name: 'Settings',
    //   path: '/settings',
    //   icon: Cog6ToothIcon,
    //   badge: null
    // }
  ];

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    setActiveSubmenu(null);
  };

  const toggleSubmenu = (name) => {
    if (activeSubmenu === name) {
      setActiveSubmenu(null);
    } else {
      setActiveSubmenu(name);
    }
  };

  const handleCreateIssue = () => {
    navigate('/issues/new');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside className={`z-20 flex-shrink-0 hidden md:block bg-gradient-to-b from-blue-900 to-blue-800 dark:from-gray-900 dark:to-gray-800 text-white transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-blue-700/50 dark:border-gray-700/50">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                <BuildingLibraryIcon className="w-6 h-6 text-blue-200" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Civic Resolution</h1>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="flex justify-center w-full">
              <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                <BuildingLibraryIcon className="w-6 h-6 text-blue-200" />
              </div>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200 text-blue-200 hover:text-white"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRightIcon className="w-4 h-4" />
            ) : (
              <ChevronLeftIcon className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const hasSubmenu = item.submenu;
            const isItemActive = isActive(item.path) || (hasSubmenu && item.submenu.some(sub => isActive(sub.path)));
           
            return (
              <div key={item.name}>
                <button
                  onClick={() => hasSubmenu ? toggleSubmenu(item.name) : navigate(item.path)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group ${
                    isItemActive
                      ? 'bg-blue-700/50 text-white shadow-lg'
                      : 'text-blue-200 hover:bg-blue-700/30 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-5 h-5 transition-transform duration-200 ${isItemActive ? 'scale-110' : ''}`} />
                    {!isCollapsed && (
                      <span className="text-sm font-medium">{item.name}</span>
                    )}
                  </div>
                  {!isCollapsed && item.badge && (
                    <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                      item.badge === 'Live' 
                        ? 'bg-red-500/20 text-red-200' 
                        : 'bg-blue-600/50 text-blue-200'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>

                {/* Submenu */}
                {!isCollapsed && hasSubmenu && activeSubmenu === item.name && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.submenu.map((subItem) => {
                      const SubIcon = subItem.icon;
                      return (
                        <Link
                          key={subItem.name}
                          to={subItem.path}
                          className={`flex items-center space-x-2 px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${
                            isActive(subItem.path)
                              ? 'text-white bg-blue-600/30'
                              : 'text-blue-200 hover:text-white hover:bg-blue-600/20'
                          }`}
                        >
                          {SubIcon && <SubIcon className="w-4 h-4" />}
                          <span>{subItem.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        {/* <div className="p-4 border-t border-blue-700/50 dark:border-gray-700/50">
          {!isCollapsed && (
            <button
              onClick={handleCreateIssue}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-white text-blue-700 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              <PlusCircleIcon className="w-5 h-5" />
              <span>Create Issue</span>
            </button>
          )}
          {isCollapsed && (
            <button
              onClick={handleCreateIssue}
              className="w-full flex items-center justify-center p-3 bg-white text-blue-700 rounded-xl font-semibold hover:bg-blue-50 transition-colors duration-200 shadow-lg"
              aria-label="Create Issue"
            >
              <PlusCircleIcon className="w-5 h-5" />
            </button>
          )}

          {!isCollapsed && (
            <div className="mt-4 p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <div className="p-1.5 bg-blue-600/30 rounded-lg">
                  <QuestionMarkCircleIcon className="w-4 h-4 text-blue-200" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white">Need help?</p>
                  <p className="text-xs text-blue-200 truncate">Check our docs</p>
                </div>
              </div>
            </div>
          )}
        </div> */}
      </div>
    </aside>
  );
};

export default Sidebar;