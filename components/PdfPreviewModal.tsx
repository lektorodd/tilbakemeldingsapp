'use client';

import React, { useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface PdfPreviewModalProps {
    pdfUrl: string | null;
    filename?: string;
    onClose: () => void;
}

export default function PdfPreviewModal({ pdfUrl, filename, onClose }: PdfPreviewModalProps) {
    const { t } = useLanguage();

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (pdfUrl) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [pdfUrl, onClose]);

    if (!pdfUrl) return null;

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = filename || 'feedback.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className="relative w-[95vw] h-[92vh] max-w-5xl bg-surface rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-surface-alt">
                    <h3 className="text-lg font-display font-semibold text-text-primary">
                        {t('test.previewPDF')}
                    </h3>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-2 px-3 py-1.5 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors text-sm"
                        >
                            <Download size={16} />
                            {t('test.downloadPDF')}
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg text-text-secondary hover:bg-surface-alt hover:text-text-primary transition-colors"
                            title={t('test.closePDFPreview')}
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* PDF Viewer */}
                <div className="flex-1 bg-neutral-800">
                    <iframe
                        src={pdfUrl}
                        className="w-full h-full border-0"
                        title="PDF Preview"
                    />
                </div>
            </div>
        </div>
    );
}
