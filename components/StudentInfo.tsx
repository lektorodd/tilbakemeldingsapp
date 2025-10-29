'use client';

import React from 'react';

interface StudentInfoProps {
  studentName: string;
  studentNumber: string;
  generalComment: string;
  individualComment: string;
  onStudentNameChange: (name: string) => void;
  onStudentNumberChange: (number: string) => void;
  onGeneralCommentChange: (comment: string) => void;
  onIndividualCommentChange: (comment: string) => void;
}

export default function StudentInfo({
  studentName,
  studentNumber,
  generalComment,
  individualComment,
  onStudentNameChange,
  onStudentNumberChange,
  onGeneralCommentChange,
  onIndividualCommentChange,
}: StudentInfoProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Student Information</h2>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Student Name:
          </label>
          <input
            type="text"
            value={studentName}
            onChange={(e) => onStudentNameChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter student name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Student Number (optional):
          </label>
          <input
            type="text"
            value={studentNumber}
            onChange={(e) => onStudentNumberChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter student number"
          />
        </div>
      </div>

      <div className="border-t pt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            General Comment (same for all students, Typst math supported):
          </label>
          <textarea
            value={generalComment}
            onChange={(e) => onGeneralCommentChange(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            placeholder="e.g., This test covered topics from chapters 3-5, including $lim_(x arrow infinity)$ and derivatives."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Individual Comment (specific to this student, Typst math supported):
          </label>
          <textarea
            value={individualComment}
            onChange={(e) => onIndividualCommentChange(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            placeholder="e.g., Great progress! Focus on understanding the chain rule: $(f compose g)'(x) = f'(g(x)) dot g'(x)$"
          />
        </div>
      </div>
    </div>
  );
}
