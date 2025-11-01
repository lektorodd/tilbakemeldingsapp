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
  Lightbulb
} from 'lucide-react';

export default function HelpPage() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-amber-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-rose-600 hover:text-rose-800 mb-4"
          >
            <ArrowLeft size={20} />
            {t('common.back')}
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <BookOpen size={32} className="text-violet-600" />
            <h1 className="text-4xl font-bold text-gray-900">{t('help.title')}</h1>
          </div>
          <p className="text-gray-600 text-lg">{t('help.subtitle')}</p>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">{t('help.quickLinks')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <a href="#workflow" className="flex items-center gap-2 p-3 bg-violet-50 text-violet-700 rounded-md hover:bg-violet-100 transition">
              <GraduationCap size={18} />
              <span className="text-sm font-medium">{t('help.workflow')}</span>
            </a>
            <a href="#grading" className="flex items-center gap-2 p-3 bg-rose-50 text-rose-700 rounded-md hover:bg-rose-100 transition">
              <Calculator size={18} />
              <span className="text-sm font-medium">{t('help.gradingSystem')}</span>
            </a>
            <a href="#typst" className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-md hover:bg-emerald-100 transition">
              <FileText size={18} />
              <span className="text-sm font-medium">{t('help.typstMath')}</span>
            </a>
            <a href="#snippets" className="flex items-center gap-2 p-3 bg-amber-50 text-amber-700 rounded-md hover:bg-amber-100 transition">
              <BookmarkPlus size={18} />
              <span className="text-sm font-medium">{t('help.snippets')}</span>
            </a>
            <a href="#analytics" className="flex items-center gap-2 p-3 bg-stone-50 text-stone-700 rounded-md hover:bg-stone-100 transition">
              <BarChart3 size={18} />
              <span className="text-sm font-medium">{t('help.analytics')}</span>
            </a>
            <a href="#tips" className="flex items-center gap-2 p-3 bg-yellow-50 text-yellow-700 rounded-md hover:bg-yellow-100 transition">
              <Lightbulb size={18} />
              <span className="text-sm font-medium">{t('help.tips')}</span>
            </a>
          </div>
        </div>

        {/* Basic Workflow */}
        <div id="workflow" className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap size={24} className="text-violet-600" />
            <h2 className="text-2xl font-bold text-gray-800">{t('help.workflow')}</h2>
          </div>

          <div className="space-y-4">
            <div className="border-l-4 border-violet-600 pl-4">
              <h3 className="font-semibold text-gray-800 mb-2">1. {t('help.step1Title')}</h3>
              <p className="text-sm text-gray-600">{t('help.step1Desc')}</p>
            </div>

            <div className="border-l-4 border-rose-600 pl-4">
              <h3 className="font-semibold text-gray-800 mb-2">2. {t('help.step2Title')}</h3>
              <p className="text-sm text-gray-600">{t('help.step2Desc')}</p>
            </div>

            <div className="border-l-4 border-emerald-600 pl-4">
              <h3 className="font-semibold text-gray-800 mb-2">3. {t('help.step3Title')}</h3>
              <p className="text-sm text-gray-600">{t('help.step3Desc')}</p>
            </div>

            <div className="border-l-4 border-amber-600 pl-4">
              <h3 className="font-semibold text-gray-800 mb-2">4. {t('help.step4Title')}</h3>
              <p className="text-sm text-gray-600">{t('help.step4Desc')}</p>
            </div>

            <div className="border-l-4 border-stone-600 pl-4">
              <h3 className="font-semibold text-gray-800 mb-2">5. {t('help.step5Title')}</h3>
              <p className="text-sm text-gray-600">{t('help.step5Desc')}</p>
            </div>
          </div>
        </div>

        {/* Grading System */}
        <div id="grading" className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Calculator size={24} className="text-rose-600" />
            <h2 className="text-2xl font-bold text-gray-800">{t('help.gradingSystem')}</h2>
          </div>

          <div className="space-y-4">
            <p className="text-gray-600">{t('help.gradingDesc')}</p>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">{t('help.scoringFormula')}</h3>
              <p className="text-sm text-gray-700 font-mono bg-white px-3 py-2 rounded">
                {t('help.formula')}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">{t('help.examples')}</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-stone-100">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">{t('help.taskScores')}</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">{t('help.average')}</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">{t('help.finalScore')}</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">{t('help.percentage')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
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
                    <tr className="hover:bg-yellow-50">
                      <td className="px-3 py-2">3, 4, 4, 5</td>
                      <td className="px-3 py-2">4.0</td>
                      <td className="px-3 py-2 font-semibold">40/60</td>
                      <td className="px-3 py-2">67%</td>
                    </tr>
                    <tr className="hover:bg-red-50">
                      <td className="px-3 py-2">2, 3, 3, 4</td>
                      <td className="px-3 py-2">3.0</td>
                      <td className="px-3 py-2 font-semibold">30/60</td>
                      <td className="px-3 py-2">50%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
              <h3 className="font-semibold text-violet-900 mb-2">{t('help.whyThisSystem')}</h3>
              <ul className="text-sm text-violet-800 space-y-1">
                <li>• {t('help.benefit1')}</li>
                <li>• {t('help.benefit2')}</li>
                <li>• {t('help.benefit3')}</li>
                <li>• {t('help.benefit4')}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Typst Math */}
        <div id="typst" className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={24} className="text-emerald-600" />
            <h2 className="text-2xl font-bold text-gray-800">{t('help.typstMath')}</h2>
          </div>

          <p className="text-gray-600 mb-4">{t('help.typstDesc')}</p>

          <div className="space-y-3">
            <div className="border border-stone-200 rounded-lg overflow-hidden">
              <div className="bg-stone-100 px-4 py-2 flex items-center justify-between">
                <span className="font-medium text-gray-700">{t('help.basicMath')}</span>
              </div>
              <div className="p-4 space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <code className="bg-stone-50 px-2 py-1 rounded">$x^2 + y^2 = r^2$</code>
                  <span className="text-gray-600">x² + y² = r²</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <code className="bg-stone-50 px-2 py-1 rounded">$frac(a, b)$</code>
                  <span className="text-gray-600">a/b (fraction)</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <code className="bg-stone-50 px-2 py-1 rounded">$sqrt(x)$</code>
                  <span className="text-gray-600">√x</span>
                </div>
              </div>
            </div>

            <div className="border border-stone-200 rounded-lg overflow-hidden">
              <div className="bg-stone-100 px-4 py-2">
                <span className="font-medium text-gray-700">{t('help.advancedMath')}</span>
              </div>
              <div className="p-4 space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <code className="bg-stone-50 px-2 py-1 rounded">$log_2(x)$</code>
                  <span className="text-gray-600">log₂(x)</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <code className="bg-stone-50 px-2 py-1 rounded">$integral x^2 d x$</code>
                  <span className="text-gray-600">∫x² dx</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <code className="bg-stone-50 px-2 py-1 rounded">$sum_(i=1)^n i$</code>
                  <span className="text-gray-600">Σᵢ₌₁ⁿ i</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-md">
              <Link2 size={18} />
              <span className="text-sm">{t('help.typstLink')}</span>
            </div>
          </div>
        </div>

        {/* Snippets */}
        <div id="snippets" className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BookmarkPlus size={24} className="text-amber-600" />
            <h2 className="text-2xl font-bold text-gray-800">{t('help.snippets')}</h2>
          </div>

          <p className="text-gray-600 mb-4">{t('help.snippetsDesc')}</p>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">{t('help.howToUseSnippets')}</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                <li>{t('help.snippetStep1')}</li>
                <li>{t('help.snippetStep2')}</li>
                <li>{t('help.snippetStep3')}</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">{t('help.createSnippets')}</h3>
              <p className="text-sm text-gray-600 mb-2">{t('help.createSnippetsDesc')}</p>
            </div>

            <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
              <h3 className="font-semibold text-violet-900 mb-2">{t('help.standardSnippets')}</h3>
              <div className="grid grid-cols-2 gap-2 text-sm text-violet-800">
                <div>• Sjå løysingsforslaget</div>
                <div>• Bra jobba!</div>
                <div>• Kvifor blir det slik?</div>
                <div>• Godt forklart!</div>
                <div>• Sikker?</div>
                <div>• Små reknefeile</div>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics */}
        <div id="analytics" className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={24} className="text-stone-600" />
            <h2 className="text-2xl font-bold text-gray-800">{t('help.analytics')}</h2>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">{t('help.labelPerformance')}</h3>
              <p className="text-sm text-gray-600">{t('help.labelPerformanceDesc')}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">{t('help.categoryPerformance')}</h3>
              <p className="text-sm text-gray-600">{t('help.categoryPerformanceDesc')}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">{t('help.studentDashboard')}</h3>
              <p className="text-sm text-gray-600">{t('help.studentDashboardDesc')}</p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">{t('help.colorCoding')}</h3>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-emerald-600 rounded"></div>
                  <span className="text-gray-700">{t('help.green')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-600 rounded"></div>
                  <span className="text-gray-700">{t('help.yellow')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-600 rounded"></div>
                  <span className="text-gray-700">{t('help.red')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tips & Best Practices */}
        <div id="tips" className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb size={24} className="text-yellow-600" />
            <h2 className="text-2xl font-bold text-gray-800">{t('help.tips')}</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="border-l-4 border-violet-600 pl-4">
              <h3 className="font-semibold text-gray-800 mb-1">{t('help.tip1Title')}</h3>
              <p className="text-sm text-gray-600">{t('help.tip1Desc')}</p>
            </div>

            <div className="border-l-4 border-rose-600 pl-4">
              <h3 className="font-semibold text-gray-800 mb-1">{t('help.tip2Title')}</h3>
              <p className="text-sm text-gray-600">{t('help.tip2Desc')}</p>
            </div>

            <div className="border-l-4 border-emerald-600 pl-4">
              <h3 className="font-semibold text-gray-800 mb-1">{t('help.tip3Title')}</h3>
              <p className="text-sm text-gray-600">{t('help.tip3Desc')}</p>
            </div>

            <div className="border-l-4 border-amber-600 pl-4">
              <h3 className="font-semibold text-gray-800 mb-1">{t('help.tip4Title')}</h3>
              <p className="text-sm text-gray-600">{t('help.tip4Desc')}</p>
            </div>

            <div className="border-l-4 border-stone-600 pl-4">
              <h3 className="font-semibold text-gray-800 mb-1">{t('help.tip5Title')}</h3>
              <p className="text-sm text-gray-600">{t('help.tip5Desc')}</p>
            </div>

            <div className="border-l-4 border-yellow-600 pl-4">
              <h3 className="font-semibold text-gray-800 mb-1">{t('help.tip6Title')}</h3>
              <p className="text-sm text-gray-600">{t('help.tip6Desc')}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-violet-50 border border-violet-200 rounded-lg p-6 text-center">
          <h3 className="font-semibold text-violet-900 mb-2">{t('help.needMoreHelp')}</h3>
          <p className="text-sm text-violet-800">{t('help.contactInfo')}</p>
        </div>
      </div>
    </main>
  );
}
