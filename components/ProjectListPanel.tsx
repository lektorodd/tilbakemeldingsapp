'use client';

import { CourseProject } from '@/types';
import { Plus, Trash2, Edit, FolderOpen } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProjectListPanelProps {
    courseId: string;
    projects: CourseProject[];
    studentCount: number;
    onAddProject: () => void;
    onEditProject: (project: CourseProject) => void;
    onDeleteProject: (projectId: string) => void;
}

export default function ProjectListPanel({
    courseId,
    projects,
    studentCount,
    onAddProject,
    onEditProject,
    onDeleteProject,
}: ProjectListPanelProps) {
    const { t } = useLanguage();

    return (
        <div className="bg-surface rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <FolderOpen size={24} className="text-amber-600" />
                    <h2 className="text-2xl font-display font-bold text-text-primary">{t('course.projects')}</h2>
                    <span className="text-text-secondary">({projects.length})</span>
                </div>
                <button
                    onClick={onAddProject}
                    className="flex items-center gap-1 px-3 py-1 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm"
                >
                    <Plus size={16} />
                    {t('common.add')}
                </button>
            </div>

            <div className="space-y-2">
                {projects.length === 0 ? (
                    <p className="text-sm text-text-disabled text-center py-8">{t('course.noProjectsYet')}</p>
                ) : (
                    [...projects]
                        .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
                        .map(project => {
                            const completedCount = project.studentFeedbacks.filter(f => f.completedDate).length;
                            const isOverdue = new Date(project.deadline) < new Date() && completedCount < studentCount;
                            return (
                                <div
                                    key={project.id}
                                    className="border border-border rounded-lg p-3 hover:bg-background"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <h4 className="font-medium text-text-primary">{project.name}</h4>
                                            {project.description && (
                                                <p className="text-xs text-text-secondary">{project.description}</p>
                                            )}
                                            {project.criteria.length > 0 && (
                                                <p className="text-xs text-amber-600 mt-1">
                                                    {t('project.criteriaCount').replace('{count}', project.criteria.length.toString())}
                                                </p>
                                            )}
                                            <p className={`text-xs mt-1 ${isOverdue ? 'text-danger font-medium' : 'text-text-disabled'}`}>
                                                {t('project.deadline')}: {new Date(project.deadline).toLocaleDateString('nb-NO', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })}
                                                {isOverdue && ` ⚠️`}
                                            </p>
                                            <p className="text-xs text-brand mt-1">
                                                {t('course.completedOf').replace('{completed}', completedCount.toString()).replace('{total}', studentCount.toString())}
                                            </p>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => onEditProject(project)}
                                                className="p-1 text-amber-600 hover:bg-amber-50 rounded transition"
                                            >
                                                <Edit size={14} />
                                            </button>
                                            <button
                                                onClick={() => onDeleteProject(project.id)}
                                                className="p-1 text-danger hover:bg-danger-bg rounded transition"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    <Link
                                        href={`/course/${courseId}/project/${project.id}`}
                                        className="block text-center px-3 py-1 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm"
                                    >
                                        <FolderOpen size={14} className="inline mr-1" />
                                        {t('project.assess')}
                                    </Link>
                                </div>
                            );
                        })
                )}
            </div>
        </div>
    );
}
