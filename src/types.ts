/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AssessmentStatus = 'Not Started' | 'In Progress' | 'Submitted' | 'Overdue';

export interface Assessment {
  id: string;
  course: string;
  title: string;
  dueDate: string; // YYYY-MM-DD
  progress: number; // 0 to 100
  status: AssessmentStatus;
  weight?: number; // weight percentage (e.g. 25%)
  notes?: string; // study notes
  attachmentUrl?: string; // photo/thumbnail reference url
  attachmentAlt?: string; // image alt description
}
