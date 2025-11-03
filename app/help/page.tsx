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
  User
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
            className="inline-flex items-center gap-2 text-brand hover:text-rose-800 mb-4"
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
            <a href="#workflow" className="flex items-center gap-2 p-3 bg-violet-50 text-violet-700 rounded-lg hover:bg-violet-100 transition-colors">
              <GraduationCap size={18} />
              <span className="text-sm font-medium">{t('help.workflow')}</span>
            </a>
            <a href="#quick-grading" className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
              <MousePointerClick size={18} />
              <span className="text-sm font-medium">Rask poeng</span>
            </a>
            <a href="#export" className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
              <Download size={18} />
              <span className="text-sm font-medium">Eksport</span>
            </a>
            <a href="#grading" className="flex items-center gap-2 p-3 bg-rose-50 text-brand-hover rounded-lg hover:bg-rose-100 transition-colors">
              <Calculator size={18} />
              <span className="text-sm font-medium">{t('help.gradingSystem')}</span>
            </a>
            <a href="#typst" className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors">
              <FileText size={18} />
              <span className="text-sm font-medium">{t('help.typstMath')}</span>
            </a>
            <a href="#snippets" className="flex items-center gap-2 p-3 bg-background text-amber-700 rounded-lg hover:bg-amber-100 transition-colors">
              <BookmarkPlus size={18} />
              <span className="text-sm font-medium">{t('help.snippets')}</span>
            </a>
            <a href="#analytics" className="flex items-center gap-2 p-3 bg-stone-50 text-stone-700 rounded-lg hover:bg-stone-100 transition-colors">
              <BarChart3 size={18} />
              <span className="text-sm font-medium">{t('help.analytics')}</span>
            </a>
            <a href="#tips" className="flex items-center gap-2 p-3 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors">
              <Lightbulb size={18} />
              <span className="text-sm font-medium">{t('help.tips')}</span>
            </a>
          </div>
        </div>

        {/* Basic Workflow */}
        <div id="workflow" className="bg-surface rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap size={24} className="text-brand" />
            <h2 className="text-2xl font-display font-bold text-text-primary">{t('help.workflow')}</h2>
          </div>

          <div className="space-y-4">
            <div className="border-l-4 border-violet-600 pl-4">
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

            <div className="border-l-4 border-stone-600 pl-4">
              <h3 className="font-semibold text-text-primary mb-2">5. {t('help.step5Title')}</h3>
              <p className="text-sm text-text-secondary">{t('help.step5Desc')}</p>
            </div>
          </div>
        </div>

        {/* Quick Point Selection */}
        <div id="quick-grading" className="bg-surface rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <MousePointerClick size={24} className="text-blue-600" />
            <h2 className="text-2xl font-display font-bold text-text-primary">Rask poeng-valg</h2>
          </div>

          <div className="space-y-4">
            <p className="text-text-secondary">
              Når du gir tilbakemelding på prøver, kan du no raskt velje poeng med knapper i staden for dropdown-menyer.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-3">Slik bruker du det:</h3>
              <ol className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="font-bold">1.</span>
                  <span>Gå til ein prøve og vel ein elev å gi tilbakemelding til</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">2.</span>
                  <span>For kvar oppgåve ser du 7 knappar (0-6) under "Poeng:"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">3.</span>
                  <span>Klikk på talet som passar for å gi poeng - mykje raskare enn dropdown!</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">4.</span>
                  <span>Den valde knappen blir lilla og litt større, så du ser kva som er valt</span>
                </li>
              </ol>
            </div>

            <div className="border border-border rounded-lg p-4">
              <h3 className="font-semibold text-text-primary mb-2">Visualisering:</h3>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-text-secondary">Poeng:</span>
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4, 5, 6].map(p => (
                    <button
                      key={p}
                      disabled
                      className={`w-9 h-9 rounded-lg font-semibold transition-all ${
                        p === 4
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
              <p className="text-xs text-text-secondary mt-2">
                I dette eksempelet er 4 poeng valt (lilla knapp)
              </p>
            </div>

            <div className="bg-background border border-border rounded-lg p-4">
              <h3 className="font-semibold text-text-primary mb-2">Fordelar:</h3>
              <ul className="text-sm text-text-secondary space-y-1">
                <li>✅ Mykje raskare arbeidsflyt - eitt klikk i staden for to</li>
                <li>✅ Visuell tilbakemelding på kva som er valt</li>
                <li>✅ Ingen scrolling i dropdown-menyer</li>
                <li>✅ Lettare å sjå alle alternativ samtidig</li>
                <li>✅ Moderne og intuitiv brukaropplevelse</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CSV/Excel Export */}
        <div id="export" className="bg-surface rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Download size={24} className="text-success" />
            <h2 className="text-2xl font-display font-bold text-text-primary">CSV/Excel-eksport</h2>
          </div>

          <div className="space-y-4">
            <p className="text-text-secondary">
              Eksporter kursdata til CSV-format som kan opnast direkte i Excel, Google Sheets, eller andre reknearkprogram.
            </p>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-3">Slik eksporterer du:</h3>
              <ol className="space-y-2 text-sm text-green-800">
                <li className="flex items-start gap-2">
                  <span className="font-bold">1.</span>
                  <span>Gå til kursssida (der du ser studentar og prøver)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">2.</span>
                  <span>Klikk på den grøne knappen "Export to CSV/Excel" øvst til høgre</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">3.</span>
                  <span>Fila blir lasta ned automatisk som <code className="bg-green-100 px-1 rounded">kursnavn.csv</code></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">4.</span>
                  <span>Opne fila i Excel, Google Sheets eller liknande</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">5.</span>
                  <span>(Valfritt) Lagre som .xlsx frå Excel om du vil ha Excel-format</span>
                </li>
              </ol>
            </div>

            <div className="border border-border rounded-lg p-4">
              <h3 className="font-semibold text-text-primary mb-3">Kva inneheld eksporten?</h3>

              <div className="space-y-3 text-sm">
                <div className="border-l-4 border-violet-600 pl-3">
                  <h4 className="font-semibold text-text-primary mb-1">📊 Studentoversikt</h4>
                  <p className="text-text-secondary">
                    Alle studentar med poengsum på kvar prøve, gjennomsnitt og fullføringsgrad
                  </p>
                </div>

                <div className="border-l-4 border-emerald-600 pl-3">
                  <h4 className="font-semibold text-text-primary mb-1">📝 Detaljert prøvedata</h4>
                  <p className="text-text-secondary">
                    For kvar prøve: dato, skildring, generell kommentar, studentstatistikk
                  </p>
                </div>

                <div className="border-l-4 border-amber-600 pl-3">
                  <h4 className="font-semibold text-text-primary mb-1">📈 Oppgåveanalyse</h4>
                  <p className="text-text-secondary">
                    Gjennomsnittsscore per oppgåve, forsøksprosent, poengsfordeling (0-6)
                  </p>
                </div>

                <div className="border-l-4 border-rose-600 pl-3">
                  <h4 className="font-semibold text-text-primary mb-1">💬 Alle kommentarar</h4>
                  <p className="text-text-secondary">
                    Generelle kommentarar, oppgåvekommentarar og individuelle kommentarar for kvar elev
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-background border border-border rounded-lg p-4">
              <h3 className="font-semibold text-text-primary mb-2">Bruksområde:</h3>
              <ul className="text-sm text-text-secondary space-y-1">
                <li>✅ Analysere klasseprestasjon i Excel med pivottabeller</li>
                <li>✅ Dele data med kollegaer eller administrasjon</li>
                <li>✅ Importere data til andre system</li>
                <li>✅ Lage eigne diagram og rapportar</li>
                <li>✅ Arkivere kursdata eksternt</li>
                <li>✅ Førebu foreldremøter med utskriftsvennleg format</li>
              </ul>
            </div>

            <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
              <h3 className="font-semibold text-violet-900 mb-2">💡 Tips:</h3>
              <ul className="text-sm text-violet-800 space-y-1">
                <li>• CSV-fila bruker UTF-8 med BOM for korrekt norsk teiknstøtte i Excel</li>
                <li>• Opne fila direkte i Excel - den formaterer seg automatisk</li>
                <li>• Du kan enkelt lagre som .xlsx frå Excel om du treng Excel-format</li>
                <li>• Eksporten inkluderer ALLE data - ingen funksjonar blir utelate</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Grading System */}
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
                  <thead className="bg-stone-100">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-text-secondary">{t('help.taskScores')}</th>
                      <th className="px-3 py-2 text-left font-medium text-text-secondary">{t('help.average')}</th>
                      <th className="px-3 py-2 text-left font-medium text-text-secondary">{t('help.finalScore')}</th>
                      <th className="px-3 py-2 text-left font-medium text-text-secondary">{t('help.percentage')}</th>
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
        <div id="typst" className="bg-surface rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={24} className="text-success" />
            <h2 className="text-2xl font-display font-bold text-text-primary">{t('help.typstMath')}</h2>
          </div>

          <p className="text-text-secondary mb-4">{t('help.typstDesc')}</p>

          <div className="space-y-3">
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-stone-100 px-4 py-2 flex items-center justify-between">
                <span className="font-medium text-text-secondary">{t('help.basicMath')}</span>
              </div>
              <div className="p-4 space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <code className="bg-stone-50 px-2 py-1 rounded">$x^2 + y^2 = r^2$</code>
                  <span className="text-text-secondary">x² + y² = r²</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <code className="bg-stone-50 px-2 py-1 rounded">$frac(a, b)$</code>
                  <span className="text-text-secondary">a/b (fraction)</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <code className="bg-stone-50 px-2 py-1 rounded">$sqrt(x)$</code>
                  <span className="text-text-secondary">√x</span>
                </div>
              </div>
            </div>

            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-stone-100 px-4 py-2">
                <span className="font-medium text-text-secondary">{t('help.advancedMath')}</span>
              </div>
              <div className="p-4 space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <code className="bg-stone-50 px-2 py-1 rounded">$log_2(x)$</code>
                  <span className="text-text-secondary">log₂(x)</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <code className="bg-stone-50 px-2 py-1 rounded">$integral x^2 d x$</code>
                  <span className="text-text-secondary">∫x² dx</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <code className="bg-stone-50 px-2 py-1 rounded">$sum_(i=1)^n i$</code>
                  <span className="text-text-secondary">Σᵢ₌₁ⁿ i</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-lg">
              <Link2 size={18} />
              <span className="text-sm">{t('help.typstLink')}</span>
            </div>
          </div>
        </div>

        {/* Snippets */}
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
        <div id="analytics" className="bg-surface rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={24} className="text-stone-600" />
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

        {/* Tips & Best Practices */}
        <div id="tips" className="bg-surface rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb size={24} className="text-warning" />
            <h2 className="text-2xl font-display font-bold text-text-primary">{t('help.tips')}</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="border-l-4 border-violet-600 pl-4">
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

            <div className="border-l-4 border-stone-600 pl-4">
              <h3 className="font-semibold text-text-primary mb-1">{t('help.tip5Title')}</h3>
              <p className="text-sm text-text-secondary">{t('help.tip5Desc')}</p>
            </div>

            <div className="border-l-4 border-yellow-600 pl-4">
              <h3 className="font-semibold text-text-primary mb-1">{t('help.tip6Title')}</h3>
              <p className="text-sm text-text-secondary">{t('help.tip6Desc')}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-violet-50 border border-violet-200 rounded-lg p-6 text-center">
          <h3 className="font-semibold text-violet-900 mb-2">{t('help.needMoreHelp')}</h3>
          <p className="text-sm text-violet-800 mb-4">{t('help.contactInfo')}</p>

          <div className="flex items-center justify-center gap-4 pt-4 border-t border-violet-300">
            <div className="flex items-center gap-2 text-violet-700">
              <User size={16} />
              <span className="text-sm">{t('help.author')}</span>
            </div>
            <a
              href="https://github.com/lektorodd/tilbakemeldingsapp"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-violet-700 hover:text-violet-900 transition-colors"
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
