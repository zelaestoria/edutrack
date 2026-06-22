/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Assessment, AssessmentStatus } from '../types.ts';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Check, Award, Plus } from 'lucide-react';

interface CalendarScreenProps {
  assessments: Assessment[];
  onSelectAssessment: (assessment: Assessment) => void;
  onOpenAddModal: () => void;
  selectedDateStr: string;
  onSelectDateStr: (date: string) => void;
}

export default function CalendarScreen({
  assessments,
  onSelectAssessment,
  onOpenAddModal,
  selectedDateStr,
  onSelectDateStr
}: CalendarScreenProps) {
  // State to toggle between standard Month View and full 12-Month Year View
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');

  // Let's support traversing calendar months.
  // Initially, if there are assessments in November 2024, let's initialize the calendar
  // to November 2024 so it matches the beautiful screenshot exactly on load!
  // But wait, they can click around, so let's store standard state.
  const [currentDate, setCurrentDate] = useState(() => {
    // Check if we have assessments matching current date, default to November 14, 2024
    return new Date(2024, 10, 14); // November is index 10 (0-indexed)
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (viewMode === 'year') {
      setCurrentDate(new Date(year - 1, month, 1));
    } else {
      setCurrentDate(new Date(year, month - 1, 1));
    }
  };

  const handleNextMonth = () => {
    if (viewMode === 'year') {
      setCurrentDate(new Date(year + 1, month, 1));
    } else {
      setCurrentDate(new Date(year, month + 1, 1));
    }
  };

  // Hover auto-traversal logic:
  // Starts after 220ms of hovering to confirm user intention, then repeats every 750ms
  const prevTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const nextTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const nextIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Cleanup handlers on unmount
    return () => {
      if (prevTimeoutRef.current) clearTimeout(prevTimeoutRef.current);
      if (nextTimeoutRef.current) clearTimeout(nextTimeoutRef.current);
      if (prevIntervalRef.current) clearInterval(prevIntervalRef.current);
      if (nextIntervalRef.current) clearInterval(nextIntervalRef.current);
    };
  }, []);

  const handlePrevMouseEnter = () => {
    prevTimeoutRef.current = setTimeout(() => {
      handlePrevMonth();
      prevIntervalRef.current = setInterval(() => {
        handlePrevMonth();
      }, 750);
    }, 220);
  };

  const handlePrevMouseLeave = () => {
    if (prevTimeoutRef.current) {
      clearTimeout(prevTimeoutRef.current);
      prevTimeoutRef.current = null;
    }
    if (prevIntervalRef.current) {
      clearInterval(prevIntervalRef.current);
      prevIntervalRef.current = null;
    }
  };

  const handleNextMouseEnter = () => {
    nextTimeoutRef.current = setTimeout(() => {
      handleNextMonth();
      nextIntervalRef.current = setInterval(() => {
        handleNextMonth();
      }, 750);
    }, 220);
  };

  const handleNextMouseLeave = () => {
    if (nextTimeoutRef.current) {
      clearTimeout(nextTimeoutRef.current);
      nextTimeoutRef.current = null;
    }
    if (nextIntervalRef.current) {
      clearInterval(nextIntervalRef.current);
      nextIntervalRef.current = null;
    }
  };

  // Helper: Format date string as YYYY-MM-DD
  const formatDateString = (y: number, m: number, d: number) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  // Dynamic calculation of day cells matching Monday-start
  const dayCells = useMemo(() => {
    const cells: { day: number; dateStr: string; isCurrentMonth: boolean; hasEvents: boolean; events: Assessment[] }[] = [];
    
    // First day of current month weekday index
    const firstDayIndex = new Date(year, month, 1).getDay();
    // Monday is 1, Sunday is 0. Shift firstDayIndex for Monday-Start
    // Monday=0, Tuesday=1 ... Sunday=6
    const adjustedStart = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    // Days in previous month
    const prevMonthDaysCount = new Date(year, month, 0).getDate();
    // Previous month year & month indices
    const prevYear = month === 0 ? year - 1 : year;
    const prevMonthIdx = month === 0 ? 11 : month - 1;

    // Render cells from previous month
    for (let i = adjustedStart - 1; i >= 0; i--) {
      const d = prevMonthDaysCount - i;
      const dateStr = formatDateString(prevYear, prevMonthIdx, d);
      const dayAssessments = assessments.filter((a) => a.dueDate === dateStr);
      cells.push({
        day: d,
        dateStr,
        isCurrentMonth: false,
        hasEvents: dayAssessments.length > 0,
        events: dayAssessments
      });
    }

    // Days in current month
    const currentMonthDaysCount = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= currentMonthDaysCount; d++) {
      const dateStr = formatDateString(year, month, d);
      const dayAssessments = assessments.filter((a) => a.dueDate === dateStr);
      cells.push({
        day: d,
        dateStr,
        isCurrentMonth: true,
        hasEvents: dayAssessments.length > 0,
        events: dayAssessments
      });
    }

    // Remaining days to fit 42-grid rows
    const totalCells = cells.length;
    const remaining = totalCells <= 35 ? 35 - totalCells : 42 - totalCells;
    const nextYear = month === 11 ? year + 1 : year;
    const nextMonthIdx = month === 11 ? 0 : month + 1;

    for (let d = 1; d <= remaining; d++) {
      const dateStr = formatDateString(nextYear, nextMonthIdx, d);
      const dayAssessments = assessments.filter((a) => a.dueDate === dateStr);
      cells.push({
        day: d,
        dateStr,
        isCurrentMonth: false,
        hasEvents: dayAssessments.length > 0,
        events: dayAssessments
      });
    }

    return cells;
  }, [year, month, assessments]);

  // Selected date formatting for display (e.g. "November 14, 2024")
  const displaySelectedDateStr = useMemo(() => {
    if (!selectedDateStr) return 'No Date Selected';
    const [y, m, d] = selectedDateStr.split('-').map(Number);
    if (isNaN(y) || isNaN(m) || isNaN(d)) return typeof selectedDateStr === 'string' ? selectedDateStr : 'Selected Date';
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  }, [selectedDateStr]);

  // Filtered assessments on clicked date cell
  const selectedDateAssessments = useMemo(() => {
    return assessments.filter((a) => a.dueDate === selectedDateStr);
  }, [assessments, selectedDateStr]);

  // Calculate day cells for all 12 months for the Yearly view component
  const yearMonthsData = useMemo(() => {
    return monthNames.map((mName, mIdx) => {
      const daysList: { day: number; dateStr: string; events: Assessment[] }[] = [];
      const daysCount = new Date(year, mIdx + 1, 0).getDate();
      const firstDayIdx = new Date(year, mIdx, 1).getDay();
      const adjustedStart = firstDayIdx === 0 ? 6 : firstDayIdx - 1;

      // Spacers
      for (let i = 0; i < adjustedStart; i++) {
        daysList.push({ day: 0, dateStr: '', events: [] });
      }

      // Real Days
      for (let d = 1; d <= daysCount; d++) {
        const dStr = formatDateString(year, mIdx, d);
        const evs = assessments.filter((a) => a.dueDate === dStr);
        daysList.push({
          day: d,
          dateStr: dStr,
          events: evs
        });
      }

      const totalEventsCount = assessments.filter((a) => {
        const parts = a.dueDate.split('-');
        return parseInt(parts[0]) === year && parseInt(parts[1]) === (mIdx + 1);
      }).length;

      return {
        monthIndex: mIdx,
        monthName: mName,
        days: daysList,
        totalEventsCount
      };
    });
  }, [year, assessments]);

  // Dynamic monthly progress indicators
  const monthlyProgress = useMemo(() => {
    // Look up assessments occurring in the currently viewed month
    const currentMonthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
    const monthAssessments = assessments.filter((a) => a.dueDate.startsWith(currentMonthStr));
    const totalCount = monthAssessments.length;
    const completedCount = monthAssessments.filter((a) => a.status === 'Submitted').length;
    const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    return { percent, completedCount, totalCount };
  }, [assessments, year, month]);

  // Calculate dynamic annual stats
  const annualProgress = useMemo(() => {
    const yearAssessments = assessments.filter((a) => a.dueDate.startsWith(`${year}-`));
    const totalCount = yearAssessments.length;
    const completedCount = yearAssessments.filter((a) => a.status === 'Submitted').length;
    const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    return { percent, completedCount, totalCount };
  }, [assessments, year]);

  // Dot tags renderer matching status types
  const getDotColor = (status: AssessmentStatus) => {
    switch (status) {
      case 'Submitted':
        return 'bg-[#00a673]'; // Green
      case 'In Progress':
        return 'bg-[#feae2c]'; // Amber
      case 'Overdue':
        return 'bg-[#ba1a1a]'; // Red
      case 'Not Started':
      default:
        return 'bg-gray-400';
    }
  };

  const handleMiniDayClick = (dateStr: string, monthIdx: number) => {
    onSelectDateStr(dateStr);
    setCurrentDate(new Date(year, monthIdx, 15));
    setViewMode('month');
  };

  const handleMiniMonthHeaderClick = (monthIdx: number) => {
    setCurrentDate(new Date(year, monthIdx, 15));
    setViewMode('month');
  };

  return (
    <div className="w-full flex-1 flex flex-col gap-6">
      {/* Calendar header and traversal trigger elements */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-[#041534] dark:text-[#e9f1ff] transition-all">
              {viewMode === 'year' ? `${year} Academic Year` : `${monthNames[month]} ${year}`}
            </h2>
            <div className="flex bg-[#e5efff] dark:bg-[#1b2a4a] rounded-full p-1 border border-[#c5c6cf]/30 dark:border-[#45464e]/50">
              <button
                onClick={handlePrevMonth}
                onMouseEnter={handlePrevMouseEnter}
                onMouseLeave={handlePrevMouseLeave}
                className="p-1 px-2 text-[#041534] dark:text-white hover:bg-white/40 dark:hover:bg-[#2d3446] rounded-full transition-all active:scale-95 cursor-pointer flex items-center justify-center"
                title={viewMode === 'year' ? "Previous Year" : "Previous Month (Hover to quick scroll)"}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                onMouseEnter={handleNextMouseEnter}
                onMouseLeave={handleNextMouseLeave}
                className="p-1 px-2 text-[#041534] dark:text-white hover:bg-white/40 dark:hover:bg-[#2d3446] rounded-full transition-all active:scale-95 cursor-pointer flex items-center justify-center"
                title={viewMode === 'year' ? "Next Year" : "Next Month (Hover to quick scroll)"}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Segmented Controller to switch View Mode */}
          <div className="flex bg-gray-150 dark:bg-[#1b2a4a] p-1 rounded-full border border-gray-200 dark:border-gray-800 text-xs font-semibold select-none">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                viewMode === 'month'
                  ? 'bg-[#041534] text-white dark:bg-[#feae2c] dark:text-[#0d1c2d] shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
              }`}
            >
              Month View
            </button>
            <button
              onClick={() => setViewMode('year')}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                viewMode === 'year'
                  ? 'bg-[#041534] text-white dark:bg-[#feae2c] dark:text-[#0d1c2d] shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
              }`}
            >
              Year View (12 Months)
            </button>
          </div>
        </div>

        <button
          onClick={onOpenAddModal}
          className="bg-[#041534] dark:bg-[#feae2c] hover:bg-[#1b2a4a] dark:hover:bg-[#ffb955] text-white dark:text-[#0d1c2d] px-5 py-2.5 rounded-full text-xs font-bold tracking-widest flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm hover:shadow"
        >
          <Plus className="w-4 h-4" />
          NEW ASSESSMENT
        </button>
      </section>

      {/* Main Content layout grid - Bento configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column: Calendar block element */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {viewMode === 'month' ? (
            <div className="bg-white dark:bg-[#0b1422] rounded-xl border border-[#c5c6cf]/30 dark:border-[#45464e]/40 shadow-sm overflow-hidden flex flex-col transition-all">
              {/* Calendar Day Grid HeaderLabels */}
              <div className="grid grid-cols-7 bg-[#eef4ff] dark:bg-[#1b2a4a] border-b border-[#c5c6cf]/30 dark:border-[#45464e]/50 text-center py-2">
                {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((lbl, idx) => (
                  <span
                    key={lbl}
                    className={`text-[10px] font-bold tracking-wider font-sans ${
                      idx >= 5 ? 'text-[#835500] dark:text-[#ffb955]' : 'text-[#45464e] dark:text-[#c5c6cf]'
                    }`}
                  >
                    {lbl}
                  </span>
                ))}
              </div>

              {/* Calendar day cells */}
              <div className="grid grid-cols-7 divide-x divide-y divide-[#c5c6cf]/20 dark:divide-[#45464e]/20 border-t border-l border-transparent">
                {dayCells.map(({ day, dateStr, isCurrentMonth, hasEvents, events }, cellIdx) => {
                  const isSelected = selectedDateStr === dateStr;
                  const isToday = formatDateString(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()) === dateStr;

                  return (
                    <div
                      key={`${dateStr}-${cellIdx}`}
                      onClick={() => onSelectDateStr(dateStr)}
                      className={`min-h-[70px] md:min-h-[110px] p-2 flex flex-col justify-between transition-colors relative cursor-pointer group ${
                        isCurrentMonth
                          ? 'bg-white dark:bg-[#0b1422] hover:bg-[#eef4ff] dark:hover:bg-[#1b2a4a]/40'
                          : 'bg-gray-50/50 dark:bg-black/10 opacity-30 group-hover:opacity-60'
                      } ${
                        isSelected
                          ? 'ring-2 ring-[#041534] dark:ring-[#feae2c] z-10 bg-[#eef4ff]/50 dark:bg-[#233143]/50'
                          : ''
                      }`}
                    >
                      {/* Day Label element */}
                      <div className="flex justify-between items-center">
                        <span
                          className={`text-xs font-semibold ${
                            isToday
                              ? 'w-5 h-5 rounded-full bg-[#ba1a1a] dark:bg-[#ffb4ab] text-white dark:text-[#93000a] flex items-center justify-center font-bold shadow-sm'
                              : isSelected
                              ? 'text-[#041534] dark:text-[#feae2c] font-bold'
                              : 'text-gray-800 dark:text-gray-200'
                          }`}
                        >
                          {day}
                        </span>

                        {/* Desktop text notification tag */}
                        {isCurrentMonth && events.length > 0 && (
                          <span className="hidden md:inline text-[9px] font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded px-1 group-hover:bg-amber-100 group-hover:text-amber-800 transition-colors">
                            {events.length === 1 ? '1 Task' : `${events.length} Tasks`}
                          </span>
                        )}
                      </div>

                      {/* Micro list of dynamic dots and tags */}
                      <div className="mt-2 text-left">
                        {/* Event indicators */}
                        {events.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {events.slice(0, 3).map((ev) => (
                              <span
                                key={ev.id}
                                className={`w-2 h-2 rounded-full ${getDotColor(ev.status)} shadow-sm`}
                                title={`${ev.course}: ${ev.title}`}
                              />
                            ))}
                            {events.length > 3 && (
                              <span className="text-[8px] font-bold text-gray-400 leading-none">+{events.length - 3}</span>
                            )}
                          </div>
                        )}

                        {/* Inline micro texts for desktops */}
                        {isCurrentMonth && events.length > 0 && (
                          <div className="hidden md:block mt-2 h-4 overflow-hidden">
                            <p className="text-[9px] text-[#45464e] dark:text-[#c5c6cf] truncate leading-none">
                              {events[0].title}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* YEAR VIEW: Magnificent 12-month compact bento grid dashboard */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-fade-in transition-all">
              {yearMonthsData.map(({ monthIndex, monthName, days, totalEventsCount }) => {
                const isSelectedMonth = monthIndex === month;

                return (
                  <div
                    key={monthName}
                    className={`bg-white dark:bg-[#0b1422] rounded-xl border p-3 shadow-xs hover:shadow transition-all ${
                      isSelectedMonth
                        ? 'border-[#041534] dark:border-[#feae2c] shadow-sm'
                        : 'border-gray-200/60 dark:border-[#45464e]/40'
                    }`}
                  >
                    {/* Mini Month Header */}
                    <div className="flex justify-between items-center mb-2 pb-1 border-b border-gray-100 dark:border-gray-800">
                      <button
                        onClick={() => handleMiniMonthHeaderClick(monthIndex)}
                        className="font-sans text-xs font-bold text-[#041534] dark:text-[#e9f1ff] hover:text-[#feae2c] text-left cursor-pointer transition-colors"
                      >
                        {monthName}
                      </button>
                      
                      {totalEventsCount > 0 && (
                        <span className="text-[9px] bg-amber-50 dark:bg-[#feae2c]/15 text-amber-700 dark:text-[#feae2c] font-bold px-1.5 py-0.5 rounded-md">
                          {totalEventsCount} {totalEventsCount === 1 ? 'Task' : 'Tasks'}
                        </span>
                      )}
                    </div>

                    {/* Compact Weekday indicator row label */}
                    <div className="grid grid-cols-7 text-center text-[7px] font-extrabold text-[#75777f] dark:text-gray-400 mb-1 leading-none font-mono">
                      <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                    </div>

                    {/* Compact Day grid matrix */}
                    <div className="grid grid-cols-7 gap-0.5 text-center text-[9px]">
                      {days.map((dObj, dayCellIdx) => {
                        const isCurrentSelectedDay = dObj.day > 0 && selectedDateStr === dObj.dateStr;
                        const isToday = dObj.day > 0 && formatDateString(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()) === dObj.dateStr;

                        if (dObj.day === 0) {
                          return <div key={`empty-${dayCellIdx}`} className="h-4.5" />;
                        }

                        return (
                          <div
                            key={`day-${dObj.day}-${dayCellIdx}`}
                            onClick={() => handleMiniDayClick(dObj.dateStr, monthIndex)}
                            className={`h-4.5 flex flex-col items-center justify-between py-0.5 rounded-sm relative cursor-pointer group transition-all ${
                              isCurrentSelectedDay
                                ? 'bg-[#041534] text-white dark:bg-[#feae2c] dark:text-[#0b1422] font-extrabold shadow-xs scale-105'
                                : isToday
                                ? 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400 font-extrabold'
                                : dObj.events.length > 0
                                ? 'bg-amber-50 dark:bg-amber-950/30 font-semibold text-[#0d1c2d] dark:text-[#fff]'
                                : 'text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                            title={`${dObj.dateStr}: ${dObj.events.length} academic tasks`}
                          >
                            <span className="leading-none">{dObj.day}</span>
                            
                            {/* Tiny event dot indicator inside mini calendar day */}
                            {dObj.events.length > 0 && !isCurrentSelectedDay && (
                              <span className="absolute bottom-[1.5px] w-0.8 h-0.8 rounded-full bg-[#feae2c]" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column: Selected Summary Date Box details */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Bento card panel: selected date info details */}
          <div 
            id="summary-panel"
            className="bg-[#e5efff] dark:bg-[#1b2a4a] p-5 rounded-xl border border-[#c5c6cf]/30 dark:border-[#4c556b]/40 shadow-sm flex flex-col"
          >
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#041534]/10 dark:border-[#ffffff]/10">
              <div>
                <span className="text-[10px] font-bold text-[#8392b7] dark:text-[#ffb955] uppercase tracking-wide">
                  Schedule Details
                </span>
                <h3 className="font-sans text-lg font-bold text-[#041534] dark:text-[#e9f1ff] mt-0.5">
                  {displaySelectedDateStr}
                </h3>
              </div>
              <CalendarIcon className="w-5 h-5 text-[#041534] dark:text-[#feae2c]" />
            </div>

            {/* Assessment listing matching selection */}
            {selectedDateAssessments.length === 0 ? (
              <div className="bg-white/40 dark:bg-black/20 p-6 rounded-lg text-center border border-dashed border-gray-300 dark:border-gray-800 my-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No academic tasks scheduled for this day. Select a month and day on the calendar above to view logged items.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedDateAssessments.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onSelectAssessment(item)}
                    className="bg-white dark:bg-[#0b1422] p-4 rounded-lg shadow-sm border-l-4 border-[#feae2c] dark:border-[#feae2c] border border-gray-200/50 dark:border-gray-800 hover:scale-[1.01] transition-transform cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-extrabold text-white bg-[#041534] dark:bg-[#1b2a4a] px-2 py-0.5 rounded uppercase font-mono tracking-wider">
                        {item.course}
                      </span>
                      <span className="text-[10px] font-bold text-[#835500] dark:text-[#ffb955]">
                        {item.weight ? `${item.weight}% weight` : ''}
                      </span>
                    </div>

                    <h4 className="font-sans text-sm font-bold text-[#041534] dark:text-[#e9f1ff] mt-1.5 line-clamp-1">
                      {item.title}
                    </h4>

                    {/* Progress tracking micro horizontal line */}
                    <div className="mt-3">
                      <div className="flex justify-between text-[10px] text-gray-500 mb-1 font-semibold">
                        <span>Preparation State</span>
                        <span>{item.progress}%</span>
                      </div>
                      <div className="h-1 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="bg-[#feae2c] h-full"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dynamic Progress Indicator Ring: Multi-scope compatibility */}
          {viewMode === 'month' ? (
            <div className="bg-white dark:bg-[#0b1422] p-5 rounded-xl border border-[#c5c6cf]/30 dark:border-[#45464e]/40 shadow-sm">
              <h3 className="text-xs font-bold text-[#45464e] dark:text-[#c5c6cf] tracking-wider uppercase mb-4">
                Monthly Calendar Stat
              </h3>
              
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    {/* Background Circle */}
                    <circle
                      className="text-[#eef4ff] dark:text-[#233143]"
                      cx="32"
                      cy="32"
                      fill="transparent"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="6"
                    />
                    {/* Animated Foreground Circle */}
                    <circle
                      className="text-[#feae2c] dark:text-[#feae2c] transition-all duration-1000 ease-out"
                      cx="32"
                      cy="32"
                      fill="transparent"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="6"
                      strokeDasharray="175"
                      strokeDashoffset={175 - (175 * monthlyProgress.percent) / 100}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-bold text-sm text-[#041534] dark:text-white font-mono">
                    {monthlyProgress.percent}%
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#041534] dark:text-[#e9f1ff]">
                    Completed Assessments
                  </p>
                  <p className="text-xs text-[#45464e] dark:text-[#c5c6cf] mt-0.5">
                    <span className="font-bold text-sm text-[#00a673]">{monthlyProgress.completedCount}</span> completed of <span className="font-bold">{monthlyProgress.totalCount}</span> listed for {monthNames[month]}.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#0b1422] p-5 rounded-xl border border-[#c5c6cf]/30 dark:border-[#45464e]/40 shadow-sm animate-fade-in">
              <h3 className="text-xs font-bold text-[#45464e] dark:text-[#c5c6cf] tracking-wider uppercase mb-4">
                Annual Year Dynamic Stat
              </h3>
              
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      className="text-[#eef4ff] dark:text-[#233143]"
                      cx="32"
                      cy="32"
                      fill="transparent"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="6"
                    />
                    <circle
                      className="text-[#feae2c] dark:text-[#feae2c] transition-all duration-1000 ease-out"
                      cx="32"
                      cy="32"
                      fill="transparent"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="6"
                      strokeDasharray="175"
                      strokeDashoffset={175 - (175 * annualProgress.percent) / 100}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-bold text-sm text-[#041534] dark:text-white font-mono">
                    {annualProgress.percent}%
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#041534] dark:text-[#e9f1ff]">
                    Yearly Progress Average
                  </p>
                  <p className="text-xs text-[#45464e] dark:text-[#c5c6cf] mt-0.5">
                    <span className="font-bold text-sm text-[#00a673]">{annualProgress.completedCount}</span> completed of <span className="font-bold">{annualProgress.totalCount}</span> active syllabus items logged in {year}.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
