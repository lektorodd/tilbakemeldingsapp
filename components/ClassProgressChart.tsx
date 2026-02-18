'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { TrendingUp } from 'lucide-react';

interface ClassProgressPoint {
    testId: string;
    testName: string;
    testDate: string;
    averageScore: number;
    blankPercentage: number;
    completedStudents: number;
}

interface ClassProgressChartProps {
    data: ClassProgressPoint[];
}

const CHART_W = 600;
const CHART_H = 280;
const PAD = { top: 30, right: 60, bottom: 60, left: 55 };
const PLOT_W = CHART_W - PAD.left - PAD.right;
const PLOT_H = CHART_H - PAD.top - PAD.bottom;

const SCORE_MAX = 60;
const PCT_MAX = 100;

const SCORE_GRIDLINES = [0, 10, 20, 30, 40, 50, 60];
const PCT_GRIDLINES = [0, 25, 50, 75, 100];

export default function ClassProgressChart({ data }: ClassProgressChartProps) {
    const { t } = useLanguage();
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

    if (data.length < 2) return null;

    const n = data.length;

    // Map data index to x position
    const xOf = (i: number) => PAD.left + (i / (n - 1)) * PLOT_W;
    // Map score (0-60) to y
    const yScore = (v: number) => PAD.top + PLOT_H - (v / SCORE_MAX) * PLOT_H;
    // Map percentage (0-100) to y
    const yPct = (v: number) => PAD.top + PLOT_H - (v / PCT_MAX) * PLOT_H;

    // Build polylines
    const scoreLine = data.map((d, i) => `${xOf(i)},${yScore(d.averageScore)}`).join(' ');
    const blankLine = data.map((d, i) => `${xOf(i)},${yPct(d.blankPercentage)}`).join(' ');

    // Score area fill
    const scoreArea = `M ${xOf(0)},${yScore(data[0].averageScore)} ` +
        data.map((d, i) => `L ${xOf(i)},${yScore(d.averageScore)}`).join(' ') +
        ` L ${xOf(n - 1)},${yScore(0)} L ${xOf(0)},${yScore(0)} Z`;

    return (
        <div>
            <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={24} className="text-brand" />
                <h2 className="text-xl font-display font-bold text-text-primary">{t('analytics.classProgressTitle')}</h2>
            </div>
            <p className="text-sm text-text-secondary mb-4">{t('analytics.classProgressDesc')}</p>

            {/* Legend */}
            <div className="flex items-center gap-6 mb-3 text-sm">
                <div className="flex items-center gap-2">
                    <span className="inline-block w-4 h-0.5 bg-indigo-600 rounded" />
                    <span className="text-text-secondary">{t('analytics.avgScore')} (0–60)</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="inline-block w-4 h-0.5 bg-amber-500 rounded" style={{ borderTop: '2px dashed' }} />
                    <span className="text-text-secondary">{t('analytics.blankPct')}</span>
                </div>
            </div>

            <svg
                viewBox={`0 0 ${CHART_W} ${CHART_H}`}
                className="w-full max-w-[700px]"
                style={{ overflow: 'visible' }}
            >
                {/* Gridlines */}
                {SCORE_GRIDLINES.map(v => (
                    <line
                        key={`sg-${v}`}
                        x1={PAD.left} y1={yScore(v)}
                        x2={PAD.left + PLOT_W} y2={yScore(v)}
                        stroke="#E2E8F0"
                        strokeWidth="1"
                    />
                ))}

                {/* Left Y-axis labels (score) */}
                {SCORE_GRIDLINES.map(v => (
                    <text
                        key={`sl-${v}`}
                        x={PAD.left - 8}
                        y={yScore(v)}
                        textAnchor="end"
                        dominantBaseline="middle"
                        fontSize="10"
                        fill="#6366F1"
                    >
                        {v}
                    </text>
                ))}

                {/* Right Y-axis labels (%) */}
                {PCT_GRIDLINES.map(v => (
                    <text
                        key={`pl-${v}`}
                        x={PAD.left + PLOT_W + 8}
                        y={yPct(v)}
                        textAnchor="start"
                        dominantBaseline="middle"
                        fontSize="10"
                        fill="#D97706"
                    >
                        {v}%
                    </text>
                ))}

                {/* Score area fill */}
                <path d={scoreArea} fill="rgba(99, 102, 241, 0.08)" />

                {/* Score line */}
                <polyline
                    points={scoreLine}
                    fill="none"
                    stroke="#4F46E5"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />

                {/* Blank % line (dashed) */}
                <polyline
                    points={blankLine}
                    fill="none"
                    stroke="#D97706"
                    strokeWidth="2"
                    strokeDasharray="6 3"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />

                {/* Data points – score */}
                {data.map((d, i) => (
                    <circle
                        key={`sp-${i}`}
                        cx={xOf(i)}
                        cy={yScore(d.averageScore)}
                        r={hoveredIdx === i ? 5 : 3.5}
                        fill="#4F46E5"
                        stroke="white"
                        strokeWidth="1.5"
                        className="transition-all"
                    />
                ))}

                {/* Data points – blank % */}
                {data.map((d, i) => (
                    <circle
                        key={`bp-${i}`}
                        cx={xOf(i)}
                        cy={yPct(d.blankPercentage)}
                        r={hoveredIdx === i ? 5 : 3.5}
                        fill="#D97706"
                        stroke="white"
                        strokeWidth="1.5"
                        className="transition-all"
                    />
                ))}

                {/* X-axis labels */}
                {data.map((d, i) => {
                    const label = d.testName.length > 14 ? d.testName.slice(0, 12) + '…' : d.testName;
                    return (
                        <text
                            key={`xl-${i}`}
                            x={xOf(i)}
                            y={PAD.top + PLOT_H + 16}
                            textAnchor="end"
                            fontSize="10"
                            fill="#64748B"
                            transform={`rotate(-30 ${xOf(i)} ${PAD.top + PLOT_H + 16})`}
                        >
                            {label}
                        </text>
                    );
                })}

                {/* Hover zones */}
                {data.map((d, i) => {
                    const halfGap = n > 1 ? PLOT_W / (n - 1) / 2 : PLOT_W / 2;
                    return (
                        <rect
                            key={`hz-${i}`}
                            x={xOf(i) - halfGap}
                            y={PAD.top}
                            width={halfGap * 2}
                            height={PLOT_H}
                            fill="transparent"
                            onMouseEnter={() => setHoveredIdx(i)}
                            onMouseLeave={() => setHoveredIdx(null)}
                        />
                    );
                })}

                {/* Tooltip */}
                {hoveredIdx !== null && (() => {
                    const d = data[hoveredIdx];
                    const tx = xOf(hoveredIdx);
                    const tooltipW = 140;
                    const tooltipH = 58;
                    // Flip tooltip to left side if near right edge
                    const flipX = tx + tooltipW + 10 > CHART_W;
                    const ttx = flipX ? tx - tooltipW - 10 : tx + 10;
                    const tty = PAD.top;

                    return (
                        <g>
                            {/* Vertical indicator line */}
                            <line
                                x1={tx} y1={PAD.top}
                                x2={tx} y2={PAD.top + PLOT_H}
                                stroke="#94A3B8"
                                strokeWidth="1"
                                strokeDasharray="3 3"
                            />
                            <rect
                                x={ttx}
                                y={tty}
                                width={tooltipW}
                                height={tooltipH}
                                rx="6"
                                fill="white"
                                stroke="#CBD5E1"
                                strokeWidth="1"
                                filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                            />
                            <text x={ttx + 8} y={tty + 16} fontSize="11" fontWeight="600" fill="#1E293B">
                                {d.testName.length > 18 ? d.testName.slice(0, 16) + '…' : d.testName}
                            </text>
                            <text x={ttx + 8} y={tty + 32} fontSize="10" fill="#4F46E5">
                                {t('analytics.avgScore')}: {d.averageScore}
                            </text>
                            <text x={ttx + 8} y={tty + 46} fontSize="10" fill="#D97706">
                                {t('analytics.blankPct')}: {d.blankPercentage}%
                            </text>
                        </g>
                    );
                })()}
            </svg>
        </div>
    );
}
