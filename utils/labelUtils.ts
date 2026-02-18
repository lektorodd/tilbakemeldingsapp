/**
 * Utility functions for hierarchical label grouping.
 *
 * Labels use `/` as a delimiter to denote hierarchy, e.g.:
 *   "sannsyn/grunnleggande" → parent: "sannsyn", child: "grunnleggande"
 *   "algebra"               → parent: null (ungrouped)
 */

export interface LabelGroup {
    parent: string | null;   // null = ungrouped flat labels
    children: string[];      // Full label strings (e.g. "sannsyn/grunnleggande")
}

/** Get the parent portion of a label, or null if flat. */
export function getParentLabel(label: string): string | null {
    const idx = label.indexOf('/');
    return idx > 0 ? label.substring(0, idx) : null;
}

/** Get the child portion of a label (after `/`), or the full label if flat. */
export function getChildLabel(label: string): string {
    const idx = label.indexOf('/');
    return idx > 0 ? label.substring(idx + 1) : label;
}

/** Display-friendly version: shows just the child portion. */
export function formatLabelDisplay(label: string): string {
    return getChildLabel(label);
}

/**
 * Group an array of labels by their parent.
 * Ungrouped labels (no `/`) are placed in a group with parent === null.
 * Groups are sorted: ungrouped first, then alphabetically by parent.
 * Children within each group are sorted alphabetically.
 */
export function groupLabelsByParent(labels: string[]): LabelGroup[] {
    const map = new Map<string | null, string[]>();

    for (const label of labels) {
        const parent = getParentLabel(label);
        if (!map.has(parent)) {
            map.set(parent, []);
        }
        map.get(parent)!.push(label);
    }

    // Sort children within each group
    for (const children of map.values()) {
        children.sort((a, b) => a.localeCompare(b));
    }

    // Build sorted array: ungrouped (null) first, then alphabetical parents
    const groups: LabelGroup[] = [];
    const ungrouped = map.get(null);
    if (ungrouped) {
        groups.push({ parent: null, children: ungrouped });
    }

    const parentKeys = Array.from(map.keys())
        .filter((k): k is string => k !== null)
        .sort((a, b) => a.localeCompare(b));

    for (const parent of parentKeys) {
        groups.push({ parent, children: map.get(parent)! });
    }

    return groups;
}
