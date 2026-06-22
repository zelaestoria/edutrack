/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Assessment } from './types.ts';

export const INITIAL_ASSESSMENTS: Assessment[] = [
  {
    id: '1',
    course: 'MBI807B',
    title: 'Machine Learning Fundamentals',
    dueDate: '2024-11-15',
    progress: 65,
    status: 'In Progress',
    weight: 25,
    notes: 'Required submission format: PDF. Ensure all references follow APA 7th edition guidelines. Minimum 3,000 words excluding bibliography. Focused on neural architecture, decision trees, and SVM optimizations.'
  },
  {
    id: '2',
    course: 'PHD102',
    title: 'Ethics in Academic Research',
    dueDate: '2024-10-20',
    progress: 100,
    status: 'Submitted',
    weight: 35,
    notes: 'Deals with the historical background of modern research ethics. Review case studies of famous experiments, institutional review board standards, and proper documentation procedures.'
  },
  {
    id: '3',
    course: 'ENG304',
    title: 'Technical Writing Portfolio',
    dueDate: '2024-12-05',
    progress: 10,
    status: 'Not Started',
    weight: 40,
    notes: 'Drafting user guide documentation. Choose a popular open-source software and document its primary CLI usage instructions. Include screenshots, step-by-step code paths, and diagnostic troubleshooting tables.'
  },
  {
    id: '4',
    course: 'DAT201',
    title: 'Data Structures Final Exam',
    dueDate: '2024-10-01',
    progress: 40,
    status: 'Overdue',
    weight: 30,
    notes: 'Review hash tables, binary search trees, heap structures, and complex time-complexity proofs in Big-O notation. Pay special attention to tree balancing and graph traversal runtimes.'
  },
  {
    id: '5',
    course: 'Advanced Psychology',
    title: 'Cognitive Behavioral Theory Analysis',
    dueDate: '2024-10-24',
    progress: 65,
    status: 'In Progress',
    weight: 35,
    notes: 'Requires deeper research into Piaget\'s stages of development.\n\nPrimary sources found:\n1. "The Origins of Intelligence in Children" (1952)\n2. "JSTOR Article #44921: Mental Growth Models".\n\nDraft due for peer review on Monday.',
    attachmentUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBrpm4GS1MjjGBczFIDeT4q_C4xLSOT3i-BAZ7x048G1_5hIEEEe1WQGlZF6d-VMAJLbV6QiTZQLRytpW-O5Xf9tF2AinyTWfPukA5v38aWandFt4-ggZ4Dm4xyxbZkcjV3aOpHxtPfOs55GBjCp9EzsK8XFz6zsvCqMdrxOv29aoZhKck6kbA7zDPSoJQIIUtycVjZXG-xVbcJrtFIHCToIal8b4ZB7cIXJd8I8QBIRtGF4V5jFSpj-8SC12blgSHlxuI63DYn7QvW',
    attachmentAlt: 'A clean, minimalist workspace top-down view'
  },
  {
    id: '6',
    course: 'ECONOMICS 101',
    title: 'Mid-term Case Study',
    dueDate: '2024-11-14',
    progress: 65,
    status: 'In Progress',
    weight: 15,
    notes: 'Compare modern monetary policy across three developed economies over the last ten years. Draft short sections on aggregate demand, interest rate adjustments, and fiscal stimulus packages.'
  },
  {
    id: '7',
    course: 'COMPUTER SCIENCE',
    title: 'Algorithm Efficiency Quiz',
    dueDate: '2024-11-14',
    progress: 20,
    status: 'In Progress',
    weight: 10,
    notes: 'Focuses on recursive relations, Master Theorem solutions, and inductive state-machine proofs. Memorize recurrence solutions of divide-and-conquer divisions.'
  },
  // Dynamic Month (June 2026) seed data for immediate calendar visualization on boot
  {
    id: '8',
    course: 'CS302',
    title: 'Parallel Computing Lab',
    dueDate: '2026-06-18',
    progress: 100,
    status: 'Submitted',
    weight: 30,
    notes: 'Implement a multi-threaded parallel sorting algorithm using OpenMP or MPI. Record efficiency charts and core core scalability factors.'
  },
  {
    id: '9',
    course: 'DAT305',
    title: 'Database Architecture Exam',
    dueDate: '2026-06-25',
    progress: 65,
    status: 'In Progress',
    weight: 25,
    notes: 'Covers write-ahead logging (WAL), B+Tree structures, transaction isolation boundaries, ACID properties, and query planner query execution costs.'
  },
  {
    id: '10',
    course: 'BUS101',
    title: 'Academic Leadership Seminar',
    dueDate: '2026-06-29',
    progress: 0,
    status: 'Not Started',
    weight: 15,
    notes: 'Prepare a SWOT analysis worksheet matching modern campus organizational challenges. Read chapter 4 on team alignment styles.'
  }
];
