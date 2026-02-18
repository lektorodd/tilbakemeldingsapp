'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { initFolderSync, isFolderConnected, getFolderName } from '@/utils/folderSync';
import { syncFromFolder } from '@/utils/storage';
import { syncSnippetsFromFolder } from '@/utils/snippetStorage';

type SyncStatus = 'idle' | 'syncing' | 'saved' | 'error';

interface SyncContextType {
    status: SyncStatus;
    lastSyncTime: Date | null;
    folderConnected: boolean;
    folderName: string | null;
    /** True once the initial folder-sync attempt has completed (whether connected or not) */
    folderInitDone: boolean;
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
    const [folderInitDone, setFolderInitDone] = useState(false);
    const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const initRanRef = useRef(false);

    // Run folder sync init once on app startup
    useEffect(() => {
        if (initRanRef.current) return;
        initRanRef.current = true;

        (async () => {
            try {
                const connected = await initFolderSync();
                setFolderConnected(connected);
                setFolderName(getFolderName());

                if (connected) {
                    // Sync data from folder → localStorage
                    await syncFromFolder();
                    await syncSnippetsFromFolder();
                    // Sync language/settings
                    const { loadSettingsFromFolder } = await import('@/utils/folderSync');
                    const settings = await loadSettingsFromFolder();
                    if (settings?.language) {
                        localStorage.setItem('language', settings.language);
                    }
                }
            } catch (e) {
                console.error('Failed to init folder sync:', e);
            } finally {
                setFolderInitDone(true);
            }
        })();
    }, []);

    // Poll folder connection status periodically (handles connect/disconnect from other pages)
    const refreshFolderStatus = useCallback(() => {
        setFolderConnected(isFolderConnected());
        setFolderName(getFolderName());
    }, []);

    useEffect(() => {
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
            folderInitDone,
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
