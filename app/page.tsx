'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/courses');
  }, [router]);

  return (
    <main className="min-h-screen bg-surface flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-display font-bold text-text-primary">Loading...</h1>
        <p className="text-text-secondary mt-2">Redirecting to courses...</p>
      </div>
    </main>
  );
}
