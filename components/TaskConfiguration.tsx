'use client';

import React, { useState } from 'react';
import { Task, Subtask } from '@/types';
import { Plus, Trash2, X } from 'lucide-react';

interface TaskConfigurationProps {
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
}

export default function TaskConfiguration({ tasks, onTasksChange }: TaskConfigurationProps) {
  const [showConfig, setShowConfig] = useState(false);

  const addTask = () => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      label: String(tasks.length + 1),
      subtasks: [],
      hasSubtasks: false,
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
            subtasks: !t.hasSubtasks ? [{ id: `${taskId}-a`, label: 'a' }] : [],
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
            subtasks: [...t.subtasks, { id: `${taskId}-${nextLabel}`, label: nextLabel }],
          };
        }
        return t;
      })
    );
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
                <label className="text-sm font-medium text-gray-700">Task Label:</label>
                <input
                  type="text"
                  value={task.label}
                  onChange={(e) => updateTaskLabel(task.id, e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

              {task.hasSubtasks && (
                <div className="ml-6 space-y-2">
                  {task.subtasks.map(subtask => (
                    <div key={subtask.id} className="flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700">Subtask:</label>
                      <input
                        type="text"
                        value={subtask.label}
                        onChange={(e) => updateSubtaskLabel(task.id, subtask.id, e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., a, b, c"
                      />
                      <button
                        onClick={() => removeSubtask(task.id, subtask.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded-md transition"
                      >
                        <X size={16} />
                      </button>
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
