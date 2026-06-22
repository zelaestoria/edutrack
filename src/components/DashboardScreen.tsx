/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Assessment, AssessmentStatus } from '../types.ts';
import { Search, Filter, Calendar, Percent, Plus, Clock, FileWarning, SearchX } from 'lucide-react';

interface DashboardScreenProps {
  assessments: Assessment[];
  onSelectAssessment: (assessment: Assessment) => void;
  onOpenAddModal: () => void;
}

export default function DashboardScreen({ assessments, onSelectAssessment, onOpenAddModal }: DashboardScreenProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | AssessmentStatus>('All');
  const [sortBy, setSortBy] = useState<'dueDate' | 'title' | 'progress' | 'weight'>('dueDate');

  // Math metrics calculating statistics in real time
  const stats = useMemo(() => {
    const total = assessments.length;
    const completed = assessments.filter((a) => a.status === 'Submitted').length;
    const inProgress = assessments.filter((a) => a.status === 'In Progress').length;
    const notStarted = assessments.filter((a) => a.status === 'Not Started').length;
    const overdue = assessments.filter((a) => a.status === 'Overdue').length;
    return { total, completed, inProgress, notStarted, overdue };
  }, [assessments]);

  // Filters + Search + Sort logic
  const filteredAndSortedAssessments = useMemo(() => {
    return assessments
      .filter((item) => {
        const matchesSearch =
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesStatus = statusFilter === 'All' ? true : item.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'dueDate') {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        if (sortBy === 'progress') {
          return b.progress - a.progress; // descending progress
        }
        if (sortBy === 'weight') {
          return (b.weight || 0) - (a.weight || 0); // descending weight
        }
        return 0;
      });
  }, [assessments, searchTerm, statusFilter, sortBy]);

  // Color badges selector matching specifications
  const getStatusClasses = (status: AssessmentStatus) => {
    switch (status) {
      case 'Submitted':
        return 'bg-[#00a673]/10 text-[#00a673] border border-[#00a673]/30 dark:bg-[#005236]/40 dark:text-[#6ffbbe] dark:border-[#005236]/60';
      case 'In Progress':
        return 'bg-[#feae2c]/10 text-[#835500] border border-[#feae2c]/30 dark:bg-[#feae2c]/20 dark:text-[#ffb955] dark:border-[#feae2c]/40';
      case 'Overdue':
        return 'bg-[#ba1a1a]/10 text-[#ba1a1a] border border-[#ba1a1a]/30 dark:bg-[#93000a]/40 dark:text-[#ffb4ab] dark:border-[#93000a]/60';
      case 'Not Started':
      default:
        return 'bg-[#75777f]/10 text-[#45464e] border border-[#75777f]/20 dark:bg-[#1b2a4a] dark:text-[#c5c6cf] dark:border-[#45464e]/50';
    }
  };

  return (
    <div className="w-full h-full pb-16">
      {/* Metrics Bento Grid block */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-[#1b2a4a] p-5 rounded-xl border border-[#c5c6cf]/30 dark:border-[#45464e]/40 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[11px] font-semibold text-[#45464e] dark:text-[#c5c6cf] tracking-wide uppercase mb-1">
            Total Academic Tasks
          </p>
          <div className="flex justify-between items-end">
            <h2 className="text-3xl font-extrabold text-[#041534] dark:text-[#e9f1ff]">
              {stats.total}
            </h2>
            <span className="text-[12px] text-[#45464e] dark:text-[#c5c6cf] px-2 py-0.5 bg-[#eef4ff] dark:bg-[#233143] rounded-md font-medium">
              Active Scope
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1b2a4a] p-5 rounded-xl border border-[#c5c6cf]/30 dark:border-[#c5c6cf]/20 dark:border-[#45464e]/40 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[11px] font-semibold text-[#45464e] dark:text-[#c5c6cf] tracking-wide uppercase mb-1">
            Completed / Submitted
          </p>
          <div className="flex justify-between items-end">
            <h2 className="text-3xl font-extrabold text-[#00a673]">
              {stats.completed}
            </h2>
            <span className="text-[10px] text-[#00a673] px-2 py-0.5 bg-[#00a673]/10 rounded-md font-bold uppercase truncate">
              {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% Done
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1b2a4a] p-5 rounded-xl border border-[#c5c6cf]/30 dark:border-[#45464e]/40 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[11px] font-semibold text-[#45464e] dark:text-[#c5c6cf] tracking-wide uppercase mb-1">
            Actively In Progress
          </p>
          <div className="flex justify-between items-end">
            <h2 className="text-3xl font-extrabold text-[#feae2c]">
              {stats.inProgress}
            </h2>
            <span className="text-[10px] text-[#835500] dark:text-[#ffb955] px-2 py-0.5 bg-[#feae2c]/10 rounded-md font-bold uppercase">
              Working
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1b2a4a] p-5 rounded-xl border border-[#c5c6cf]/30 dark:border-[#45464e]/40 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[11px] font-semibold text-[#45464e] dark:text-[#c5c6cf] tracking-wide uppercase mb-1 block">
            Not Started / Overdue
          </p>
          <div className="flex justify-between items-end">
            <div className="flex items-baseline gap-1">
              <h2 className="text-3xl font-extrabold text-[#45464e] dark:text-[#c5c6cf]">
                {stats.notStarted}
              </h2>
              {stats.overdue > 0 && (
                <span className="text-sm font-bold text-[#ba1a1a]">
                  ({stats.overdue} Overdue)
                </span>
              )}
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${stats.overdue > 0 ? 'bg-red-100 text-[#ba1a1a] dark:bg-red-950/45 dark:text-red-400' : 'bg-gray-100 text-gray-500'}`}>
              Pending
            </span>
          </div>
        </div>
      </section>

      {/* Filter and sorting control bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-end gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-[#041534] dark:text-[#e9f1ff]">
            Current Academic Assessments
          </h3>
          <p className="text-sm text-[#45464e] dark:text-[#c5c6cf]">
            Logged tasks, syllabi weights, study milestones, and timelines.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Field */}
          <div className="relative flex-1 min-w-[200px] md:flex-initial">
            <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-gray-400" />
            <input
              id="search-input"
              type="text"
              placeholder="Search assessment or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-[#1b2a4a] text-[#0d1c2d] dark:text-[#e9f1ff] border border-[#c5c6cf]/40 dark:border-[#45464e]/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#041534] dark:focus:ring-[#feae2c]"
            />
          </div>

          {/* Status Dropdown Filter */}
          <div className="relative">
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'All' | AssessmentStatus)}
              className="pl-3 pr-8 py-2 text-sm bg-white dark:bg-[#1b2a4a] text-[#0d1c2d] dark:text-[#e9f1ff] border border-[#c5c6cf]/40 dark:border-[#45464e]/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#041534] appearance-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="In Progress">In Progress</option>
              <option value="Submitted">Submitted</option>
              <option value="Not Started">Not Started</option>
              <option value="Overdue">Overdue</option>
            </select>
            <Filter className="absolute right-3 top-3 w-3 h-3 text-gray-400 pointer-events-none" />
          </div>

          {/* Sort selection drop dropdown */}
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 text-sm bg-white dark:bg-[#1b2a4a] text-[#0d1c2d] dark:text-[#e9f1ff] border border-[#c5c6cf]/40 dark:border-[#45464e]/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#041534] cursor-pointer"
          >
            <option value="dueDate">Sort by: Due Date</option>
            <option value="title">Sort by: Title</option>
            <option value="progress">Sort by: Progress</option>
            <option value="weight">Sort by: Weight %</option>
          </select>
        </div>
      </div>

      {/* Main card listings */}
      {filteredAndSortedAssessments.length === 0 ? (
        <div id="no-assessments-empty" className="flex flex-col items-center justify-center py-16 bg-white dark:bg-[#111f33] border border-dashed border-[#c5c6cf]/60 dark:border-[#45464e]/60 rounded-xl text-center">
          <SearchX className="w-12 h-12 text-gray-400 mb-3" />
          <h4 className="text-lg font-bold text-[#041534] dark:text-[#e9f1ff]">No assessments found</h4>
          <p className="text-sm text-[#45464e] dark:text-[#c5c6cf] mt-1 max-w-md px-4">
            No items matched "{searchTerm || statusFilter}". Adjust filters above or click the "+" button below to log a brand new assessment!
          </p>
        </div>
      ) : (
        <div id="assessment-list-container" className="space-y-4">
          {filteredAndSortedAssessments.map((assessment) => (
            <div
              key={assessment.id}
              onClick={() => onSelectAssessment(assessment)}
              className="bg-white dark:bg-[#0b1422] p-5 rounded-xl border border-[#c5c6cf]/30 dark:border-[#45464e]/40 shadow-sm hover:shadow-md cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-200 transform hover:-translate-y-0.5"
            >
              {/* Primary parameters (Title / Syllabus indicators) */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-bold text-white bg-[#041534] dark:bg-[#b7c6ee]/10 dark:text-[#b7c6ee] px-2.5 py-0.5 rounded-md uppercase tracking-wider font-mono">
                    {assessment.course}
                  </span>
                  
                  {assessment.weight && (
                    <span className="text-[10px] font-bold text-[#835500] bg-[#feae2c]/10 dark:text-[#ffb955] px-2 py-0.5 rounded-md flex items-center gap-0.5">
                      <Percent className="w-2.5 h-2.5" />
                      {assessment.weight}% of Grade
                    </span>
                  )}
                </div>

                <h4 className="font-sans text-lg font-bold text-[#041534] dark:text-[#e9f1ff] truncate">
                  {assessment.title}
                </h4>

                <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 mt-2 text-xs">
                  <span className="flex items-center gap-1.5 font-medium transition-colors">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    Due Date: <span className="font-semibold text-gray-700 dark:text-gray-300">{assessment.dueDate}</span>
                  </span>
                  {assessment.notes && (
                    <span className="hidden sm:inline text-gray-400 max-w-xs truncate">
                      • {assessment.notes}
                    </span>
                  )}
                </div>
              </div>

              {/* Status block + horizontal progress indicator */}
              <div className="w-full md:w-56 flex flex-col justify-center gap-2 border-t border-gray-100 dark:border-gray-800 md:border-t-0 pt-3 md:pt-0">
                <div className="flex justify-between items-center text-xs">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${getStatusClasses(assessment.status)}`}>
                    {assessment.status}
                  </span>
                  <span className="text-xs font-bold text-[#041534] dark:text-[#e9f1ff] font-mono">
                    {assessment.progress}% prepared
                  </span>
                </div>

                <div className="h-2 w-full bg-[#eef4ff] dark:bg-[#1e293b] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#feae2c] dark:bg-[#ffb955] rounded-full transition-all duration-500"
                    style={{ width: `${assessment.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Action Button for prompt assessment creation */}
      <button
        id="dashboard-fab-add"
        onClick={onOpenAddModal}
        className="fixed bottom-20 md:bottom-8 right-6 w-14 h-14 bg-[#041534] dark:bg-[#feae2c] text-white dark:text-[#0a1a3a] rounded-full shadow-lg flex items-center justify-center z-40 hover:scale-[1.05] transition-all active:scale-95 cursor-pointer hover:shadow-cyan-500/10"
        title="Add Assessment"
      >
        <Plus className="w-7 h-7 font-bold" />
      </button>
    </div>
  );
}
