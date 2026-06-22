/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Assessment, AssessmentStatus } from '../types.ts';
import { X, Save, Sparkles, AlertCircle } from 'lucide-react';

interface AddEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (assessment: Assessment) => void;
  assessmentToEdit?: Assessment | null;
  defaultDate?: string; // date prefill e.g. YYYY-MM-DD
}

export default function AddEditModal({
  isOpen,
  onClose,
  onSave,
  assessmentToEdit,
  defaultDate
}: AddEditModalProps) {
  const [course, setCourse] = useState('');
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [weight, setWeight] = useState<number>(25);
  const [status, setStatus] = useState<AssessmentStatus>('Not Started');
  const [progress, setProgress] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [errorText, setErrorText] = useState('');

  // Prefill hook when edit assessment target changes
  useEffect(() => {
    if (assessmentToEdit) {
      setCourse(assessmentToEdit.course);
      setTitle(assessmentToEdit.title);
      setDueDate(assessmentToEdit.dueDate);
      setWeight(assessmentToEdit.weight ?? 25);
      setStatus(assessmentToEdit.status);
      setProgress(assessmentToEdit.progress);
      setNotes(assessmentToEdit.notes ?? '');
      setErrorText('');
    } else {
      // Clear forms for new tasks
      setCourse('');
      setTitle('');
      setDueDate(defaultDate || new Date().toISOString().split('T')[0]);
      setWeight(25);
      setStatus('Not Started');
      setProgress(0);
      setNotes('');
      setErrorText('');
    }
  }, [assessmentToEdit, defaultDate, isOpen]);

  // Sync status if progress slider updates or vice versa
  const handleProgressChange = (val: number) => {
    setProgress(val);
    if (val === 100) {
      setStatus('Submitted');
    } else if (val > 0 && status === 'Not Started') {
      setStatus('In Progress');
    } else if (val === 0 && status === 'In Progress') {
      setStatus('Not Started');
    }
  };

  // Sync progress if status updates
  const handleStatusChange = (newStatus: AssessmentStatus) => {
    setStatus(newStatus);
    if (newStatus === 'Submitted') {
      setProgress(100);
    } else if (newStatus === 'Not Started') {
      setProgress(0);
    } else if (newStatus === 'In Progress' && (progress === 0 || progress === 100)) {
      setProgress(50); // intermediate default
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');

    if (!course.trim() || !title.trim() || !dueDate.trim()) {
      setErrorText('Please fill out course, title, and due date.');
      return;
    }

    const savedItem: Assessment = {
      id: assessmentToEdit ? assessmentToEdit.id : Date.now().toString(),
      course: course.trim(),
      title: title.trim(),
      dueDate,
      progress,
      status,
      weight,
      notes: notes.trim(),
      // Retain attachment if editing
      attachmentUrl: assessmentToEdit?.attachmentUrl,
      attachmentAlt: assessmentToEdit?.attachmentAlt
    };

    onSave(savedItem);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all animate-fade-in">
      <div className="bg-white dark:bg-[#1b2a4a] w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-[#c5c6cf]/30 dark:border-[#45464e]/50 max-h-[90vh] flex flex-col">
        
        {/* Banner header title */}
        <div className="p-5 bg-[#041534] dark:bg-[#0a1a3a] text-white flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#feae2c]" />
              {assessmentToEdit ? 'Edit Assessment' : 'New Academic Assessment'}
            </h3>
            <p className="text-xs text-gray-300 mt-1">
              {assessmentToEdit ? 'Adjust details, grade weights, or notes.' : 'Log an upcoming assignment, quiz, or milestone.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-colors active:scale-95 cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form content scroll outer */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 bg-white dark:bg-[#0a121f]">
          {errorText && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 text-[#ba1a1a] dark:text-red-300 rounded-lg flex items-center gap-2 text-xs border border-red-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorText}</span>
            </div>
          )}

          {/* Bento Card: Basic Info */}
          <div className="bg-gray-50 dark:bg-[#1b2a4a]/40 p-4 rounded-xl border border-gray-100 dark:border-gray-800 space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-[#45464e] dark:text-[#c5c6cf] uppercase mb-1 tracking-wider">
                Course Code or Name
              </label>
              <input
                id="course-input"
                type="text"
                placeholder="e.g. Advanced Psychology, MBI807B"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                required
                className="w-full h-11 px-3 bg-white dark:bg-[#041534] text-[#0d1c2d] dark:text-[#e9f1ff] border border-[#c5c6cf]/40 dark:border-[#45464e]/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#041534] font-medium"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#45464e] dark:text-[#c5c6cf] uppercase mb-1 tracking-wider">
                Assessment Title
              </label>
              <input
                id="title-input"
                type="text"
                placeholder="e.g. Cognitive Behavioral Theory Analysis, Midterm Paper"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full h-11 px-3 bg-white dark:bg-[#041534] text-[#0d1c2d] dark:text-[#e9f1ff] border border-[#c5c6cf]/40 dark:border-[#45464e]/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#041534] font-medium"
              />
            </div>
          </div>

          {/* Schedule & Value Weights */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-[#1b2a4a]/40 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
              <label className="block text-[10px] font-bold text-[#45464e] dark:text-[#c5c6cf] uppercase mb-1.5 tracking-wider">
                Due Date
              </label>
              <input
                id="date-input"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="w-full h-11 px-3 bg-white dark:bg-[#041534] text-[#0d1c2d] dark:text-[#e9f1ff] border border-[#c5c6cf]/40 dark:border-[#45464e]/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#041534] font-medium"
              />
            </div>

            <div className="bg-gray-50 dark:bg-[#1b2a4a]/40 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
              <label className="block text-[10px] font-bold text-[#45464e] dark:text-[#c5c6cf] uppercase mb-1.5 tracking-wider">
                Syllabus Weight (%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="weight-input"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="25"
                  value={weight}
                  onChange={(e) => setWeight(parseInt(e.target.value) || 0)}
                  className="w-full h-11 px-3 bg-white dark:bg-[#041534] text-[#0d1c2d] dark:text-[#e9f1ff] border border-[#c5c6cf]/40 dark:border-[#45464e]/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#041534] font-medium"
                />
                <span className="text-gray-500 font-bold">%</span>
              </div>
            </div>
          </div>

          {/* Status & progress dynamic section */}
          <div className="bg-gray-50 dark:bg-[#1b2a4a]/40 p-4 rounded-xl border border-gray-100 dark:border-gray-800 space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-[#45464e] dark:text-[#c5c6cf] uppercase mb-2 tracking-wider">
                Current Task Status
              </label>
              <div className="flex flex-wrap gap-2">
                {(['Not Started', 'In Progress', 'Submitted', 'Overdue'] as AssessmentStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleStatusChange(st)}
                    className={`flex-1 py-2 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
                      status === st
                        ? st === 'Submitted'
                          ? 'bg-[#00a673] hover:bg-[#00a673]/90 text-white border-transparent shadow'
                          : st === 'In Progress'
                          ? 'bg-[#feae2c] hover:bg-[#feae2c]/90 text-white border-transparent shadow'
                          : st === 'Overdue'
                          ? 'bg-[#ba1a1a] hover:bg-[#ba1a1a]/90 text-white border-transparent shadow'
                          : 'bg-gray-800 hover:bg-gray-700 text-white border-transparent shadow'
                        : 'bg-white dark:bg-[#041534] text-gray-700 dark:text-gray-300 border-[#c5c6cf]/40 dark:border-[#45464e]/50 hover:bg-gray-100 dark:hover:bg-[#1b2a4a]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-bold text-[#45464e] dark:text-[#c5c6cf] uppercase tracking-wide">
                  Preparation Progress
                </label>
                <span className="text-sm font-bold text-[#835500] dark:text-[#ffb955] font-mono">
                  {progress}%
                </span>
              </div>
              <div className="relative py-2">
                <input
                  id="progress-slider"
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={progress}
                  onChange={(e) => handleProgressChange(parseInt(e.target.value))}
                  className="w-full cursor-pointer h-1.5 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none accent-[#feae2c]"
                />
              </div>
            </div>
          </div>

          {/* Study Notes & Bibliography references */}
          <div>
            <label className="block text-[10px] font-bold text-[#45464e] dark:text-[#c5c6cf] uppercase mb-1 tracking-wider">
              Study Notes & Academic references
            </label>
            <textarea
              id="notes-textbox"
              rows={4}
              placeholder="Cite links, subtasks, bibliographic keys, rubrics, or drafts details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 bg-white dark:bg-[#041534] text-[#0d1c2d] dark:text-[#e9f1ff] border border-[#c5c6cf]/40 dark:border-[#45464e]/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#041534] text-sm resize-none"
            />
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              id="modal-submit-btn"
              type="submit"
              className="flex-1 h-12 bg-[#041534] text-white dark:bg-[#feae2c] dark:text-[#001b0f] font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all text-sm cursor-pointer shadow-md"
            >
              <Save className="w-4.5 h-4.5" />
              Save Academic Assessment
            </button>
            <button
              id="modal-close-btn"
              type="button"
              onClick={onClose}
              className="px-6 h-12 border border-[#c5c6cf]/40 dark:border-[#45464e]/50 text-[#45464e] dark:text-[#c5c6cf] hover:bg-gray-100 dark:hover:bg-[#1e293b] rounded-xl font-semibold transition-all active:scale-95 text-sm cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
