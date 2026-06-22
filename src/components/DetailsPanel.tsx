/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Assessment, AssessmentStatus } from '../types.ts';
import {
  ArrowLeft,
  Trash2,
  Edit3,
  Calendar,
  Percent,
  CheckCircle,
  Clock,
  Share2,
  Bookmark,
  ExternalLink
} from 'lucide-react';

interface DetailsPanelProps {
  assessment: Assessment | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  onEdit: (assessment: Assessment) => void;
  onUpdateAssessment: (updated: Assessment) => void;
}

export default function DetailsPanel({
  assessment,
  isOpen,
  onClose,
  onDelete,
  onEdit,
  onUpdateAssessment
}: DetailsPanelProps) {
  const [localNotes, setLocalNotes] = useState('');
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [showNotification, setShowNotification] = useState('');

  const lastIdRef = useRef<string | null>(null);
  const localNotesRef = useRef(localNotes);

  // Sync ref with current localNotes
  useEffect(() => {
    localNotesRef.current = localNotes;
  }, [localNotes]);

  // Settle local notes when selection target switches
  useEffect(() => {
    if (assessment) {
      if (assessment.id !== lastIdRef.current) {
        setLocalNotes(assessment.notes ?? '');
        lastIdRef.current = assessment.id;
      }
    } else {
      lastIdRef.current = null;
    }
  }, [assessment]);

  // Save pending changes when component unmounts or before it changes target
  useEffect(() => {
    return () => {
      if (assessment && localNotesRef.current !== (assessment.notes ?? '')) {
        const updated = { ...assessment, notes: localNotesRef.current };
        onUpdateAssessment(updated);
      }
    };
  }, [assessment, onUpdateAssessment]);

  // Debounced auto-save triggers as user is typing
  useEffect(() => {
    if (!assessment) return;
    if (localNotes === (assessment.notes ?? '')) return;

    setIsAutoSaving(true);
    const timer = setTimeout(() => {
      const updated = { ...assessment, notes: localNotes };
      onUpdateAssessment(updated);
      setIsAutoSaving(false);
    }, 800); // 800ms debounce

    return () => clearTimeout(timer);
  }, [localNotes, assessment, onUpdateAssessment]);

  if (!isOpen || !assessment) return null;

  // Manual save logic on blurring notes textbox for immediate execution
  const handleNotesBlur = () => {
    if (localNotes !== (assessment.notes ?? '')) {
      const updated = { ...assessment, notes: localNotes };
      onUpdateAssessment(updated);
      setIsAutoSaving(false);
      triggerToast('Notes saved.');
    }
  };

  const triggerToast = (msg: string) => {
    setShowNotification(msg);
    setTimeout(() => setShowNotification(''), 3000);
  };

  // Toggle complete / submit
  const handleToggleSubmitted = () => {
    const isSubmitted = assessment.status === 'Submitted';
    const updated: Assessment = {
      ...assessment,
      status: isSubmitted ? 'In Progress' : 'Submitted',
      progress: isSubmitted ? 50 : 100
    };
    onUpdateAssessment(updated);
    triggerToast(isSubmitted ? 'Marked task as in-progress.' : 'Assessment submitted successfully.');
  };

  const roundedProgressOffset = 175 - (175 * assessment.progress) / 100;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-fade-in">
      {/* Click backdrop to exit */}
      <div className="flex-grow" onClick={onClose} />

      {/* The slide panel */}
      <div className="w-full md:w-[500px] h-full bg-white dark:bg-[#0b1422] shadow-2xl flex flex-col relative animate-slide-in border-l border-[#c5c6cf]/30 dark:border-[#45464e]/50 transition-colors duration-200">
        
        {/* Panel Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors active:scale-95 cursor-pointer"
              title="Close Details"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h3 className="font-sans text-lg font-bold text-[#041534] dark:text-[#e9f1ff]">
              Assessment Details
            </h3>
          </div>

          <div className="flex gap-1">
            <button
              onClick={() => onDelete(assessment.id)}
              className="p-2 text-[#ba1a1a] dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-full transition-colors active:scale-95 cursor-pointer"
              title="Delete Assessment"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => onEdit(assessment)}
              className="p-2 text-gray-500 hover:text-[#041534] dark:hover:text-[#feae2c] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors active:scale-95 cursor-pointer"
              title="Edit Details"
            >
              <Edit3 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Panel main scroll area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Quick Toast Alerts */}
          {showNotification && (
            <div className="fixed top-4 right-4 z-[60] bg-gray-800 text-white dark:bg-[#feae2c] dark:text-[#0d1c2d] px-4 py-2.5 rounded-lg text-xs font-bold shadow-lg flex items-center gap-2 animate-bounce">
              <CheckCircle className="w-4 h-4 text-green-400 dark:text-[#0d1c2d]" />
              <span>{showNotification}</span>
            </div>
          )}

          {/* Title & Subject Meta info */}
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold text-[#835500] dark:text-[#ffb955] uppercase tracking-wider block font-sans">
              {assessment.course}
            </span>
            <h2 className="font-sans text-2xl font-bold text-[#041534] dark:text-[#e9f1ff] leading-tight">
              {assessment.title}
            </h2>
            <div className="pt-2">
              <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                assessment.status === 'Submitted'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/45 dark:text-emerald-400'
                  : assessment.status === 'In Progress'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/45 dark:text-[#feae2c]'
                  : assessment.status === 'Overdue'
                  ? 'bg-red-100 text-red-800 dark:bg-red-950/45 dark:text-[#ffb4ab]'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
              }`}>
                {assessment.status}
              </span>
            </div>
          </div>

          {/* Quick stats details grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#eef4ff] dark:bg-[#1b2a4a] p-4 rounded-xl flex items-center gap-3 border border-gray-100 dark:border-gray-800">
              <div className="w-10 h-10 rounded-lg bg-white/80 dark:bg-[#2d3446] flex items-center justify-center text-[#041534] dark:text-[#feae2c] shadow-sm">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-extrabold text-gray-400 dark:text-gray-400 uppercase tracking-widest leading-none">
                  Due Date
                </p>
                <p className="font-sans text-sm font-bold text-[#041534] dark:text-gray-150 mt-1 truncate">
                  {assessment.dueDate}
                </p>
              </div>
            </div>

            <div className="bg-[#eef4ff] dark:bg-[#1b2a4a] p-4 rounded-xl flex items-center gap-3 border border-gray-100 dark:border-gray-800">
              <div className="w-10 h-10 rounded-lg bg-white/80 dark:bg-[#2d3446] flex items-center justify-center text-[#ffb955] shadow-sm">
                <Percent className="w-5 h-5 text-amber-600 dark:text-[#feae2c]" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-extrabold text-gray-400 dark:text-gray-400 uppercase tracking-widest leading-none">
                  Weight
                </p>
                <p className="font-sans text-sm font-bold text-[#041534] dark:text-gray-150 mt-1 truncate">
                  {assessment.weight ? `${assessment.weight}% of Total` : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Progress gauge area */}
          <div className="space-y-2 py-2 border-t border-b border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                COMPLETION PROGRESS
              </span>
              <span className="text-sm font-bold text-[#835500] dark:text-[#ffb955] font-mono">
                {assessment.progress}%
              </span>
            </div>

            <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#feae2c] dark:bg-[#feae2c] rounded-full transition-all duration-700"
                style={{ width: `${assessment.progress}%` }}
              />
            </div>

            <p className="text-xs text-gray-400 dark:text-gray-400 block italic leading-normal">
              {assessment.progress === 100
                ? 'Excellent! Task completed and submitted ahead of schedule.'
                : assessment.progress > 50
                ? 'Over halfway prepared. Continue reviewing references to secure high marks!'
                : 'Initial stages. Approximately 4 hours of focused study duration estimated to finalize.'}
            </p>
          </div>

          {/* Interactive auto-saving notes element */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label 
                htmlFor="notes-textarea" 
                className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider"
              >
                Study Notes & Academic details
              </label>
              
              {isAutoSaving && (
                <span className="text-[10px] font-medium text-amber-500 font-mono animate-pulse">
                  Auto-saving...
                </span>
              )}
            </div>

            <div className="relative">
              <textarea
                id="notes-textarea"
                rows={5}
                placeholder="Write sub-tasks, bibliographies, references, or instructions here..."
                value={localNotes}
                onChange={(e) => setLocalNotes(e.target.value)}
                onBlur={handleNotesBlur}
                className="w-full bg-gray-50/50 dark:bg-[#041534]/50 border border-gray-200 dark:border-[#45464e]/50 rounded-xl p-4 text-sm focus:ring-1 focus:ring-amber-500 focus:outline-none focus:border-transparent transition-all overflow-y-auto"
              />
            </div>
          </div>

          {/* Workspace photo attachment illustration mockups */}
          <div className="space-y-2 mt-4">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Reference attachment (Syllabus reference)
            </span>
            <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 aspect-video relative group select-none">
              <img
                src={assessment.attachmentUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBrpm4GS1MjjGBczFIDeT4q_C4xLSOT3i-BAZ7x048G1_5hIEEEe1WQGlZF6d-VMAJLbV6QiTZQLRytpW-O5Xf9tF2AinyTWfPukA5v38aWandFt4-ggZ4Dm4xyxbZkcjV3aOpHxtPfOs55GBjCp9EzsK8XFz6zsvCqMdrxOv29aoZhKck6kbA7zDPSoJQIIUtycVjZXG-xVbcJrtFIHCToIal8b4ZB7cIXJd8I8QBIRtGF4V5jFSpj-8SC12blgSHlxuI63DYn7QvW'}
                alt={assessment.attachmentAlt || "Default minimalist workspace"}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <button
                  type="button"
                  onClick={() => triggerToast("Viewing details...")}
                  className="bg-white/95 text-[#041534] dark:bg-[#0b1422] dark:text-white px-4 py-2 rounded-full font-bold text-xs shadow flex items-center gap-1.5 cursor-pointer hover:bg-white active:scale-95"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Full Attachment
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Panel Footer buttons block */}
        <div className="p-4 border-t border-[#c5c6cf]/30 dark:border-[#45464e]/50 bg-gray-55 dark:bg-[#1b2a4a] grid grid-cols-1 gap-2 transition-colors">
          <button
            onClick={handleToggleSubmitted}
            className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-sm shadow-md cursor-pointer transition-all active:scale-[0.98] ${
              assessment.status === 'Submitted'
                ? 'bg-gray-150 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                : 'bg-[#041534] dark:bg-[#feae2c] text-white dark:text-[#0d1c2d]'
            }`}
          >
            <CheckCircle className="w-4.5 h-4.5" />
            {assessment.status === 'Submitted' ? 'Mark as In Progress' : 'Mark as Submitted'}
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => triggerToast('Study reminder registered!')}
              className="py-2.5 px-3 border border-[#c5c6cf]/50 dark:border-[#45464e]/70 text-[#041534] dark:text-white hover:bg-gray-150 dark:hover:bg-gray-800 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Clock className="w-3.5 h-3.5" />
              Remind Me
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${assessment.course}: ${assessment.title} - Due ${assessment.dueDate}`);
                triggerToast('Copied notes placeholder!');
              }}
              className="py-2.5 px-3 border border-[#c5c6cf]/50 dark:border-[#45464e]/70 text-[#041534] dark:text-white hover:bg-gray-150 dark:hover:bg-gray-800 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share Task
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
