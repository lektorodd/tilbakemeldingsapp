/**
 * Criteria template storage — save/load reusable project criterion sets.
 * Stored in localStorage + synced to folder via the standard folder sync pattern.
 */

import { CriteriaTemplate, ProjectCriterionDef } from '@/types';

const TEMPLATES_KEY = 'math-feedback-criteria-templates';

// ── localStorage CRUD ──

export function loadCriteriaTemplates(): CriteriaTemplate[] {
    try {
        const stored = localStorage.getItem(TEMPLATES_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

export function saveCriteriaTemplates(templates: CriteriaTemplate[]): void {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
}

export function addCriteriaTemplate(name: string, criteria: ProjectCriterionDef[]): CriteriaTemplate {
    const templates = loadCriteriaTemplates();
    // Strip IDs so they get regenerated when loaded into a new project
    const cleanCriteria = criteria.map(c => ({
        ...c,
        id: c.id, // keep original id as reference
    }));
    const template: CriteriaTemplate = {
        id: `tpl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name,
        criteria: cleanCriteria,
        createdDate: new Date().toISOString(),
    };
    templates.push(template);
    saveCriteriaTemplates(templates);
    return template;
}

export function deleteCriteriaTemplate(templateId: string): void {
    const templates = loadCriteriaTemplates().filter(t => t.id !== templateId);
    saveCriteriaTemplates(templates);
}
