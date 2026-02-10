'use client';

import React from 'react';
import { Task, TaskFeedback } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface FeedbackFormProps {
  tasks: Task[];
  feedbacks: TaskFeedback[];
  onFeedbackChange: (feedbacks: TaskFeedback[]) => void;
}

export default function FeedbackForm({ tasks, feedbacks, onFeedbackChange }: FeedbackFormProps) {
  const { t } = useLanguage();

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
    <div className="bg-surface p-6 rounded-lg shadow-sm border border-border">
      <h2 className="text-2xl font-display font-bold text-text-primary mb-6">{t('test.taskFeedbackTitle')}</h2>
      <div className="space-y-6">
        {tasks.map(task => (
          <div key={task.id}>
            {task.hasSubtasks ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-text-secondary mb-2">{t('test.task')} {task.label}</h3>
                {task.subtasks.map(subtask => {
                  const feedback = getFeedback(task.id, subtask.id);
                  return (
                    <div key={subtask.id} className="ml-4 border border-border rounded-lg p-4 bg-surface-alt">
                      <div className="flex items-center gap-4 mb-3">
                        <label className="font-medium text-text-secondary min-w-[60px]">
                          {getTaskLabel(task, subtask)}:
                        </label>
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-text-secondary">{t('test.pointsLabel')}</label>
                          <div className="flex gap-1">
                            {[0, 1, 2, 3, 4, 5, 6].map(p => (
                              <button
                                key={p}
                                type="button"
                                onClick={() => updateFeedback(task.id, subtask.id, { points: p })}
                                className={`w-9 h-9 rounded-lg font-semibold transition-all ${
                                  feedback.points === p
                                    ? 'bg-brand text-white shadow-md scale-110'
                                    : 'bg-surface border border-border text-text-secondary hover:bg-indigo-50 hover:border-brand'
                                }`}
                              >
                                {p}
                              </button>
                            ))}
                          </div>
                          <span className="text-sm text-text-secondary">/ 6</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                          {t('test.commentLabel')}
                        </label>
                        <textarea
                          value={feedback.comment}
                          onChange={(e) =>
                            updateFeedback(task.id, subtask.id, { comment: e.target.value })
                          }
                          rows={3}
                          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-focus font-mono text-sm text-text-primary"
                          placeholder={t('test.commentPlaceholder1')}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="border border-border rounded-lg p-4 bg-surface-alt">
                {(() => {
                  const feedback = getFeedback(task.id, undefined);
                  return (
                    <>
                      <div className="flex items-center gap-4 mb-3">
                        <label className="font-medium text-text-secondary min-w-[60px]">
                          {t('test.task')} {task.label}:
                        </label>
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-text-secondary">{t('test.pointsLabel')}</label>
                          <div className="flex gap-1">
                            {[0, 1, 2, 3, 4, 5, 6].map(p => (
                              <button
                                key={p}
                                type="button"
                                onClick={() => updateFeedback(task.id, undefined, { points: p })}
                                className={`w-9 h-9 rounded-lg font-semibold transition-all ${
                                  feedback.points === p
                                    ? 'bg-brand text-white shadow-md scale-110'
                                    : 'bg-surface border border-border text-text-secondary hover:bg-indigo-50 hover:border-brand'
                                }`}
                              >
                                {p}
                              </button>
                            ))}
                          </div>
                          <span className="text-sm text-text-secondary">/ 6</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                          {t('test.commentLabel')}
                        </label>
                        <textarea
                          value={feedback.comment}
                          onChange={(e) =>
                            updateFeedback(task.id, undefined, { comment: e.target.value })
                          }
                          rows={3}
                          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-focus font-mono text-sm text-text-primary"
                          placeholder={t('test.commentPlaceholder2')}
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
