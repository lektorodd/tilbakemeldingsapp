'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { isFolderConnected, saveSettingsToFolder } from '@/utils/folderSync';

interface PreferencesContextType {
    showLabels: boolean;
    showCategories: boolean;
    setShowLabels: (value: boolean) => void;
    setShowCategories: (value: boolean) => void;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
    const [showLabels, setShowLabelsState] = useState(true);
    const [showCategories, setShowCategoriesState] = useState(true);

    // Load preferences from localStorage on mount
    useEffect(() => {
        const storedLabels = localStorage.getItem('preferences-showLabels');
        const storedCategories = localStorage.getItem('preferences-showCategories');
        if (storedLabels !== null) setShowLabelsState(storedLabels !== 'false');
        if (storedCategories !== null) setShowCategoriesState(storedCategories !== 'false');
    }, []);

    const setShowLabels = (value: boolean) => {
        setShowLabelsState(value);
        if (typeof window !== 'undefined') {
            localStorage.setItem('preferences-showLabels', String(value));
        }
        if (isFolderConnected()) {
            saveSettingsToFolder({ showLabels: value });
        }
    };

    const setShowCategories = (value: boolean) => {
        setShowCategoriesState(value);
        if (typeof window !== 'undefined') {
            localStorage.setItem('preferences-showCategories', String(value));
        }
        if (isFolderConnected()) {
            saveSettingsToFolder({ showCategories: value });
        }
    };

    return (
        <PreferencesContext.Provider value={{ showLabels, showCategories, setShowLabels, setShowCategories }}>
            {children}
        </PreferencesContext.Provider>
    );
}

export function usePreferences() {
    const context = useContext(PreferencesContext);
    if (!context) {
        throw new Error('usePreferences must be used within a PreferencesProvider');
    }
    return context;
}
