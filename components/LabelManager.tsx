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
    <div className="bg-surface rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Tag size={20} className="text-brand" />
          <h3 className="text-lg font-semibold text-text-primary">Course Labels</h3>
        </div>
        <button
          onClick={() => setShowAddLabel(!showAddLabel)}
          className="flex items-center gap-1 px-3 py-1 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors text-sm"
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
            className="flex-1 px-3 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-text-primary"
            placeholder="e.g., logarithms, fractions, equations"
            autoFocus
          />
          <button
            onClick={handleAddLabel}
            className="px-3 py-1.5 bg-success text-white rounded-lg hover:hover:bg-emerald-700 transition-colors text-sm"
          >
            Add
          </button>
          <button
            onClick={() => {
              setShowAddLabel(false);
              setNewLabel('');
            }}
            className="px-3 py-1.5 bg-gray-300 text-text-secondary rounded-lg hover:bg-gray-400 transition-colors text-sm"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {labels.length === 0 ? (
          <p className="text-sm text-text-disabled">No labels yet. Add labels to categorize tasks by theme/skill.</p>
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

      <p className="text-xs text-text-secondary mt-3">
        Labels help you track student performance across themes (e.g., "fractions", "logarithms"). Add multiple labels to tasks that cover multiple topics.
      </p>
    </div>
  );
}
