'use client';

import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { isFolderConnected, saveSettingsToFolder } from '@/utils/folderSync';

export default function DarkModeToggle() {
    const [isDark, setIsDark] = useState(false);
    const [mounted, setMounted] = useState(false);

    // On mount, read preference from localStorage or system preference
    useEffect(() => {
        setMounted(true);
        const stored = localStorage.getItem('darkMode');
        if (stored === 'true') {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        } else if (stored === 'false') {
            setIsDark(false);
            document.documentElement.classList.remove('dark');
        } else {
            // No preference stored — check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setIsDark(prefersDark);
            if (prefersDark) {
                document.documentElement.classList.add('dark');
            }
        }
    }, []);

    const toggle = () => {
        const newValue = !isDark;
        setIsDark(newValue);
        if (newValue) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('darkMode', String(newValue));
        // Sync to connected folder
        if (isFolderConnected()) {
            saveSettingsToFolder({ darkMode: newValue });
        }
    };

    // Prevent flash of wrong icon during SSR
    if (!mounted) {
        return <div className="w-9 h-9" />;
    }

    return (
        <button
            onClick={toggle}
            className="p-2 rounded-lg text-text-secondary hover:text-brand hover:bg-surface-alt transition-colors"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
    );
}
