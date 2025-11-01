import { FeedbackSnippet } from '@/types';

const GLOBAL_SNIPPETS_KEY = 'math-feedback-global-snippets';

// Default Norwegian standard snippets
const DEFAULT_SNIPPETS: FeedbackSnippet[] = [
  {
    id: 'default-1',
    text: 'Sjå løysingsforslaget',
    category: 'standard',
    createdDate: new Date().toISOString(),
  },
  {
    id: 'default-2',
    text: 'Kvifor blir det slik?',
    category: 'standard',
    createdDate: new Date().toISOString(),
  },
  {
    id: 'default-3',
    text: 'Sikker?',
    category: 'standard',
    createdDate: new Date().toISOString(),
  },
  {
    id: 'default-4',
    text: 'Bra jobba!',
    category: 'encouragement',
    createdDate: new Date().toISOString(),
  },
  {
    id: 'default-5',
    text: 'Godt forklart!',
    category: 'encouragement',
    createdDate: new Date().toISOString(),
  },
  {
    id: 'default-6',
    text: 'Husk å vise mellomrekningar.',
    category: 'standard',
    createdDate: new Date().toISOString(),
  },
  {
    id: 'default-7',
    text: 'Korrekt svar, men manglar utrekning.',
    category: 'error',
    createdDate: new Date().toISOString(),
  },
  {
    id: 'default-8',
    text: 'Små reknefeile.',
    category: 'error',
    createdDate: new Date().toISOString(),
  },
  {
    id: 'default-9',
    text: 'Ikkje heilt ferdig.',
    category: 'standard',
    createdDate: new Date().toISOString(),
  },
  {
    id: 'default-10',
    text: 'Sjekk einingar.',
    category: 'error',
    createdDate: new Date().toISOString(),
  },
];

/**
 * Load global snippets from localStorage
 */
export function loadGlobalSnippets(): FeedbackSnippet[] {
  if (typeof window === 'undefined') return DEFAULT_SNIPPETS;

  try {
    const stored = localStorage.getItem(GLOBAL_SNIPPETS_KEY);
    if (!stored) {
      // First time - save defaults
      saveGlobalSnippets(DEFAULT_SNIPPETS);
      return DEFAULT_SNIPPETS;
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load global snippets:', error);
    return DEFAULT_SNIPPETS;
  }
}

/**
 * Save global snippets to localStorage
 */
export function saveGlobalSnippets(snippets: FeedbackSnippet[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(GLOBAL_SNIPPETS_KEY, JSON.stringify(snippets));
  } catch (error) {
    console.error('Failed to save global snippets:', error);
  }
}

/**
 * Add a new global snippet
 */
export function addGlobalSnippet(text: string, category?: FeedbackSnippet['category']): FeedbackSnippet {
  const snippets = loadGlobalSnippets();
  const newSnippet: FeedbackSnippet = {
    id: `snippet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    text,
    category: category || 'custom',
    createdDate: new Date().toISOString(),
  };

  snippets.push(newSnippet);
  saveGlobalSnippets(snippets);
  return newSnippet;
}

/**
 * Delete a global snippet by ID
 */
export function deleteGlobalSnippet(snippetId: string): void {
  const snippets = loadGlobalSnippets();
  const filtered = snippets.filter(s => s.id !== snippetId);
  saveGlobalSnippets(filtered);
}

/**
 * Update a global snippet
 */
export function updateGlobalSnippet(snippetId: string, text: string, category?: FeedbackSnippet['category']): void {
  const snippets = loadGlobalSnippets();
  const index = snippets.findIndex(s => s.id === snippetId);

  if (index !== -1) {
    snippets[index] = {
      ...snippets[index],
      text,
      category: category || snippets[index].category,
    };
    saveGlobalSnippets(snippets);
  }
}

/**
 * Get all snippets for a test (global + test-specific)
 */
export function getAllSnippetsForTest(testSnippets?: FeedbackSnippet[]): FeedbackSnippet[] {
  const global = loadGlobalSnippets();
  const testSpecific = testSnippets || [];

  return [...global, ...testSpecific];
}

/**
 * Add snippet from selected text
 */
export function createSnippetFromSelection(
  selectedText: string,
  category?: FeedbackSnippet['category']
): FeedbackSnippet | null {
  const trimmed = selectedText.trim();
  if (!trimmed) return null;

  return addGlobalSnippet(trimmed, category);
}
