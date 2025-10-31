'use client';

import React, { useState } from 'react';
import { Task, Subtask } from '@/types';
import { Plus, Trash2, X } from 'lucide-react';

interface TaskConfigurationProps {
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
  availableLabels: string[];
}

export default function TaskConfiguration({ tasks, onTasksChange, availableLabels }: TaskConfigurationProps) {
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
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Task Configuration</h2>
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          {showConfig ? 'Hide' : 'Show'} Config
        </button>
      </div>

      {showConfig && (
        <div className="space-y-4">
          {tasks.map(task => (
            <div key={task.id} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center gap-3 mb-3">
                <label className="text-sm font-medium text-gray-700">Task Number:</label>
                <input
                  type="text"
                  value={task.label}
                  onChange={(e) => updateTaskLabel(task.id, e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="e.g., 1, 2"
                />
                <label className="flex items-center gap-2 ml-4">
                  <input
                    type="checkbox"
                    checked={task.hasSubtasks}
                    onChange={() => toggleSubtasks(task.id)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Has subtasks</span>
                </label>
                <button
                  onClick={() => removeTask(task.id)}
                  className="ml-auto p-2 text-red-600 hover:bg-red-50 rounded-md transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* Task Category */}
              <div className="flex items-center gap-3 mb-3">
                <label className="text-sm font-medium text-gray-700">Category:</label>
                <select
                  value={task.category || ''}
                  onChange={(e) => updateTaskCategory(task.id, e.target.value ? Number(e.target.value) : undefined)}
                  className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="">None</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </select>
              </div>

              {/* Task Theme Labels */}
              {availableLabels.length > 0 && (
                <div className="mb-3">
                  <label className="text-sm font-medium text-gray-700 block mb-2">Theme Labels:</label>
                  <div className="flex flex-wrap gap-2">
                    {availableLabels.map(label => (
                      <button
                        key={label}
                        onClick={() => toggleTaskLabel(task.id, label)}
                        className={`px-3 py-1 rounded-full text-sm transition ${
                          task.labels.includes(label)
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {task.hasSubtasks && (
                <div className="ml-6 space-y-3 mt-3">
                  {task.subtasks.map(subtask => (
                    <div key={subtask.id} className="border border-gray-200 rounded-lg p-3 bg-white">
                      <div className="flex items-center gap-3 mb-2">
                        <label className="text-sm font-medium text-gray-700">Subtask Label:</label>
                        <input
                          type="text"
                          value={subtask.label}
                          onChange={(e) => updateSubtaskLabel(task.id, subtask.id, e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                          placeholder="e.g., a, b, c"
                        />
                        <button
                          onClick={() => removeSubtask(task.id, subtask.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded-md transition"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      {/* Subtask Category */}
                      <div className="flex items-center gap-3 mb-2">
                        <label className="text-sm font-medium text-gray-700">Category:</label>
                        <select
                          value={subtask.category || ''}
                          onChange={(e) => updateSubtaskCategory(task.id, subtask.id, e.target.value ? Number(e.target.value) : undefined)}
                          className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        >
                          <option value="">None</option>
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                        </select>
                      </div>

                      {/* Subtask Theme Labels */}
                      {availableLabels.length > 0 && (
                        <div>
                          <label className="text-sm font-medium text-gray-700 block mb-2">Theme Labels:</label>
                          <div className="flex flex-wrap gap-2">
                            {availableLabels.map(label => (
                              <button
                                key={label}
                                onClick={() => toggleSubtaskLabel(task.id, subtask.id, label)}
                                className={`px-2 py-1 rounded-full text-xs transition ${
                                  subtask.labels.includes(label)
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
                    className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition"
                  >
                    <Plus size={16} />
                    Add Subtask
                  </button>
                </div>
              )}
            </div>
          ))}

          <button
            onClick={addTask}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
          >
            <Plus size={20} />
            Add Task
          </button>
        </div>
      )}

      {!showConfig && (
        <div className="text-sm text-gray-600">
          Current tasks: {tasks.map(t => {
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
