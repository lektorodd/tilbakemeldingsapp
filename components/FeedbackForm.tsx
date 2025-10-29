'use client';

import React from 'react';
import { Task, TaskFeedback } from '@/types';

interface FeedbackFormProps {
  tasks: Task[];
  feedbacks: TaskFeedback[];
  onFeedbackChange: (feedbacks: TaskFeedback[]) => void;
}

export default function FeedbackForm({ tasks, feedbacks, onFeedbackChange }: FeedbackFormProps) {
  const getTaskLabel = (task: Task, subtask?: { id: string; label: string }) => {
    return subtask ? `${task.label}${subtask.label}` : task.label;
  };

  const getFeedback = (taskId: string, subtaskId?: string): TaskFeedback => {
    const existing = feedbacks.find(
      f => f.taskId === taskId && f.subtaskId === subtaskId
    );
    return existing || { taskId, subtaskId, points: 0, comment: '' };
  };

  const updateFeedback = (taskId: string, subtaskId: string | undefined, updates: Partial<TaskFeedback>) => {
    const existingIndex = feedbacks.findIndex(
      f => f.taskId === taskId && f.subtaskId === subtaskId
    );

    let newFeedbacks: TaskFeedback[];
    if (existingIndex >= 0) {
      newFeedbacks = [...feedbacks];
      newFeedbacks[existingIndex] = { ...newFeedbacks[existingIndex], ...updates };
    } else {
      newFeedbacks = [...feedbacks, { taskId, subtaskId, points: 0, comment: '', ...updates }];
    }

    onFeedbackChange(newFeedbacks);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Task Feedback</h2>
      <div className="space-y-6">
        {tasks.map(task => (
          <div key={task.id}>
            {task.hasSubtasks ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Task {task.label}</h3>
                {task.subtasks.map(subtask => {
                  const feedback = getFeedback(task.id, subtask.id);
                  return (
                    <div key={subtask.id} className="ml-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center gap-4 mb-3">
                        <label className="font-medium text-gray-700 min-w-[60px]">
                          {getTaskLabel(task, subtask)}:
                        </label>
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-600">Points:</label>
                          <select
                            value={feedback.points}
                            onChange={(e) =>
                              updateFeedback(task.id, subtask.id, { points: Number(e.target.value) })
                            }
                            className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {[0, 1, 2, 3, 4, 5, 6].map(p => (
                              <option key={p} value={p}>{p}</option>
                            ))}
                          </select>
                          <span className="text-sm text-gray-600">/ 6</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Comment (Typst math supported):
                        </label>
                        <textarea
                          value={feedback.comment}
                          onChange={(e) =>
                            updateFeedback(task.id, subtask.id, { comment: e.target.value })
                          }
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                          placeholder="e.g., Good work! You found $x = 5$"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                {(() => {
                  const feedback = getFeedback(task.id, undefined);
                  return (
                    <>
                      <div className="flex items-center gap-4 mb-3">
                        <label className="font-medium text-gray-700 min-w-[60px]">
                          Task {task.label}:
                        </label>
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-600">Points:</label>
                          <select
                            value={feedback.points}
                            onChange={(e) =>
                              updateFeedback(task.id, undefined, { points: Number(e.target.value) })
                            }
                            className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {[0, 1, 2, 3, 4, 5, 6].map(p => (
                              <option key={p} value={p}>{p}</option>
                            ))}
                          </select>
                          <span className="text-sm text-gray-600">/ 6</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Comment (Typst math supported):
                        </label>
                        <textarea
                          value={feedback.comment}
                          onChange={(e) =>
                            updateFeedback(task.id, undefined, { comment: e.target.value })
                          }
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                          placeholder="e.g., Excellent solution! The integral $integral x^2 d x = x^3/3 + C$ is correct."
                        />
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
