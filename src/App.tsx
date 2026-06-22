/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Assessment, AssessmentStatus } from './types.ts';
import { INITIAL_ASSESSMENTS } from './data.ts';
import Header from './components/Header.tsx';
import DashboardScreen from './components/DashboardScreen.tsx';
import CalendarScreen from './components/CalendarScreen.tsx';
import AddEditModal from './components/AddEditModal.tsx';
import DetailsPanel from './components/DetailsPanel.tsx';
import { 
  Calendar as CalendarIcon, 
  Settings as SettingsIcon, 
  Clock, 
  User, 
  TrendingUp, 
  Award, 
  Trash2, 
  Database,
  CalendarCheck,
  CheckCircle,
  HelpCircle,
  FileText
} from 'lucide-react';

export default function App() {
  // Let's seed core assessments to local storage or state
  const [assessments, setAssessments] = useState<Assessment[]>(() => {
    const saved = localStorage.getItem('eduTrack_assessments');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.error('Failed to parse saved assessments, using default seeds.', err);
      }
    }
    return INITIAL_ASSESSMENTS;
  });

  // Tab Selection
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'calendar' | 'upcoming' | 'settings'>('calendar');

  // Selected calendar day YYYY-MM-DD (defaults to match mockup date November 14, 2024 first)
  const [selectedDateStr, setSelectedDateStr] = useState('2024-11-14');

  // Slide panel triggers
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);

  // Add/Edit Dialog triggers
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [assessmentToEdit, setAssessmentToEdit] = useState<Assessment | null>(null);

  // Theme states
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('eduTrack_dark_mode');
    return saved === 'true';
  });

  // Persists assessments sequence to storage
  useEffect(() => {
    localStorage.setItem('eduTrack_assessments', JSON.stringify(assessments));
  }, [assessments]);

  // Handle dark mode side effects
  useEffect(() => {
    localStorage.setItem('eduTrack_dark_mode', String(darkMode));
    const target = document.documentElement;
    if (darkMode) {
      target.classList.add('dark');
    } else {
      target.classList.remove('dark');
    }
  }, [darkMode]);

  // Global settings changes
  const [studentName, setStudentName] = useState(() => localStorage.getItem('eduTrack_student_name') || 'Alex Mercer');
  const [academicYear, setAcademicYear] = useState(() => localStorage.getItem('eduTrack_academic_year') || '2024/2025');

  const handleSaveSettings = (name: string, year: string) => {
    setStudentName(name);
    setAcademicYear(year);
    localStorage.setItem('eduTrack_student_name', name);
    localStorage.setItem('eduTrack_academic_year', year);
  };

  const handleToggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  // Callback adjustments: Adding, editing, deleting, or completing assessments
  const handleSaveAssessment = (item: Assessment) => {
    const exists = assessments.some((a) => a.id === item.id);
    if (exists) {
      // Edit
      setAssessments((prev) => prev.map((a) => (a.id === item.id ? item : a)));
      // Sync detailed viewer if active
      if (selectedAssessment?.id === item.id) {
        setSelectedAssessment(item);
      }
    } else {
      // Create new
      setAssessments((prev) => [item, ...prev]);
      // Update calendar default tracker
      setSelectedDateStr(item.dueDate);
    }
    setIsAddOpen(false);
    setAssessmentToEdit(null);
  };

  const handleDeleteAssessment = (id: string) => {
    if (window.confirm('Are you sure you want to delete this study task? This action is irreversible.')) {
      setAssessments((prev) => prev.filter((a) => a.id !== id));
      setIsDetailsOpen(false);
      setSelectedAssessment(null);
    }
  };

  const handleUpdateAssessmentNotesOnly = (updatedItem: Assessment) => {
    setAssessments((prev) => prev.map((a) => (a.id === updatedItem.id ? updatedItem : a)));
    setSelectedAssessment(updatedItem);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all task changes to initial academic defaults?')) {
      setAssessments(INITIAL_ASSESSMENTS);
      setSelectedDateStr('2024-11-14');
      setIsDetailsOpen(false);
      setSelectedAssessment(null);
    }
  };

  // Group assessments timeline for Upcoming lists
  const sortedUpcomingLists = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdue: Assessment[] = [];
    const thisWeek: Assessment[] = [];
    const nextWeek: Assessment[] = [];
    const later: Assessment[] = [];
    const completed: Assessment[] = [];

    assessments.forEach((item) => {
      if (item.status === 'Submitted') {
        completed.push(item);
        return;
      }

      const due = new Date(item.dueDate);
      due.setHours(0, 0, 0, 0);

      const diffTime = due.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        overdue.push(item);
      } else if (diffDays <= 7) {
        thisWeek.push(item);
      } else if (diffDays <= 14) {
        nextWeek.push(item);
      } else {
        later.push(item);
      }
    });

    const dtsort = (a: Assessment, b: Assessment) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    return {
      overdue: overdue.sort(dtsort),
      thisWeek: thisWeek.sort(dtsort),
      nextWeek: nextWeek.sort(dtsort),
      later: later.sort(dtsort),
      completed: completed.sort((a,b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
    };
  }, [assessments]);

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0d1c2d] dark:bg-[#0d1c2d] dark:text-[#e9f1ff] flex flex-col font-sans transition-colors duration-200">
      
      {/* Top Banner Header bar element */}
      <Header
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          // Auto-hide details when navigating screens
          setIsDetailsOpen(false);
        }}
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
      />

      {/* Main page content area wrapper */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-6 flex flex-col gap-6">
        {/* Render respective tab screen layout dynamically */}
        <div className="flex-1">
          {currentTab === 'calendar' && (
            <CalendarScreen
              assessments={assessments}
              onSelectAssessment={(item) => {
                setSelectedAssessment(item);
                setIsDetailsOpen(true);
              }}
              onOpenAddModal={() => {
                setAssessmentToEdit(null);
                setIsAddOpen(true);
              }}
              selectedDateStr={selectedDateStr}
              onSelectDateStr={(date) => {
                setSelectedDateStr(date);
              }}
            />
          )}

          {currentTab === 'dashboard' && (
            <DashboardScreen
              assessments={assessments}
              onSelectAssessment={(item) => {
                setSelectedAssessment(item);
                setIsDetailsOpen(true);
              }}
              onOpenAddModal={() => {
                setAssessmentToEdit(null);
                setIsAddOpen(true);
              }}
            />
          )}

          {currentTab === 'upcoming' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[#041534] dark:text-[#e9f1ff]">
                  Syllabi Deadlines Timeline
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Assessments grouped chronologically relative to current date.
                </p>
              </div>

              {/* Group columns listings */}
              <div className="space-y-8 select-none">
                {/* 1. OVERDUE tasks alert row */}
                {sortedUpcomingLists.overdue.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-[#ba1a1a] dark:text-red-300 tracking-widest uppercase mb-3 flex items-center gap-1.5 bg-red-50 dark:bg-red-950/20 p-2.5 rounded-lg border border-red-100">
                      <Clock className="w-4.5 h-4.5" />
                      URGENT OVERDUE ASSESSMENTS ({sortedUpcomingLists.overdue.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {sortedUpcomingLists.overdue.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setSelectedAssessment(item);
                            setIsDetailsOpen(true);
                          }}
                          className="bg-white dark:bg-[#0b1422] p-5 rounded-xl border-l-4 border-red-500 border border-red-100 hover:shadow shadow-sm cursor-pointer"
                        >
                          <div className="flex justify-between items-start mb-1.5">
                            <span className="text-[10px] font-extrabold text-white bg-red-600 px-2 py-0.5 rounded font-mono">
                              {item.course}
                            </span>
                            <span className="text-xs font-bold text-red-600">
                              LATE: {item.dueDate}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                            {item.title}
                          </h4>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Due this week */}
                <div>
                  <h3 className="text-xs font-bold text-[#041534] dark:text-[#feae2c] tracking-widest uppercase mb-3">
                    Due This Week ({sortedUpcomingLists.thisWeek.length})
                  </h3>
                  {sortedUpcomingLists.thisWeek.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No tasks due in the next 7 days.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {sortedUpcomingLists.thisWeek.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setSelectedAssessment(item);
                            setIsDetailsOpen(true);
                          }}
                          className="bg-white dark:bg-[#0b1422] p-5 rounded-xl border-l-4 border-[#feae2c] border border-gray-150 hover:shadow shadow-sm cursor-pointer"
                        >
                          <div className="flex justify-between items-start mb-1.5">
                            <span className="text-[10px] font-extrabold text-white bg-amber-500 px-2 py-0.5 rounded font-mono">
                              {item.course}
                            </span>
                            <span className="text-xs font-bold text-amber-600 font-mono">
                              {item.dueDate}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-[#041534] dark:text-gray-200">
                            {item.title}
                          </h4>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. Due next week */}
                <div>
                  <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-widest uppercase mb-3">
                    Next Week ({sortedUpcomingLists.nextWeek.length})
                  </h3>
                  {sortedUpcomingLists.nextWeek.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No tasks due in 8 to 14 days.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {sortedUpcomingLists.nextWeek.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setSelectedAssessment(item);
                            setIsDetailsOpen(true);
                          }}
                          className="bg-white dark:bg-[#0b1422] p-5 rounded-xl border-l-4 border-blue-500 border border-gray-150 hover:shadow shadow-sm cursor-pointer"
                        >
                          <div className="flex justify-between items-start mb-1.5">
                            <span className="text-[10px] font-semibold text-white bg-blue-500 px-2 py-0.5 rounded font-mono">
                              {item.course}
                            </span>
                            <span className="text-xs font-bold text-blue-500 font-mono">
                              {item.dueDate}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                            {item.title}
                          </h4>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 4. Due later */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-3">
                    Later ({sortedUpcomingLists.later.length})
                  </h3>
                  {sortedUpcomingLists.later.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No further assignments scheduled.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {sortedUpcomingLists.later.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setSelectedAssessment(item);
                            setIsDetailsOpen(true);
                          }}
                          className="bg-white dark:bg-[#0b1422] p-5 rounded-xl border-l-4 border-gray-300 border border-gray-150 hover:shadow shadow-sm cursor-pointer"
                        >
                          <div className="flex justify-between items-start mb-1.5">
                            <span className="text-[10px] font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded font-mono">
                              {item.course}
                            </span>
                            <span className="text-xs font-bold text-gray-400 font-mono">
                              {item.dueDate}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                            {item.title}
                          </h4>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 5. Completed Tasks */}
                {sortedUpcomingLists.completed.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-[#00a673] tracking-widest uppercase mb-3 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4" />
                      Completed & Submitted ({sortedUpcomingLists.completed.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-75">
                      {sortedUpcomingLists.completed.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setSelectedAssessment(item);
                            setIsDetailsOpen(true);
                          }}
                          className="bg-gray-50/50 dark:bg-black/20 p-5 rounded-xl border-l-4 border-[#00a673] border border-gray-100 dark:border-gray-800 hover:shadow hover:bg-white dark:hover:bg-[#0b1422] hover:opacity-100 transition-all cursor-pointer"
                        >
                          <div className="flex justify-between items-start mb-1.5">
                            <span className="text-[10px] font-semibold text-white bg-[#00a673] px-2 py-0.5 rounded font-mono">
                              {item.course}
                            </span>
                            <span className="text-xs text-gray-500 font-mono">
                              Finished
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 line-through">
                            {item.title}
                          </h4>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentTab === 'settings' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[#041534] dark:text-[#e9f1ff]">
                  Syllabus Settings
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Configure student login context defaults and persistence templates.
                </p>
              </div>

              {/* Bento Settings Cards */}
              <div className="bg-white dark:bg-[#1b2a4a] rounded-xl border border-[#c5c6cf]/30 dark:border-[#45464e]/50 overflow-hidden divide-y divide-gray-100 dark:divide-gray-800 shadow-sm">
                
                {/* Profile section */}
                <div className="p-6 space-y-4">
                  <h3 className="text-base font-bold text-[#041534] dark:text-[#feae2c] flex items-center gap-2">
                    <User className="w-5 h-5 text-amber-500" />
                    Student Profile Account
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-[#45464e] dark:text-[#c5c6cf] uppercase mb-1">
                        Student Full Name
                      </label>
                      <input
                        type="text"
                        value={studentName}
                        onChange={(e) => handleSaveSettings(e.target.value, academicYear)}
                        className="w-full h-11 px-3 bg-[#f8f9ff] dark:bg-[#0d1c2d] text-[#0d1c2d] dark:text-white border border-[#c5c6cf]/40 dark:border-[#4c556b] rounded-lg focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#45464e] dark:text-[#c5c6cf] uppercase mb-1">
                        Academic Year Context
                      </label>
                      <input
                        type="text"
                        value={academicYear}
                        onChange={(e) => handleSaveSettings(studentName, e.target.value)}
                        className="w-full h-11 px-3 bg-[#f8f9ff] dark:bg-[#0d1c2d] text-[#0d1c2d] dark:text-white border border-[#c5c6cf]/40 dark:border-[#4c556b] rounded-lg focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Diagnostics / Reset options */}
                <div className="p-6 space-y-4 bg-gray-50/20 dark:bg-black/10">
                  <h3 className="text-base font-bold text-[#041534] dark:text-[#feae2c] flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Database Administration
                  </h3>
                  <p className="text-xs text-gray-500">
                    Your assessment tasks logs are automatically cached inside current offline parameters (HTML5 localStorage). If you wish to clear additions and restore the academic visual guide seeds, invoke the restore commands below:
                  </p>
                  <div>
                    <button
                      onClick={handleResetData}
                      className="bg-red-50 hover:bg-red-100 text-[#ba1a1a] border border-red-200 text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                    >
                      <Trash2 className="w-4 h-4" />
                      Restore Original Syllabus Templates
                    </button>
                  </div>
                </div>

                {/* Workspace system specs */}
                <div className="p-6 space-y-2 text-xs text-gray-400 dark:text-gray-400">
                  <p>• Authorized Logged-In User Email: <span className="font-bold text-[#041534] dark:text-[#ffb955]">zggayo@gmail.com</span></p>
                  <p>• Current Sandbox Runtime: <span className="font-bold">React 19 & Vite 6 (Static Engine)</span></p>
                  <p>• Local Time Synchronization: <span className="font-bold">2026-06-22</span></p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Floating Action Button mobile layout navigation anchors */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center h-16 bg-white dark:bg-[#1b2a4a] border-t border-[#c5c6cf]/30 dark:border-[#45464e]/50 z-40 transition-colors shadow-lg">
        <button
          onClick={() => setCurrentTab('dashboard')}
          className={`flex flex-col items-center justify-center flex-1 py-1 ${
            currentTab === 'dashboard'
              ? 'text-[#041534] dark:text-[#feae2c] font-bold'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <TrendingUp className="w-5 h-5" />
          <span className="text-[10px] uppercase font-bold mt-1">Dashboard</span>
        </button>
        
        <button
          onClick={() => setCurrentTab('calendar')}
          className={`flex flex-col items-center justify-center flex-1 py-1 ${
            currentTab === 'calendar'
              ? 'text-[#041534] dark:text-[#feae2c] font-bold'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <CalendarIcon className="w-5 h-5" />
          <span className="text-[10px] uppercase font-bold mt-1">Calendar</span>
        </button>

        <button
          onClick={() => setCurrentTab('upcoming')}
          className={`flex flex-col items-center justify-center flex-1 py-1 ${
            currentTab === 'upcoming'
              ? 'text-[#041534] dark:text-[#feae2c] font-bold'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Clock className="w-5 h-5" />
          <span className="text-[10px] uppercase font-bold mt-1">Upcoming</span>
        </button>

        <button
          onClick={() => setCurrentTab('settings')}
          className={`flex flex-col items-center justify-center flex-1 py-1 ${
            currentTab === 'settings'
              ? 'text-[#041534] dark:text-[#feae2c] font-bold'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <SettingsIcon className="w-5 h-5" />
          <span className="text-[10px] uppercase font-bold mt-1">Settings</span>
        </button>
      </nav>

      {/* Floating Panel component for detailed view slide-ins */}
      <DetailsPanel
        assessment={selectedAssessment}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedAssessment(null);
        }}
        onDelete={handleDeleteAssessment}
        onEdit={(item) => {
          setAssessmentToEdit(item);
          setIsAddOpen(true);
        }}
        onUpdateAssessment={handleUpdateAssessmentNotesOnly}
      />

      {/* Dynamic Creation/Edit assessment form workspace modal dialog */}
      <AddEditModal
        isOpen={isAddOpen}
        onClose={() => {
          setIsAddOpen(false);
          setAssessmentToEdit(null);
        }}
        onSave={handleSaveAssessment}
        assessmentToEdit={assessmentToEdit}
        defaultDate={selectedDateStr}
      />
    </div>
  );
}
