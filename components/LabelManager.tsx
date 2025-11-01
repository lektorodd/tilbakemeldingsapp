'use client';

import React, { useState } from 'react';
import { Plus, X, Tag } from 'lucide-react';

interface LabelManagerProps {
  labels: string[];
  onLabelsChange: (labels: string[]) => void;
}

export default function LabelManager({ labels, onLabelsChange }: LabelManagerProps) {
  const [showAddLabel, setShowAddLabel] = useState(false);
  const [newLabel, setNewLabel] = useState('');

  const handleAddLabel = () => {
    if (!newLabel.trim()) return;

    const trimmed = newLabel.trim().toLowerCase();
    if (labels.includes(trimmed)) {
      alert('This label already exists!');
      return;
    }

    onLabelsChange([...labels, trimmed]);
    setNewLabel('');
    setShowAddLabel(false);
  };

  const handleRemoveLabel = (label: string) => {
    if (confirm(`Remove label "${label}"? This will not remove it from existing tasks.`)) {
      onLabelsChange(labels.filter(l => l !== label));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Tag size={20} className="text-violet-600" />
          <h3 className="text-lg font-semibold text-gray-800">Course Labels</h3>
        </div>
        <button
          onClick={() => setShowAddLabel(!showAddLabel)}
          className="flex items-center gap-1 px-3 py-1 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition text-sm"
        >
          <Plus size={16} />
          Add Label
        </button>
      </div>

      {showAddLabel && (
        <div className="mb-3 flex gap-2">
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddLabel()}
            className="flex-1 px-3 py-1.5 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-gray-900"
            placeholder="e.g., logarithms, fractions, equations"
            autoFocus
          />
          <button
            onClick={handleAddLabel}
            className="px-3 py-1.5 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition text-sm"
          >
            Add
          </button>
          <button
            onClick={() => {
              setShowAddLabel(false);
              setNewLabel('');
            }}
            className="px-3 py-1.5 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition text-sm"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {labels.length === 0 ? (
          <p className="text-sm text-gray-500">No labels yet. Add labels to categorize tasks by theme/skill.</p>
        ) : (
          labels.map(label => (
            <div
              key={label}
              className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
            >
              <span>{label}</span>
              <button
                onClick={() => handleRemoveLabel(label)}
                className="hover:bg-purple-200 rounded-full p-0.5 transition"
              >
                <X size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      <p className="text-xs text-gray-600 mt-3">
        Labels help you track student performance across themes (e.g., "fractions", "logarithms"). Add multiple labels to tasks that cover multiple topics.
      </p>
    </div>
  );
}
