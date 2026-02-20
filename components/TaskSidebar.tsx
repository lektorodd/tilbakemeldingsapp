'use client';

import { Task } from '@/types';
import { TaskSlot } from '@/hooks/useGradingShortcuts';
import { useLanguage } from '@/contexts/LanguageContext';

interface TaskStats {
  avgScore: number;
  gradedCount: number;
  totalStudents: number;
}

interface TaskSidebarProps {
  tasks: Task[];
  activeTaskSlot: TaskSlot;
  onSelectTask: (slot: TaskSlot) => void;
  taskStats: Map<string, TaskStats>;
  hasTwoParts?: boolean;
}

function getTaskSlotKey(slot: TaskSlot): string {
  return `${slot.taskId}-${slot.subtaskId || 'main'}`;
}

function getScoreColor(score: number): string {
  if (score >= 5) return 'text-emerald-700 font-bold';
  if (score >= 4) return 'text-emerald-600';
  if (score >= 3) return 'text-amber-600';
  if (score >= 2) return 'text-orange-600';
  return 'text-rose-600';
}

export default function TaskSidebar({ tasks, activeTaskSlot, onSelectTask, taskStats, hasTwoParts }: TaskSidebarProps) {
  const { t } = useLanguage();

  // Build flat list of task slots
  const slots: Array<{ slot: TaskSlot; label: string; part?: 1 | 2; isPartHeader?: boolean; partNumber?: number }> = [];
  let lastPart: number | undefined = undefined;

  tasks.forEach(task => {
    // Add part header if needed
    if (hasTwoParts && task.part && task.part !== lastPart) {
      slots.push({ slot: { taskId: '', subtaskId: undefined }, label: '', isPartHeader: true, partNumber: task.part });
      lastPart = task.part;
    }

    if (task.hasSubtasks && task.subtasks.length > 0) {
      task.subtasks.forEach(subtask => {
        slots.push({
          slot: { taskId: task.id, subtaskId: subtask.id },
          label: `${task.label}${subtask.label}`,
          part: task.part,
        });
      });
    } else {
      slots.push({
        slot: { taskId: task.id, subtaskId: undefined },
        label: task.label,
        part: task.part,
      });
    }
  });

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-3 border-b border-border">
        <h3 className="text-sm font-semibold text-text-primary">{t('test.taskOverview')}</h3>
      </div>
      <div className="p-2 space-y-1">
        {slots.map((item, index) => {
          if (item.isPartHeader) {
            return (
              <div key={`part-${item.partNumber}`} className="px-3 py-2 mt-2 first:mt-0">
                <span className={`text-xs font-semibold uppercase tracking-wider ${
                  item.partNumber === 1 ? 'text-orange-600' : 'text-info'
                }`}>
                  {item.partNumber === 1 ? t('test.part1NoAids') : t('test.part2AllAids')}
                </span>
              </div>
            );
          }

          const key = getTaskSlotKey(item.slot);
          const isActive = item.slot.taskId === activeTaskSlot.taskId && item.slot.subtaskId === activeTaskSlot.subtaskId;
          const stats = taskStats.get(key);

          return (
            <button
              key={key}
              onClick={() => onSelectTask(item.slot)}
              className={`w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-center justify-between gap-2 ${
                isActive
                  ? 'border-brand bg-primary-50 ring-2 ring-brand/30 border'
                  : 'border border-transparent hover:bg-surface-alt hover:border-border'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className={`font-medium ${isActive ? 'text-brand' : 'text-text-primary'}`}>
                  {t('test.task')} {item.label}
                </span>
              </div>
              {stats && (
                <div className="flex items-center gap-2 text-xs shrink-0">
                  <span className={getScoreColor(stats.avgScore)}>
                    {stats.avgScore.toFixed(1)}
                  </span>
                  <span className="text-text-disabled">
                    {stats.gradedCount}/{stats.totalStudents}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
