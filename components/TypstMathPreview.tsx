'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import katex from 'katex';

/**
 * Translate common Typst math syntax to KaTeX (LaTeX) syntax.
 * This covers the expressions teachers are most likely to use.
 */
function typstToKatex(expr: string): string {
    let s = expr;

    // Typst function calls → LaTeX commands
    // sqrt(x) → \sqrt{x}
    s = s.replace(/sqrt\(([^)]+)\)/g, '\\sqrt{$1}');

    // frac(a, b) → \frac{a}{b}
    s = s.replace(/frac\(([^,]+),\s*([^)]+)\)/g, '\\frac{$1}{$2}');

    // vec(x) → \vec{x}
    s = s.replace(/vec\(([^)]+)\)/g, '\\vec{$1}');

    // abs(x) → |x|
    s = s.replace(/abs\(([^)]+)\)/g, '|$1|');

    // Superscripts: x^2 works in both, but x^{10} too
    // Subscripts: x_1 works in both

    // Common symbols
    s = s.replace(/\bpi\b/g, '\\pi');
    s = s.replace(/\balpha\b/g, '\\alpha');
    s = s.replace(/\bbeta\b/g, '\\beta');
    s = s.replace(/\bgamma\b/g, '\\gamma');
    s = s.replace(/\bdelta\b/g, '\\delta');
    s = s.replace(/\btheta\b/g, '\\theta');
    s = s.replace(/\bomega\b/g, '\\omega');
    s = s.replace(/\binfty\b/g, '\\infty');
    s = s.replace(/\binfinity\b/g, '\\infty');

    // Operators
    s = s.replace(/\bsum\b/g, '\\sum');
    s = s.replace(/\bprod\b/g, '\\prod');
    s = s.replace(/\bintegral\b/g, '\\int');
    s = s.replace(/\bint\b/g, '\\int');
    s = s.replace(/\blim\b/g, '\\lim');

    // Comparison operators — Typst uses >= and <=, LaTeX uses \geq and \leq
    s = s.replace(/>=/g, '\\geq ');
    s = s.replace(/<=/g, '\\leq ');
    s = s.replace(/!=/g, '\\neq ');

    // Arrows
    s = s.replace(/->/g, '\\to ');
    s = s.replace(/=>/g, '\\Rightarrow ');

    // Plus-minus
    s = s.replace(/\bpm\b/g, '\\pm');
    s = s.replace(/\bmp\b/g, '\\mp');

    // Times and cdot
    s = s.replace(/\btimes\b/g, '\\times');
    s = s.replace(/\bcdot\b/g, '\\cdot');

    return s;
}

function escapeHtml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Parse text with $...$ segments, translate Typst→KaTeX, render */
function renderTextWithMath(text: string): string {
    if (!text.includes('$')) return '';

    const parts: string[] = [];
    let i = 0;

    while (i < text.length) {
        const dollarPos = text.indexOf('$', i);
        if (dollarPos === -1) {
            parts.push(escapeHtml(text.slice(i)));
            break;
        }

        if (dollarPos > i) {
            parts.push(escapeHtml(text.slice(i, dollarPos)));
        }

        const closePos = text.indexOf('$', dollarPos + 1);
        if (closePos === -1) {
            parts.push(escapeHtml(text.slice(dollarPos)));
            break;
        }

        const mathExpr = text.slice(dollarPos + 1, closePos);
        if (mathExpr.trim()) {
            try {
                const katexExpr = typstToKatex(mathExpr);
                const rendered = katex.renderToString(katexExpr, {
                    throwOnError: false,
                    displayMode: false,
                    output: 'html',
                });
                parts.push(rendered);
            } catch {
                parts.push(`<code style="color:var(--text-secondary);font-size:0.85em;">$${escapeHtml(mathExpr)}$</code>`);
            }
        } else {
            parts.push('$$');
        }

        i = closePos + 1;
    }

    return parts.join('');
}

interface TypstMathPreviewProps {
    text: string;
    className?: string;
}

export default function TypstMathPreview({ text, className = '' }: TypstMathPreviewProps) {
    const [html, setHtml] = useState<string>('');
    const debounceRef = useRef<ReturnType<typeof setTimeout>>();

    const renderPreview = useCallback((input: string) => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            if (!input.includes('$')) {
                setHtml('');
                return;
            }
            setHtml(renderTextWithMath(input));
        }, 150);
    }, []);

    useEffect(() => {
        renderPreview(text);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [text, renderPreview]);

    if (!html) return null;

    return (
        <div
            className={`math-preview text-sm border-t border-dashed border-border pt-2 mt-1 text-text-primary ${className}`}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}
