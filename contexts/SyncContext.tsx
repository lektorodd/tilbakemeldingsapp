'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { isFolderConnected, getFolderName } from '@/utils/folderSync';

type SyncStatus = 'idle' | 'syncing' | 'saved' | 'error';

interface SyncContextType {
    status: SyncStatus;
    lastSyncTime: Date | null;
    folderConnected: boolean;
    folderName: string | null;
    /** Call when a sync/save operation starts */
    markSyncing: () => void;
    /** Call when a sync/save operation completes */
    markSaved: () => void;
    /** Call when a sync/save operation fails */
    markError: () => void;
    /** Refresh folder connection status (e.g. after connecting/disconnecting a folder) */
    refreshFolderStatus: () => void;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export function SyncProvider({ children }: { children: React.ReactNode }) {
    const [status, setStatus] = useState<SyncStatus>('idle');
    const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
    const [folderConnected, setFolderConnected] = useState(false);
    const [folderName, setFolderName] = useState<string | null>(null);
    const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Poll folder connection status on mount and periodically
    const refreshFolderStatus = useCallback(() => {
        setFolderConnected(isFolderConnected());
        setFolderName(getFolderName());
    }, []);

    useEffect(() => {
        refreshFolderStatus();
        const interval = setInterval(refreshFolderStatus, 3000);
        return () => clearInterval(interval);
    }, [refreshFolderStatus]);

    const markSyncing = useCallback(() => {
        if (savedTimerRef.current) {
            clearTimeout(savedTimerRef.current);
            savedTimerRef.current = null;
        }
        setStatus('syncing');
    }, []);

    const markSaved = useCallback(() => {
        setStatus('saved');
        setLastSyncTime(new Date());
        // Reset to idle after 3 seconds
        savedTimerRef.current = setTimeout(() => {
            setStatus('idle');
        }, 3000);
    }, []);

    const markError = useCallback(() => {
        setStatus('error');
    }, []);

    return (
        <SyncContext.Provider value={{
            status,
            lastSyncTime,
            folderConnected,
            folderName,
            markSyncing,
            markSaved,
            markError,
            refreshFolderStatus,
        }}>
            {children}
        </SyncContext.Provider>
    );
}

export function useSync() {
    const context = useContext(SyncContext);
    if (!context) {
        throw new Error('useSync must be used within a SyncProvider');
    }
    return context;
}
