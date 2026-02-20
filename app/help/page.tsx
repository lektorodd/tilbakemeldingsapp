'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  ArrowLeft,
  BookOpen,
  GraduationCap,
  FileText,
  BarChart3,
  CheckCircle,
  Calculator,
  BookmarkPlus,
  Download,
  Link2,
  Lightbulb,
  MousePointerClick,
  Github,
  User,
  Keyboard,
  FolderSync,
  Moon,
  UserX,
  Tag,
  ListChecks,
  Mic,
  Weight,
  Grid3X3,
  Zap,
} from 'lucide-react';

export default function HelpPage() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-brand hover:text-brand-hover mb-4"
          >
            <ArrowLeft size={20} />
            {t('common.back')}
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <BookOpen size={32} className="text-brand" />
            <h1 className="text-4xl font-bold text-text-primary">{t('help.title')}</h1>
          </div>
          <p className="text-text-secondary text-lg">{t('help.subtitle')}</p>
        </div>

        {/* Quick Links */}
        <div className="bg-surface rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-text-primary mb-4">{t('help.quickLinks')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <a href="#workflow" className="flex items-center gap-2 p-3 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors">
              <GraduationCap size={18} />
              <span className="text-sm font-medium">{t('help.workflow')}</span>
            </a>
            <a href="#shortcuts" className="flex items-center gap-2 p-3 bg-info-bg text-info rounded-lg hover:bg-info-bg transition-colors">
              <Keyboard size={18} />
              <span className="text-sm font-medium">{t('help.shortcutsQuickLink')}</span>
            </a>
            <a href="#grading-modes" className="flex items-center gap-2 p-3 bg-rose-50 text-brand-hover rounded-lg hover:bg-rose-100 transition-colors">
              <Zap size={18} />
              <span className="text-sm font-medium">{t('help.gradingModes')}</span>
            </a>
            <a href="#grading" className="flex items-center gap-2 p-3 bg-warning-bg text-warning rounded-lg hover:bg-warning-bg transition-colors">
              <Calculator size={18} />
              <span className="text-sm font-medium">{t('help.gradingSystem')}</span>
            </a>
            <a href="#data-safety" className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
              <FolderSync size={18} />
              <span className="text-sm font-medium">{t('help.dataSafety')}</span>
            </a>
            <a href="#task-config" className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors">
              <ListChecks size={18} />
              <span className="text-sm font-medium">{t('help.taskConfig')}</span>
            </a>
            <a href="#export" className="flex items-center gap-2 p-3 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors">
              <Download size={18} />
              <span className="text-sm font-medium">{t('help.exportQuickLink')}</span>
            </a>
            <a href="#typst" className="flex items-center gap-2 p-3 bg-surface-alt text-text-secondary rounded-lg hover:bg-surface-alt transition-colors">
              <FileText size={18} />
              <span className="text-sm font-medium">{t('help.typstMath')}</span>
            </a>
            <a href="#snippets" className="flex items-center gap-2 p-3 bg-background text-amber-700 rounded-lg hover:bg-amber-100 transition-colors">
              <BookmarkPlus size={18} />
              <span className="text-sm font-medium">{t('help.snippets')}</span>
            </a>
            <a href="#analytics" className="flex items-center gap-2 p-3 bg-info-bg text-info rounded-lg hover:bg-info-bg transition-colors">
              <BarChart3 size={18} />
              <span className="text-sm font-medium">{t('help.analytics')}</span>
            </a>
            <a href="#oral" className="flex items-center gap-2 p-3 bg-rose-50 text-brand-hover rounded-lg hover:bg-rose-100 transition-colors">
              <Mic size={18} />
              <span className="text-sm font-medium">{t('help.oralQuickLink')}</span>
            </a>
            <a href="#tips" className="flex items-center gap-2 p-3 bg-warning-bg text-warning rounded-lg hover:bg-warning-bg transition-colors">
              <Lightbulb size={18} />
              <span className="text-sm font-medium">{t('help.tips')}</span>
            </a>
          </div>
        </div>

        {/* ──────────────────────── 1. Basic Workflow ──────────────────────── */}
        <div id="workflow" className="bg-surface rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap size={24} className="text-brand" />
            <h2 className="text-2xl font-display font-bold text-text-primary">{t('help.workflow')}</h2>
          </div>

          <div className="space-y-4">
            <div className="border-l-4 border-primary-600 pl-4">
              <h3 className="font-semibold text-text-primary mb-2">1. {t('help.step1Title')}</h3>
              <p className="text-sm text-text-secondary">{t('help.step1Desc')}</p>
            </div>

            <div className="border-l-4 border-rose-600 pl-4">
              <h3 className="font-semibold text-text-primary mb-2">2. {t('help.step2Title')}</h3>
              <p className="text-sm text-text-secondary">{t('help.step2Desc')}</p>
            </div>

            <div className="border-l-4 border-emerald-600 pl-4">
              <h3 className="font-semibold text-text-primary mb-2">3. {t('help.step3Title')}</h3>
              <p className="text-sm text-text-secondary">{t('help.step3Desc')}</p>
            </div>

            <div className="border-l-4 border-amber-600 pl-4">
              <h3 className="font-semibold text-text-primary mb-2">4. {t('help.step4Title')}</h3>
              <p className="text-sm text-text-secondary">{t('help.step4Desc')}</p>
            </div>

            <div className="border-l-4 border-text-secondary pl-4">
              <h3 className="font-semibold text-text-primary mb-2">5. {t('help.step5Title')}</h3>
              <p className="text-sm text-text-secondary">{t('help.step5Desc')}</p>
            </div>
          </div>
        </div>

        {/* ──────────────────────── 2. Keyboard Shortcuts ──────────────────────── */}
        <div id="shortcuts" className="bg-surface rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Keyboard size={24} className="text-info" />
            <h2 className="text-2xl font-display font-bold text-text-primary">{t('help.shortcutsTitle')}</h2>
          </div>

          <p className="text-text-secondary mb-4">{t('help.shortcutsDesc')}</p>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-surface-alt">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-text-secondary">{t('help.shortcutKey')}</th>
                  <th className="px-3 py-2 text-left font-medium text-text-secondary">{t('help.shortcutAction')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="px-3 py-2"><kbd className="bg-surface-alt px-2 py-0.5 rounded text-xs font-mono border border-border">0</kbd> – <kbd className="bg-surface-alt px-2 py-0.5 rounded text-xs font-mono border border-border">6</kbd></td>
                  <td className="px-3 py-2 text-text-secondary">{t('help.shortcutSetPoints')}</td>
                </tr>
                <tr>
                  <td className="px-3 py-2"><kbd className="bg-surface-alt px-2 py-0.5 rounded text-xs font-mono border border-border">Tab</kbd> / <kbd className="bg-surface-alt px-2 py-0.5 rounded text-xs font-mono border border-border">Shift+Tab</kbd></td>
                  <td className="px-3 py-2 text-text-secondary">{t('help.shortcutNavTask')}</td>
                </tr>
                <tr>
                  <td className="px-3 py-2"><kbd className="bg-surface-alt px-2 py-0.5 rounded text-xs font-mono border border-border">Enter</kbd></td>
                  <td className="px-3 py-2 text-text-secondary">{t('help.shortcutEnterComment')}</td>
                </tr>
                <tr>
                  <td className="px-3 py-2"><kbd className="bg-surface-alt px-2 py-0.5 rounded text-xs font-mono border border-border">Escape</kbd></td>
                  <td className="px-3 py-2 text-text-secondary">{t('help.shortcutEscape')}</td>
                </tr>
                <tr>
                  <td className="px-3 py-2"><kbd className="bg-surface-alt px-2 py-0.5 rounded text-xs font-mono border border-border">Alt+→</kbd> / <kbd className="bg-surface-alt px-2 py-0.5 rounded text-xs font-mono border border-border">Alt+↓</kbd></td>
                  <td className="px-3 py-2 text-text-secondary">{t('help.shortcutNextStudent')}</td>
                </tr>
                <tr>
                  <td className="px-3 py-2"><kbd className="bg-surface-alt px-2 py-0.5 rounded text-xs font-mono border border-border">Alt+←</kbd> / <kbd className="bg-surface-alt px-2 py-0.5 rounded text-xs font-mono border border-border">Alt+↑</kbd></td>
                  <td className="px-3 py-2 text-text-secondary">{t('help.shortcutPrevStudent')}</td>
                </tr>
                <tr>
                  <td className="px-3 py-2"><kbd className="bg-surface-alt px-2 py-0.5 rounded text-xs font-mono border border-border">Alt+Enter</kbd></td>
                  <td className="px-3 py-2 text-text-secondary">{t('help.shortcutToggleComplete')}</td>
                </tr>
                <tr>
                  <td className="px-3 py-2"><kbd className="bg-surface-alt px-2 py-0.5 rounded text-xs font-mono border border-border">Alt+T</kbd></td>
                  <td className="px-3 py-2 text-text-secondary">{t('help.shortcutTaskGrading')}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 bg-info-bg border border-info rounded-lg p-4">
            <p className="text-sm text-info">{t('help.shortcutsTip')}</p>
          </div>
        </div>

        {/* ──────────────────────── 3. Grading Modes ──────────────────────── */}
        <div id="grading-modes" className="bg-surface rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={24} className="text-brand" />
            <h2 className="text-2xl font-display font-bold text-text-primary">{t('help.gradingModes')}</h2>
          </div>

          <div className="space-y-4">
            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <User size={18} className="text-brand" />
                <h3 className="font-semibold text-text-primary">{t('help.studentModeTitle')}</h3>
              </div>
              <p className="text-sm text-text-secondary">{t('help.studentModeDesc')}</p>
            </div>

            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <ListChecks size={18} className="text-primary-600" />
                <h3 className="font-semibold text-text-primary">{t('help.taskModeTitle')}</h3>
              </div>
              <p className="text-sm text-text-secondary">{t('help.taskModeDesc')}</p>
            </div>

            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Grid3X3 size={18} className="text-emerald-600" />
                <h3 className="font-semibold text-text-primary">{t('help.progressGridTitle')}</h3>
              </div>
              <p className="text-sm text-text-secondary">{t('help.progressGridDesc')}</p>
            </div>

            {/* Quick grading sub-section */}
            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <MousePointerClick size={18} className="text-amber-600" />
                <h3 className="font-semibold text-text-primary">{t('help.quickGradingTitle')}</h3>
              </div>
              <p className="text-sm text-text-secondary mb-3">{t('help.quickGradingDesc')}</p>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-text-secondary">{t('test.pointsLabel')}</span>
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4, 5, 6].map(p => (
                    <button
                      key={p}
                      disabled
                      className={`w-9 h-9 rounded-lg font-semibold transition-all ${p === 4
                          ? 'bg-brand text-white shadow-md scale-110'
                          : 'bg-surface border border-border text-text-secondary'
                        }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <span className="text-sm text-text-secondary">/ 6</span>
              </div>
              <p className="text-xs text-text-secondary">{t('help.quickGradingExample')}</p>
            </div>
          </div>
        </div>

        {/* ──────────────────────── 4. Grading System ──────────────────────── */}
        <div id="grading" className="bg-surface rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Calculator size={24} className="text-brand" />
            <h2 className="text-2xl font-display font-bold text-text-primary">{t('help.gradingSystem')}</h2>
          </div>

          <div className="space-y-4">
            <p className="text-text-secondary">{t('help.gradingDesc')}</p>

            <div className="bg-background border border-border rounded-lg p-4">
              <h3 className="font-semibold text-text-primary mb-2">{t('help.scoringFormula')}</h3>
              <p className="text-sm text-text-secondary font-mono bg-surface px-3 py-2 rounded">
                {t('help.formula')}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-text-primary mb-2">{t('help.examples')}</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-surface-alt">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-text-secondary">{t('help.taskScores')}</th>
                      <th className="px-3 py-2 text-left font-medium text-text-secondary">{t('help.average')}</th>
                      <th className="px-3 py-2 text-left font-medium text-text-secondary">{t('help.finalScore')}</th>
                      <th className="px-3 py-2 text-left font-medium text-text-secondary">{t('help.percentage')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr className="hover:bg-emerald-50">
                      <td className="px-3 py-2">6, 6, 6</td>
                      <td className="px-3 py-2">6.0</td>
                      <td className="px-3 py-2 font-semibold">60/60</td>
                      <td className="px-3 py-2">100%</td>
                    </tr>
                    <tr className="hover:bg-emerald-50">
                      <td className="px-3 py-2">5, 5, 5, 5</td>
                      <td className="px-3 py-2">5.0</td>
                      <td className="px-3 py-2 font-semibold">50/60</td>
                      <td className="px-3 py-2">83%</td>
                    </tr>
                    <tr className="hover:bg-warning-bg">
                      <td className="px-3 py-2">3, 4, 4, 5</td>
                      <td className="px-3 py-2">4.0</td>
                      <td className="px-3 py-2 font-semibold">40/60</td>
                      <td className="px-3 py-2">67%</td>
                    </tr>
                    <tr className="hover:bg-danger-bg">
                      <td className="px-3 py-2">2, 3, 3, 4</td>
                      <td className="px-3 py-2">3.0</td>
                      <td className="px-3 py-2 font-semibold">30/60</td>
                      <td className="px-3 py-2">50%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <h3 className="font-semibold text-primary-900 mb-2">{t('help.whyThisSystem')}</h3>
              <ul className="text-sm text-primary-800 space-y-1">
                <li>• {t('help.benefit1')}</li>
                <li>• {t('help.benefit2')}</li>
                <li>• {t('help.benefit3')}</li>
                <li>• {t('help.benefit4')}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ──────────────────────── 5. Data Safety & Folder Sync ──────────────────────── */}
        <div id="data-safety" className="bg-surface rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FolderSync size={24} className="text-success" />
            <h2 className="text-2xl font-display font-bold text-text-primary">{t('help.dataSafety')}</h2>
          </div>

          <p className="text-text-secondary mb-4">{t('help.dataSafetyDesc')}</p>

          <div className="space-y-4">
            <div className="border-l-4 border-emerald-600 pl-4">
              <h3 className="font-semibold text-text-primary mb-1">{t('help.folderSyncTitle')}</h3>
              <p className="text-sm text-text-secondary">{t('help.folderSyncDesc')}</p>
            </div>

            <div className="border-l-4 border-primary-600 pl-4">
              <h3 className="font-semibold text-text-primary mb-1">{t('help.autoBackupTitle')}</h3>
              <p className="text-sm text-text-secondary">{t('help.autoBackupDesc')}</p>
            </div>

            <div className="border-l-4 border-amber-600 pl-4">
              <h3 className="font-semibold text-text-primary mb-1">{t('help.jsonExportTitle')}</h3>
              <p className="text-sm text-text-secondary">{t('help.jsonExportDesc')}</p>
            </div>

            <div className="border-l-4 border-text-secondary pl-4">
              <div className="flex items-center gap-2 mb-1">
                <Moon size={16} className="text-text-secondary" />
                <h3 className="font-semibold text-text-primary">{t('help.darkModeTitle')}</h3>
              </div>
              <p className="text-sm text-text-secondary">{t('help.darkModeDesc')}</p>
            </div>
          </div>
        </div>

        {/* ──────────────────────── 6. Task Configuration ──────────────────────── */}
        <div id="task-config" className="bg-surface rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <ListChecks size={24} className="text-emerald-600" />
            <h2 className="text-2xl font-display font-bold text-text-primary">{t('help.taskConfig')}</h2>
          </div>

          <p className="text-text-secondary mb-4">{t('help.taskConfigDesc')}</p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Weight size={16} className="text-amber-600" />
                <h3 className="font-semibold text-text-primary">{t('help.weightTitle')}</h3>
              </div>
              <p className="text-sm text-text-secondary">{t('help.weightDesc')}</p>
            </div>

            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Tag size={16} className="text-primary-600" />
                <h3 className="font-semibold text-text-primary">{t('help.labelsTitle')}</h3>
              </div>
              <p className="text-sm text-text-secondary">{t('help.labelsDesc')}</p>
            </div>

            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <UserX size={16} className="text-rose-600" />
                <h3 className="font-semibold text-text-primary">{t('help.absentTitle')}</h3>
              </div>
              <p className="text-sm text-text-secondary">{t('help.absentDesc')}</p>
            </div>

            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText size={16} className="text-emerald-600" />
                <h3 className="font-semibold text-text-primary">{t('help.twoPartTitle')}</h3>
              </div>
              <p className="text-sm text-text-secondary">{t('help.twoPartDesc')}</p>
            </div>
          </div>
        </div>

        {/* ──────────────────────── 7. Export ──────────────────────── */}
        <div id="export" className="bg-surface rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Download size={24} className="text-success" />
            <h2 className="text-2xl font-display font-bold text-text-primary">{t('help.exportTitle')}</h2>
          </div>

          <div className="space-y-4">
            <div className="border-l-4 border-primary-600 pl-4">
              <h3 className="font-semibold text-text-primary mb-1">{t('help.pdfExportTitle')}</h3>
              <p className="text-sm text-text-secondary">{t('help.pdfExportDesc')}</p>
            </div>

            <div className="border-l-4 border-emerald-600 pl-4">
              <h3 className="font-semibold text-text-primary mb-1">{t('help.csvExportTitle')}</h3>
              <p className="text-sm text-text-secondary">{t('help.csvExportDesc')}</p>
            </div>

            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <h3 className="font-semibold text-primary-900 mb-2">{t('help.exportContents')}</h3>
              <ul className="text-sm text-primary-800 space-y-1">
                <li>• {t('help.exportContent1Desc')}</li>
                <li>• {t('help.exportContent2Desc')}</li>
                <li>• {t('help.exportContent3Desc')}</li>
                <li>• {t('help.exportContent4Desc')}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ──────────────────────── 8. Typst Math ──────────────────────── */}
        <div id="typst" className="bg-surface rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={24} className="text-success" />
            <h2 className="text-2xl font-display font-bold text-text-primary">{t('help.typstMath')}</h2>
          </div>

          <p className="text-text-secondary mb-4">{t('help.typstDesc')}</p>

          <div className="space-y-3">
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-surface-alt px-4 py-2 flex items-center justify-between">
                <span className="font-medium text-text-secondary">{t('help.basicMath')}</span>
              </div>
              <div className="p-4 space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <code className="bg-surface-alt px-2 py-1 rounded">$x^2 + y^2 = r^2$</code>
                  <span className="text-text-secondary">x² + y² = r²</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <code className="bg-surface-alt px-2 py-1 rounded">$frac(a, b)$</code>
                  <span className="text-text-secondary">a/b (fraction)</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <code className="bg-surface-alt px-2 py-1 rounded">$sqrt(x)$</code>
                  <span className="text-text-secondary">&radic;x</span>
                </div>
              </div>
            </div>

            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-surface-alt px-4 py-2">
                <span className="font-medium text-text-secondary">{t('help.advancedMath')}</span>
              </div>
              <div className="p-4 space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <code className="bg-surface-alt px-2 py-1 rounded">$log_2(x)$</code>
                  <span className="text-text-secondary">log&#8322;(x)</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <code className="bg-surface-alt px-2 py-1 rounded">$integral x^2 d x$</code>
                  <span className="text-text-secondary">&int;x² dx</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <code className="bg-surface-alt px-2 py-1 rounded">$sum_(i=1)^n i$</code>
                  <span className="text-text-secondary">&Sigma;&#7522;&#8321;&#8319; i</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-lg">
              <Link2 size={18} />
              <span className="text-sm">{t('help.typstLink')}</span>
            </div>
          </div>
        </div>

        {/* ──────────────────────── 9. Snippets ──────────────────────── */}
        <div id="snippets" className="bg-surface rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BookmarkPlus size={24} className="text-amber-600" />
            <h2 className="text-2xl font-display font-bold text-text-primary">{t('help.snippets')}</h2>
          </div>

          <p className="text-text-secondary mb-4">{t('help.snippetsDesc')}</p>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-text-primary mb-2">{t('help.howToUseSnippets')}</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-text-secondary">
                <li>{t('help.snippetStep1')}</li>
                <li>{t('help.snippetStep2')}</li>
                <li>{t('help.snippetStep3')}</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-text-primary mb-2">{t('help.createSnippets')}</h3>
              <p className="text-sm text-text-secondary mb-2">{t('help.createSnippetsDesc')}</p>
            </div>

            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <h3 className="font-semibold text-primary-900 mb-2">{t('help.standardSnippets')}</h3>
              <div className="grid grid-cols-2 gap-2 text-sm text-primary-800">
                <div>• {t('help.standardSnippet1')}</div>
                <div>• {t('help.standardSnippet2')}</div>
                <div>• {t('help.standardSnippet3')}</div>
                <div>• {t('help.standardSnippet4')}</div>
                <div>• {t('help.standardSnippet5')}</div>
                <div>• {t('help.standardSnippet6')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ──────────────────────── 10. Analytics ──────────────────────── */}
        <div id="analytics" className="bg-surface rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={24} className="text-text-secondary" />
            <h2 className="text-2xl font-display font-bold text-text-primary">{t('help.analytics')}</h2>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-text-primary mb-2">{t('help.labelPerformance')}</h3>
              <p className="text-sm text-text-secondary">{t('help.labelPerformanceDesc')}</p>
            </div>

            <div>
              <h3 className="font-semibold text-text-primary mb-2">{t('help.categoryPerformance')}</h3>
              <p className="text-sm text-text-secondary">{t('help.categoryPerformanceDesc')}</p>
            </div>

            <div>
              <h3 className="font-semibold text-text-primary mb-2">{t('help.classProgressTitle')}</h3>
              <p className="text-sm text-text-secondary">{t('help.classProgressDesc')}</p>
            </div>

            <div>
              <h3 className="font-semibold text-text-primary mb-2">{t('help.studentDashboard')}</h3>
              <p className="text-sm text-text-secondary">{t('help.studentDashboardDesc')}</p>
            </div>

            <div className="bg-background border border-border rounded-lg p-4">
              <h3 className="font-semibold text-text-primary mb-2">{t('help.colorCoding')}</h3>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-success rounded"></div>
                  <span className="text-text-secondary">{t('help.green')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-warning rounded"></div>
                  <span className="text-text-secondary">{t('help.yellow')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-danger rounded"></div>
                  <span className="text-text-secondary">{t('help.red')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ──────────────────────── 11. Oral Assessments ──────────────────────── */}
        <div id="oral" className="bg-surface rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Mic size={24} className="text-brand" />
            <h2 className="text-2xl font-display font-bold text-text-primary">{t('help.oralTitle')}</h2>
          </div>

          <p className="text-text-secondary mb-4">{t('help.oralDesc')}</p>

          <div className="space-y-3">
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <h3 className="font-semibold text-primary-900 mb-2">{t('help.oralDimensions')}</h3>
              <div className="grid grid-cols-2 gap-2 text-sm text-primary-800">
                <div>• {t('oral.dimension.strategy.label')}</div>
                <div>• {t('oral.dimension.reasoning.label')}</div>
                <div>• {t('oral.dimension.representations.label')}</div>
                <div>• {t('oral.dimension.modeling.label')}</div>
                <div>• {t('oral.dimension.communication.label')}</div>
                <div>• {t('oral.dimension.subject_knowledge.label')}</div>
              </div>
            </div>

            <p className="text-sm text-text-secondary">{t('help.oralScoring')}</p>
          </div>
        </div>

        {/* ──────────────────────── 12. Tips & Best Practices ──────────────────────── */}
        <div id="tips" className="bg-surface rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb size={24} className="text-warning" />
            <h2 className="text-2xl font-display font-bold text-text-primary">{t('help.tips')}</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="border-l-4 border-primary-600 pl-4">
              <h3 className="font-semibold text-text-primary mb-1">{t('help.tip1Title')}</h3>
              <p className="text-sm text-text-secondary">{t('help.tip1Desc')}</p>
            </div>

            <div className="border-l-4 border-rose-600 pl-4">
              <h3 className="font-semibold text-text-primary mb-1">{t('help.tip2Title')}</h3>
              <p className="text-sm text-text-secondary">{t('help.tip2Desc')}</p>
            </div>

            <div className="border-l-4 border-emerald-600 pl-4">
              <h3 className="font-semibold text-text-primary mb-1">{t('help.tip3Title')}</h3>
              <p className="text-sm text-text-secondary">{t('help.tip3Desc')}</p>
            </div>

            <div className="border-l-4 border-amber-600 pl-4">
              <h3 className="font-semibold text-text-primary mb-1">{t('help.tip4Title')}</h3>
              <p className="text-sm text-text-secondary">{t('help.tip4Desc')}</p>
            </div>

            <div className="border-l-4 border-text-secondary pl-4">
              <h3 className="font-semibold text-text-primary mb-1">{t('help.tip5Title')}</h3>
              <p className="text-sm text-text-secondary">{t('help.tip5Desc')}</p>
            </div>

            <div className="border-l-4 border-warning pl-4">
              <h3 className="font-semibold text-text-primary mb-1">{t('help.tip6Title')}</h3>
              <p className="text-sm text-text-secondary">{t('help.tip6Desc')}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 text-center">
          <h3 className="font-semibold text-primary-900 mb-2">{t('help.needMoreHelp')}</h3>
          <p className="text-sm text-primary-800 mb-4">{t('help.contactInfo')}</p>

          <div className="flex items-center justify-center gap-4 pt-4 border-t border-primary-300">
            <div className="flex items-center gap-2 text-primary-700">
              <User size={16} />
              <span className="text-sm">{t('help.author')}</span>
            </div>
            <a
              href="https://github.com/lektorodd/tilbakemeldingsapp"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary-700 hover:text-primary-900 transition-colors"
            >
              <Github size={16} />
              <span className="text-sm">{t('help.viewOnGithub')}</span>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
