/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Menu, User, Sun, Moon, Search, Calendar, LayoutDashboard, Compass, Settings } from 'lucide-react';

interface HeaderProps {
  currentTab: 'dashboard' | 'calendar' | 'upcoming' | 'settings';
  onTabChange: (tab: 'dashboard' | 'calendar' | 'upcoming' | 'settings') => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function Header({ currentTab, onTabChange, darkMode, onToggleDarkMode }: HeaderProps) {
  return (
    <header className="bg-white dark:bg-[#1b2a4a] border-b border-[#c5c6cf]/30 dark:border-[#45464e]/40 shadow-sm z-40 px-6 h-16 w-full sticky top-0 transition-colors duration-200">
      <div className="max-w-7xl mx-auto h-full flex justify-between items-center">
        {/* Left Section: Logo & Menu Toggle */}
        <div className="flex items-center gap-4">
          <button 
            id="menu-toggle-btn"
            className="p-2 text-[#041534] dark:text-[#b7c6ee] hover:bg-[#eef4ff] dark:hover:bg-[#2d3446] rounded-full transition-colors active:scale-95 cursor-pointer md:hidden"
            title="Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onTabChange('dashboard')}>
            <div className="w-8 h-8 rounded-lg bg-[#041534] dark:bg-[#b7c6ee] flex items-center justify-center">
              <span className="text-white dark:text-[#041534] font-bold text-lg select-none">E</span>
            </div>
            <h1 className="font-sans text-xl font-bold text-[#041534] dark:text-[#e9f1ff]">
              EduTrack
            </h1>
          </div>
        </div>

        {/* Center Section: Navigation Link Tabs for desktop */}
        <div className="hidden md:flex gap-2">
          <button
            id="tab-dashboard-desktop"
            onClick={() => onTabChange('dashboard')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
              currentTab === 'dashboard'
                ? 'bg-[#041534] text-white dark:bg-[#b7c6ee] dark:text-[#041534]'
                : 'text-[#45464e] dark:text-[#c5c6cf] hover:bg-[#eef4ff] dark:hover:bg-[#2d3446]'
            }`}
          >
            Dashboard
          </button>
          <button
            id="tab-calendar-desktop"
            onClick={() => onTabChange('calendar')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
              currentTab === 'calendar'
                ? 'bg-[#041534] text-white dark:bg-[#b7c6ee] dark:text-[#041534]'
                : 'text-[#45464e] dark:text-[#c5c6cf] hover:bg-[#eef4ff] dark:hover:bg-[#2d3446]'
            }`}
          >
            Calendar
          </button>
          <button
            id="tab-upcoming-desktop"
            onClick={() => onTabChange('upcoming')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
              currentTab === 'upcoming'
                ? 'bg-[#041534] text-white dark:bg-[#b7c6ee] dark:text-[#041534]'
                : 'text-[#45464e] dark:text-[#c5c6cf] hover:bg-[#eef4ff] dark:hover:bg-[#2d3446]'
            }`}
          >
            Upcoming
          </button>
          <button
            id="tab-settings-desktop"
            onClick={() => onTabChange('settings')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
              currentTab === 'settings'
                ? 'bg-[#041534] text-white dark:bg-[#b7c6ee] dark:text-[#041534]'
                : 'text-[#45464e] dark:text-[#c5c6cf] hover:bg-[#eef4ff] dark:hover:bg-[#2d3446]'
            }`}
          >
            Settings
          </button>
        </div>

        {/* Right Section: Auth/Search and Dark/Light toggle switches */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle Button */}
          <button
            id="theme-toggle-btn"
            onClick={onToggleDarkMode}
            className="p-2 text-[#041534] dark:text-[#b7c6ee] hover:bg-[#eef4ff] dark:hover:bg-[#2d3446] rounded-full transition-all active:scale-90 cursor-pointer"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-[#ffb955]" />
            ) : (
              <Moon className="w-5 h-5 text-[#835500]" />
            )}
          </button>

          {/* Quick Search trigger (For Aesthetics & Mock completeness) */}
          <button 
            id="search-btn"
            className="p-2 text-[#041534] dark:text-[#b7c6ee] hover:bg-[#eef4ff] dark:hover:bg-[#2d3446] rounded-full transition-colors active:scale-95 cursor-pointer"
            title="Search Assessments"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* User Account avatar */}
          <div className="flex items-center gap-1 cursor-pointer group" onClick={() => onTabChange('settings')}>
            <div className="w-8 h-8 rounded-full bg-[#eef4ff] dark:bg-[#233143] border border-[#041534]/10 dark:border-[#b7c6ee]/20 overflow-hidden flex items-center justify-center transition-all group-hover:scale-105">
              <User className="w-4 h-4 text-[#041534] dark:text-[#b7c6ee]" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
