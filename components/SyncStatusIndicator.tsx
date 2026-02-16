'use client';

import React, { useState } from 'react';
import { useSync } from '@/contexts/SyncContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Cloud, CloudOff, Loader2, Check, AlertTriangle } from 'lucide-react';

export default function SyncStatusIndicator() {
    const { status, lastSyncTime, folderConnected, folderName } = useSync();
    const { t } = useLanguage();
    const [showTooltip, setShowTooltip] = useState(false);

    const getIcon = () => {
        if (!folderConnected) return <CloudOff size={16} />;
        if (status === 'syncing') return <Loader2 size={16} className="animate-spin" />;
        if (status === 'saved') return <Check size={16} />;
        if (status === 'error') return <AlertTriangle size={16} />;
        return <Cloud size={16} />;
    };

    const getColor = () => {
        if (!folderConnected) return 'text-amber-500';
        if (status === 'syncing') return 'text-blue-500';
        if (status === 'saved') return 'text-emerald-500';
        if (status === 'error') return 'text-red-500';
        return 'text-emerald-500';
    };

    const getLabel = () => {
        if (!folderConnected) return t('sync.notConnected');
        if (status === 'syncing') return t('sync.syncing');
        if (status === 'saved') return t('sync.saved');
        if (status === 'error') return t('sync.error');
        return t('sync.connected');
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div
            className="relative"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            <button
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${getColor()} hover:bg-surface-alt`}
                onClick={() => setShowTooltip(!showTooltip)}
            >
                {getIcon()}
                <span className="hidden sm:inline">{getLabel()}</span>
            </button>

            {showTooltip && (
                <div className="absolute right-0 top-full mt-1.5 w-56 bg-surface border border-border rounded-lg shadow-lg p-3 z-50">
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                            <span className={getColor()}>{getIcon()}</span>
                            <span className="font-medium text-text-primary">{getLabel()}</span>
                        </div>
                        {folderConnected && folderName && (
                            <div className="text-text-secondary truncate">
                                📁 {folderName}
                            </div>
                        )}
                        {lastSyncTime && (
                            <div className="text-text-disabled text-xs">
                                {t('sync.lastSync')}: {formatTime(lastSyncTime)}
                            </div>
                        )}
                        {!folderConnected && (
                            <p className="text-text-secondary text-xs leading-relaxed">
                                {t('sync.connectHint')}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
