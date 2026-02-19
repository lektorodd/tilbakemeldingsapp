import { FeedbackSnippet } from '@/types';
import { isFolderConnected, saveSnippetsToFolder } from './folderSync';

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
  // Default Typst math snippets
  {
    id: 'math-v2-1',
    text: '$( ) / ( )$',
    category: 'math',
    createdDate: new Date().toISOString(),
  },
  {
    id: 'math-v2-2',
    text: '$sqrt(x)$',
    category: 'math',
    createdDate: new Date().toISOString(),
  },
  {
    id: 'math-v2-3',
    text: '$x^2$',
    category: 'math',
    createdDate: new Date().toISOString(),
  },
  {
    id: 'math-v2-4',
    text: '$lim_(x -> a) f(x)$',
    category: 'math',
    createdDate: new Date().toISOString(),
  },
  {
    id: 'math-v2-5',
    text: '$integral_a^b f(x) dif x$',
    category: 'math',
    createdDate: new Date().toISOString(),
  },
  {
    id: 'math-v2-6',
    text: '$sum_(i=1)^n i$',
    category: 'math',
    createdDate: new Date().toISOString(),
  },
  {
    id: 'math-v2-7',
    text: '$binom(n, k)$',
    category: 'math',
    createdDate: new Date().toISOString(),
  },
  {
    id: 'math-v2-8',
    text: '$cases(x &"if" x >= 0, -x &"if" x < 0)$',
    category: 'math',
    createdDate: new Date().toISOString(),
  },
  {
    id: 'math-v2-9',
    text: '$log_a (x)$',
    category: 'math',
    createdDate: new Date().toISOString(),
  },
  {
    id: 'math-v2-10',
    text: '$=>$',
    category: 'math',
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
    const snippets: FeedbackSnippet[] = JSON.parse(stored);

    // Migrate: add/update default math snippets
    const hasV2Math = snippets.some(s => s.id?.startsWith('math-v2-'));
    if (!hasV2Math) {
      // Remove old v1 math snippets if present
      const withoutOldMath = snippets.filter(s => !s.id?.startsWith('math-'));
      const mathDefaults = DEFAULT_SNIPPETS.filter(s => s.category === 'math');
      const merged = [...withoutOldMath, ...mathDefaults];
      saveGlobalSnippets(merged);
      return merged;
    }

    return snippets;
  } catch (error) {
    console.error('Failed to load global snippets:', error);
    return DEFAULT_SNIPPETS;
  }
}

/**
 * Save global snippets to localStorage (and folder if connected)
 */
export function saveGlobalSnippets(snippets: FeedbackSnippet[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(GLOBAL_SNIPPETS_KEY, JSON.stringify(snippets));
  } catch (error) {
    console.error('Failed to save global snippets:', error);
  }

  // Sync to connected folder
  if (isFolderConnected()) {
    saveSnippetsToFolder(snippets);
  }
}

/**
 * Sync snippets from connected folder into localStorage.
 * Call on startup after folder sync is initialized.
 */
export async function syncSnippetsFromFolder(): Promise<boolean> {
  const { loadSnippetsFromFolder } = await import('./folderSync');
  const snippets = await loadSnippetsFromFolder();
  if (snippets === null) return false;

  if (typeof window !== 'undefined') {
    localStorage.setItem(GLOBAL_SNIPPETS_KEY, JSON.stringify(snippets));
  }
  return true;
}

/**
 * Migrate existing snippets to connected folder.
 */
export async function migrateSnippetsToFolder(): Promise<void> {
  const snippets = loadGlobalSnippets();
  if (isFolderConnected()) {
    await saveSnippetsToFolder(snippets);
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
