import React from 'react';
import { Sidebar } from './Sidebar';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-slate-50 antialiased font-sans">
      <Sidebar />
      <main className="flex-1 overflow-y-auto w-full">
        <div className="w-full h-full max-w-7xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
