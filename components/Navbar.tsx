'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LanguageSelector from './LanguageSelector';
import { Home } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const isHomePage = pathname === '/' || pathname === '/courses';

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo/Home */}
          <div className="flex items-center">
            <Link
              href="/courses"
              className="flex items-center gap-2 text-gray-800 hover:text-blue-600 transition"
            >
              <Home size={20} />
              <span className="font-semibold text-lg">Math Feedback</span>
            </Link>
          </div>

          {/* Right side - Language selector */}
          <div className="flex items-center">
            <LanguageSelector />
          </div>
        </div>
      </div>
    </nav>
  );
}
