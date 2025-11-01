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
      case 'error': return 'bg-rose-100 text-rose-700';
      case 'custom': return 'bg-violet-100 text-violet-700';
      default: return 'bg-stone-100 text-stone-700';
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-3 py-1.5 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition text-sm"
        title={t('test.snippets')}
      >
        <BookmarkPlus size={16} />
        <span className="hidden sm:inline">Snøggtekst</span>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-80 bg-white rounded-lg shadow-xl border-2 border-violet-200 max-h-96 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-3 border-b border-stone-200 bg-violet-50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <BookmarkPlus size={18} className="text-violet-600" />
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
                className={`px-2 py-1 text-xs rounded transition ${
                  filter === 'all' ? 'bg-violet-600 text-white' : 'bg-white text-gray-700 hover:bg-violet-100'
                }`}
              >
                Alle ({snippets.length})
              </button>
              <button
                onClick={() => setFilter('standard')}
                className={`px-2 py-1 text-xs rounded transition ${
                  filter === 'standard' ? 'bg-stone-600 text-white' : 'bg-white text-gray-700 hover:bg-stone-100'
                }`}
              >
                Standard
              </button>
              <button
                onClick={() => setFilter('encouragement')}
                className={`px-2 py-1 text-xs rounded transition ${
                  filter === 'encouragement' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700 hover:bg-emerald-100'
                }`}
              >
                Oppmuntrande
              </button>
              <button
                onClick={() => setFilter('error')}
                className={`px-2 py-1 text-xs rounded transition ${
                  filter === 'error' ? 'bg-rose-600 text-white' : 'bg-white text-gray-700 hover:bg-rose-100'
                }`}
              >
                Feil
              </button>
            </div>
          </div>

          {/* Snippet list */}
          <div className="overflow-y-auto flex-1 p-2">
            {filteredSnippets.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Ingen snøggtekstar å vise
              </p>
            ) : (
              <div className="space-y-1">
                {filteredSnippets.map(snippet => (
                  <div
                    key={snippet.id}
                    className="group flex items-center gap-2 p-2 hover:bg-amber-50 rounded-md transition"
                  >
                    <button
                      onClick={() => handleInsert(snippet)}
                      className="flex-1 text-left text-sm text-gray-800 hover:text-violet-600 transition"
                    >
                      <span className={`inline-block px-2 py-0.5 rounded text-xs mr-2 ${getCategoryColor(snippet.category)}`}>
                        {snippet.category || 'standard'}
                      </span>
                      {snippet.text}
                    </button>
                    {onDeleteSnippet && snippet.category === 'custom' && (
                      <button
                        onClick={() => onDeleteSnippet(snippet.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-red-600 hover:bg-red-50 rounded transition"
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
            <div className="p-3 border-t border-stone-200 bg-stone-50">
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
                    className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm text-gray-900"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddSnippet}
                      className="flex-1 px-3 py-1.5 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition text-sm"
                    >
                      Legg til
                    </button>
                    <button
                      onClick={() => {
                        setShowAddForm(false);
                        setNewSnippetText('');
                      }}
                      className="px-3 py-1.5 bg-stone-300 text-gray-700 rounded-md hover:bg-stone-400 transition text-sm"
                    >
                      Avbryt
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-violet-100 text-violet-700 rounded-md hover:bg-violet-200 transition text-sm"
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
