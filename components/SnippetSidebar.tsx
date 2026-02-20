'use client';

import { FeedbackSnippet } from '@/types';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface SnippetSidebarProps {
  snippets: FeedbackSnippet[];
  activeSubtask: { taskId: string; subtaskId?: string } | null;
  snippetFilter: 'all' | 'standard' | 'encouragement' | 'error' | 'custom' | 'math';
  onFilterChange: (filter: 'all' | 'standard' | 'encouragement' | 'error' | 'custom' | 'math') => void;
  onInsertSnippet: (text: string) => void;
  onAddSnippet: (text: string, category?: FeedbackSnippet['category']) => void;
  onDeleteSnippet: (id: string) => void;
}

export default function SnippetSidebar({
  snippets,
  activeSubtask,
  snippetFilter,
  onFilterChange,
  onInsertSnippet,
  onAddSnippet,
  onDeleteSnippet,
}: SnippetSidebarProps) {
  const { t } = useLanguage();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newText, setNewText] = useState('');

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'standard': return 'bg-surface-alt text-text-secondary';
      case 'encouragement': return 'bg-emerald-100 text-emerald-700';
      case 'error': return 'bg-rose-100 text-rose-700';
      case 'custom': return 'bg-primary-100 text-primary-700';
      case 'math': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-surface-alt text-text-secondary';
    }
  };

  const handleAdd = () => {
    if (newText.trim()) {
      onAddSnippet(newText.trim(), 'custom');
      setNewText('');
      setShowAddForm(false);
    }
  };

  const filteredSnippets = snippetFilter === 'all'
    ? snippets
    : snippets.filter(s => s.category === snippetFilter);

  return (
    <div className="w-80 flex-shrink-0">
      <div className="sticky top-4 bg-surface rounded-lg shadow-sm border border-border h-[calc(100vh-120px)] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border flex-shrink-0">
          <h4 className="text-lg font-display font-semibold text-text-primary mb-3">
            {t('test.snippetsTitle')}
          </h4>
          {activeSubtask && (
            <>
              <p className="text-xs text-text-secondary mb-3">
                {t('test.snippetsDesc')}
              </p>
              <div className="flex gap-1 flex-wrap">
                <button
                  onClick={() => onFilterChange('all')}
                  className={`px-2 py-1 text-xs rounded transition-colors ${snippetFilter === 'all' ? 'bg-brand text-white' : 'bg-surface-alt text-text-secondary hover:bg-surface-alt'
                    }`}
                >
                  {t('common.all')} ({snippets.length})
                </button>
                <button
                  onClick={() => onFilterChange('standard')}
                  className={`px-2 py-1 text-xs rounded transition-colors ${snippetFilter === 'standard' ? 'bg-neutral-600 text-white' : 'bg-surface-alt text-text-secondary hover:bg-surface-alt'
                    }`}
                >
                  Standard
                </button>
                <button
                  onClick={() => onFilterChange('encouragement')}
                  className={`px-2 py-1 text-xs rounded transition-colors ${snippetFilter === 'encouragement' ? 'bg-success text-white' : 'bg-surface-alt text-text-secondary hover:bg-surface-alt'
                    }`}
                >
                  {t('snippets.encouragement') || 'Oppmuntrande'}
                </button>
                <button
                  onClick={() => onFilterChange('error')}
                  className={`px-2 py-1 text-xs rounded transition-colors ${snippetFilter === 'error' ? 'bg-danger text-white' : 'bg-surface-alt text-text-secondary hover:bg-surface-alt'
                    }`}
                >
                  {t('snippets.error') || 'Feil'}
                </button>
                <button
                  onClick={() => onFilterChange('math')}
                  className={`px-2 py-1 text-xs rounded transition-colors ${snippetFilter === 'math' ? 'bg-emerald-600 text-white' : 'bg-surface-alt text-text-secondary hover:bg-surface-alt'
                    }`}
                >
                  {t('snippets.math') || 'Typst-matte'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Snippet list */}
        <div className="flex-1 overflow-y-auto min-h-0 p-2">
          {!activeSubtask ? (
            <p className="text-sm text-text-disabled text-center py-8">
              {t('test.snippetsClickTextarea')}
            </p>
          ) : filteredSnippets.length === 0 ? (
            <p className="text-sm text-text-disabled text-center py-4">
              {t('snippets.noSnippets') || 'Ingen snøggtekstar å vise'}
            </p>
          ) : (
            <div className="space-y-1">
              {filteredSnippets.map(snippet => (
                <div
                  key={snippet.id}
                  className="group flex items-center gap-2 p-2 hover:bg-surface-alt rounded-lg transition-colors"
                >
                  <button
                    onClick={() => onInsertSnippet(snippet.text)}
                    className="flex-1 text-left text-sm text-text-primary hover:text-brand transition-colors"
                  >
                    <span className={`inline-block px-2 py-0.5 rounded text-xs mr-2 ${getCategoryColor(snippet.category)}`}>
                      {snippet.category || 'standard'}
                    </span>
                    {snippet.text}
                  </button>
                  {snippet.category === 'custom' && (
                    <button
                      onClick={() => onDeleteSnippet(snippet.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-danger hover:bg-danger-bg rounded transition-opacity"
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
        {activeSubtask && (
          <div className="p-3 border-t border-border bg-surface-alt flex-shrink-0">
            {showAddForm ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAdd();
                    if (e.key === 'Escape') setShowAddForm(false);
                  }}
                  placeholder={t('snippets.addPlaceholder') || 'Skriv inn ny snøggtekst...'}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand text-sm text-text-primary"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAdd}
                    className="flex-1 px-3 py-1.5 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors text-sm"
                  >
                    {t('common.add')}
                  </button>
                  <button
                    onClick={() => { setShowAddForm(false); setNewText(''); }}
                    className="px-3 py-1.5 bg-surface-alt text-text-secondary rounded-lg hover:bg-border transition-colors text-sm"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors text-sm"
              >
                <Plus size={16} />
                {t('snippets.addNew') || 'Lag ny snøggtekst'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
