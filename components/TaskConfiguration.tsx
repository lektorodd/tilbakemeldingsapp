'use client';

import React, { useState } from 'react';
import { Task, Subtask } from '@/types';
import { Plus, Trash2, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface TaskConfigurationProps {
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
  availableLabels: string[];
}

export default function TaskConfiguration({ tasks, onTasksChange, availableLabels }: TaskConfigurationProps) {
  const { t } = useLanguage();
  const [showConfig, setShowConfig] = useState(false);

  const addTask = () => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      label: String(tasks.length + 1),
      subtasks: [],
      hasSubtasks: false,
      labels: [],
      category: undefined,
    };
    onTasksChange([...tasks, newTask]);
  };

  const removeTask = (taskId: string) => {
    onTasksChange(tasks.filter(t => t.id !== taskId));
  };

  const updateTaskLabel = (taskId: string, label: string) => {
    onTasksChange(
      tasks.map(t => (t.id === taskId ? { ...t, label } : t))
    );
  };

  const toggleSubtasks = (taskId: string) => {
    onTasksChange(
      tasks.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            hasSubtasks: !t.hasSubtasks,
            subtasks: !t.hasSubtasks ? [{ id: `${taskId}-a`, label: 'a', labels: [], category: undefined }] : [],
          };
        }
        return t;
      })
    );
  };

  const addSubtask = (taskId: string) => {
    onTasksChange(
      tasks.map(t => {
        if (t.id === taskId) {
          const nextLabel = String.fromCharCode(97 + t.subtasks.length); // a, b, c, ...
          return {
            ...t,
            subtasks: [...t.subtasks, { id: `${taskId}-${nextLabel}`, label: nextLabel, labels: [], category: undefined }],
          };
        }
        return t;
      })
    );
  };

  const updateTaskLabels = (taskId: string, labels: string[]) => {
    onTasksChange(
      tasks.map(t => (t.id === taskId ? { ...t, labels } : t))
    );
  };

  const updateTaskCategory = (taskId: string, category: number | undefined) => {
    onTasksChange(
      tasks.map(t => (t.id === taskId ? { ...t, category } : t))
    );
  };

  const updateSubtaskLabels = (taskId: string, subtaskId: string, labels: string[]) => {
    onTasksChange(
      tasks.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            subtasks: t.subtasks.map(st =>
              st.id === subtaskId ? { ...st, labels } : st
            ),
          };
        }
        return t;
      })
    );
  };

  const updateSubtaskCategory = (taskId: string, subtaskId: string, category: number | undefined) => {
    onTasksChange(
      tasks.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            subtasks: t.subtasks.map(st =>
              st.id === subtaskId ? { ...st, category } : st
            ),
          };
        }
        return t;
      })
    );
  };

  const toggleTaskLabel = (taskId: string, label: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newLabels = task.labels.includes(label)
      ? task.labels.filter(l => l !== label)
      : [...task.labels, label];

    updateTaskLabels(taskId, newLabels);
  };

  const toggleSubtaskLabel = (taskId: string, subtaskId: string, label: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const subtask = task.subtasks.find(st => st.id === subtaskId);
    if (!subtask) return;

    const newLabels = subtask.labels.includes(label)
      ? subtask.labels.filter(l => l !== label)
      : [...subtask.labels, label];

    updateSubtaskLabels(taskId, subtaskId, newLabels);
  };

  const removeSubtask = (taskId: string, subtaskId: string) => {
    onTasksChange(
      tasks.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            subtasks: t.subtasks.filter(st => st.id !== subtaskId),
          };
        }
        return t;
      })
    );
  };

  const updateSubtaskLabel = (taskId: string, subtaskId: string, label: string) => {
    onTasksChange(
      tasks.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            subtasks: t.subtasks.map(st =>
              st.id === subtaskId ? { ...st, label } : st
            ),
          };
        }
        return t;
      })
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-text-primary">{t('test.taskStructure')}</h2>
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="px-3 py-1.5 bg-brand text-white rounded-lg hover:bg-brand-hover transition text-sm"
        >
          {showConfig ? t('test.hideDetails') : t('test.showDetails')}
        </button>
      </div>

      {showConfig && (
        <div className="space-y-3">
          {tasks.map(task => (
            <div key={task.id} className="border border-border rounded-lg p-4 bg-surface-alt">
              {/* Compact header with task number, category, subtasks toggle, and delete */}
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-text-secondary">{t('test.taskLabel')}</label>
                  <input
                    type="text"
                    value={task.label}
                    onChange={(e) => updateTaskLabel(task.id, e.target.value)}
                    className="w-16 px-2 py-1 border border-border rounded focus:outline-none focus:ring-2 focus:ring-focus text-text-primary text-sm"
                    placeholder="1"
                  />
                </div>

                {/* Part indicator badge */}
                {task.part && (
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    task.part === 1
                      ? 'bg-orange-100 text-orange-800 border border-orange-300'
                      : 'bg-blue-100 text-blue-800 border border-blue-300'
                  }`}>
                    {task.part === 1 ? 'Part 1' : 'Part 2'}
                  </span>
                )}

                {!task.hasSubtasks && (
                  <>
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium text-text-secondary">{t('test.categoryLabel')}</label>
                      <select
                        value={task.category || ''}
                        onChange={(e) => updateTaskCategory(task.id, e.target.value ? Number(e.target.value) : undefined)}
                        className="px-2 py-1 border border-border rounded focus:outline-none focus:ring-2 focus:ring-focus text-text-primary text-sm"
                      >
                        <option value="">-</option>
                        <option value="1">1 - {t('test.category1Short')}</option>
                        <option value="2">2 - {t('test.category2Short')}</option>
                        <option value="3">3 - {t('test.category3Short')}</option>
                      </select>
                    </div>
                    {/* Category tag */}
                    {task.category && (
                      <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                        {t(`test.category${task.category}Short`)}
                      </span>
                    )}
                  </>
                )}

                <label className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={task.hasSubtasks}
                    onChange={() => toggleSubtasks(task.id)}
                    className="w-4 h-4 text-brand rounded focus:ring-2 focus:ring-focus"
                  />
                  <span className="text-xs text-text-secondary">{t('test.subtasksCheckbox')}</span>
                </label>

                <button
                  onClick={() => removeTask(task.id)}
                  className="ml-auto p-1.5 text-danger hover:bg-red-50 rounded transition"
                  title={t('test.removeTask')}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Task Theme Labels - only shown if NO subtasks */}
              {!task.hasSubtasks && availableLabels.length > 0 && (
                <div className="flex items-start gap-2">
                  <label className="text-xs font-medium text-text-secondary pt-1 min-w-[60px]">{t('test.themesLabel')}</label>
                  <div className="flex flex-wrap gap-1.5">
                    {availableLabels.map(label => (
                      <button
                        key={label}
                        onClick={() => toggleTaskLabel(task.id, label)}
                        className={`px-2 py-0.5 rounded-full text-xs transition ${
                          task.labels.includes(label)
                            ? 'bg-primary-600 text-white'
                            : 'bg-surface text-text-secondary hover:bg-gray-300 border border-border'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {task.hasSubtasks && (
                <div className="ml-4 space-y-2 mt-2 border-l-2 border-border pl-3">
                  {task.subtasks.map(subtask => (
                    <div key={subtask.id} className="border border-border rounded-lg p-3 bg-surface">
                      {/* Compact subtask header */}
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-medium text-text-secondary">{t('test.subtaskLabel')}</label>
                          <input
                            type="text"
                            value={subtask.label}
                            onChange={(e) => updateSubtaskLabel(task.id, subtask.id, e.target.value)}
                            className="w-12 px-2 py-1 border border-border rounded focus:outline-none focus:ring-2 focus:ring-focus text-text-primary text-sm"
                            placeholder="a"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="text-xs font-medium text-text-secondary">{t('test.categoryLabel')}</label>
                          <select
                            value={subtask.category || ''}
                            onChange={(e) => updateSubtaskCategory(task.id, subtask.id, e.target.value ? Number(e.target.value) : undefined)}
                            className="px-2 py-1 border border-border rounded focus:outline-none focus:ring-2 focus:ring-focus text-text-primary text-sm"
                          >
                            <option value="">-</option>
                            <option value="1">1 - {t('test.category1Short')}</option>
                            <option value="2">2 - {t('test.category2Short')}</option>
                            <option value="3">3 - {t('test.category3Short')}</option>
                          </select>
                        </div>

                        {/* Category tag for subtask */}
                        {subtask.category && (
                          <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                            {t(`test.category${subtask.category}Short`)}
                          </span>
                        )}

                        <button
                          onClick={() => removeSubtask(task.id, subtask.id)}
                          className="ml-auto p-1 text-danger hover:bg-red-50 rounded transition"
                          title={t('test.removeSubtask')}
                        >
                          <X size={14} />
                        </button>
                      </div>

                      {/* Subtask Theme Labels */}
                      {availableLabels.length > 0 && (
                        <div className="flex items-start gap-2">
                          <label className="text-xs font-medium text-text-secondary pt-1 min-w-[60px]">{t('test.themesLabel')}</label>
                          <div className="flex flex-wrap gap-1.5">
                            {availableLabels.map(label => (
                              <button
                                key={label}
                                onClick={() => toggleSubtaskLabel(task.id, subtask.id, label)}
                                className={`px-2 py-0.5 rounded-full text-xs transition ${
                                  subtask.labels.includes(label)
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-white text-text-secondary hover:bg-gray-200 border border-border'
                                }`}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addSubtask(task.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-brand hover:bg-primary-50 rounded-lg transition"
                  >
                    <Plus size={14} />
                    {t('test.addSubtaskButton')}
                  </button>
                </div>
              )}
            </div>
          ))}

          <button
            onClick={addTask}
            className="flex items-center gap-2 px-4 py-2 bg-success text-white rounded-lg hover:bg-emerald-700 transition"
          >
            <Plus size={18} />
            {t('test.addTaskButton')}
          </button>
        </div>
      )}

      {!showConfig && (
        <div className="text-sm text-text-secondary bg-surface-alt px-4 py-3 rounded-lg">
          <span className="font-medium">Tasks: </span>
          {tasks.map(t => {
            if (t.hasSubtasks) {
              return t.subtasks.map(st => `${t.label}${st.label}`).join(', ');
            }
            return t.label;
          }).join(', ')}
        </div>
      )}
    </div>
  );
}
