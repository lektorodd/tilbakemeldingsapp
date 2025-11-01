'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FeedbackSnippet } from '@/types';
import { BookmarkPlus, Trash2, Plus, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface SnippetPickerProps {
  snippets: FeedbackSnippet[];
  onInsert: (text: string) => void;
  onAddSnippet?: (text: string, category?: FeedbackSnippet['category']) => void;
  onDeleteSnippet?: (id: string) => void;
  isTestSpecific?: boolean;
}

export default function SnippetPicker({
  snippets,
  onInsert,
  onAddSnippet,
  onDeleteSnippet,
  isTestSpecific = false,
}: SnippetPickerProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSnippetText, setNewSnippetText] = useState('');
  const [filter, setFilter] = useState<'all' | 'standard' | 'encouragement' | 'error' | 'custom'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleInsert = (snippet: FeedbackSnippet) => {
    onInsert(snippet.text);
    setIsOpen(false);
  };

  const handleAddSnippet = () => {
    if (newSnippetText.trim() && onAddSnippet) {
      onAddSnippet(newSnippetText.trim(), 'custom');
      setNewSnippetText('');
      setShowAddForm(false);
    }
  };

  const filteredSnippets = filter === 'all'
    ? snippets
    : snippets.filter(s => s.category === filter);

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'standard': return 'bg-stone-100 text-stone-700';
      case 'encouragement': return 'bg-emerald-100 text-emerald-700';
      case 'error': return 'bg-rose-100 text-brand-hover';
      case 'custom': return 'bg-violet-100 text-violet-700';
      default: return 'bg-stone-100 text-stone-700';
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-3 py-1.5 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors text-sm"
        title={t('test.snippets')}
      >
        <BookmarkPlus size={16} />
        <span className="hidden sm:inline">Snøggtekst</span>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-80 bg-surface rounded-lg shadow-xl border-2 border-violet-200 max-h-96 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-3 border-b border-border bg-violet-50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-text-primary flex items-center gap-2">
                <BookmarkPlus size={18} className="text-brand" />
                Snøggtekstar
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-violet-100 rounded transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Filter buttons */}
            <div className="flex gap-1 flex-wrap">
              <button
                onClick={() => setFilter('all')}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  filter === 'all' ? 'bg-brand text-white' : 'bg-surface text-text-secondary hover:bg-violet-100'
                }`}
              >
                Alle ({snippets.length})
              </button>
              <button
                onClick={() => setFilter('standard')}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  filter === 'standard' ? 'bg-stone-600 text-white' : 'bg-surface text-text-secondary hover:bg-stone-100'
                }`}
              >
                Standard
              </button>
              <button
                onClick={() => setFilter('encouragement')}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  filter === 'encouragement' ? 'bg-success text-white' : 'bg-surface text-text-secondary hover:bg-emerald-100'
                }`}
              >
                Oppmuntrande
              </button>
              <button
                onClick={() => setFilter('error')}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  filter === 'error' ? 'bg-brand text-white' : 'bg-surface text-text-secondary hover:bg-rose-100'
                }`}
              >
                Feil
              </button>
            </div>
          </div>

          {/* Snippet list */}
          <div className="overflow-y-auto flex-1 p-2">
            {filteredSnippets.length === 0 ? (
              <p className="text-sm text-text-disabled text-center py-4">
                Ingen snøggtekstar å vise
              </p>
            ) : (
              <div className="space-y-1">
                {filteredSnippets.map(snippet => (
                  <div
                    key={snippet.id}
                    className="group flex items-center gap-2 p-2 hover:bg-background rounded-lg transition"
                  >
                    <button
                      onClick={() => handleInsert(snippet)}
                      className="flex-1 text-left text-sm text-text-primary hover:text-brand transition"
                    >
                      <span className={`inline-block px-2 py-0.5 rounded text-xs mr-2 ${getCategoryColor(snippet.category)}`}>
                        {snippet.category || 'standard'}
                      </span>
                      {snippet.text}
                    </button>
                    {onDeleteSnippet && snippet.category === 'custom' && (
                      <button
                        onClick={() => onDeleteSnippet(snippet.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-danger hover:bg-red-50 rounded transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add new snippet form */}
          {onAddSnippet && (
            <div className="p-3 border-t border-border bg-stone-50">
              {showAddForm ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newSnippetText}
                    onChange={(e) => setNewSnippetText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddSnippet();
                      if (e.key === 'Escape') setShowAddForm(false);
                    }}
                    placeholder="Skriv inn ny snøggtekst..."
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm text-text-primary"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddSnippet}
                      className="flex-1 px-3 py-1.5 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors text-sm"
                    >
                      Legg til
                    </button>
                    <button
                      onClick={() => {
                        setShowAddForm(false);
                        setNewSnippetText('');
                      }}
                      className="px-3 py-1.5 bg-stone-300 text-text-secondary rounded-lg hover:bg-stone-400 transition-colors text-sm"
                    >
                      Avbryt
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-violet-100 text-violet-700 rounded-lg hover:bg-violet-200 transition-colors text-sm"
                >
                  <Plus size={16} />
                  Lag ny snøggtekst
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
