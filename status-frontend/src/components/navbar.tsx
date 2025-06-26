import Link from 'next/link';
import { Button } from '@/components/ui/button';
import React from 'react';

interface NavbarProps {
  active: 'dashboard' | 'incidents' | 'status';
}

export const Navbar: React.FC<NavbarProps> = ({ active }) => (
  <nav className="flex items-center justify-between h-14 min-h-[66px] px-6 bg-white border-b border-gray-200 shadow-sm w-full">
    {/* Logo/App Name */}
    <Link href="/" className="flex items-center gap-2 text-xl font-bold text-gray-800 hover:text-primary transition-colors">
    <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-gray-200 shadow-sm cursor-pointer" tabIndex={0} aria-label="ClearStatus Home">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="14" cy="14" r="11" stroke="#222" strokeWidth="2" fill="#fff" />
              <path d="M9.5 14.5l3 3 6-6" stroke="#222" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </span>
      <span className="ml-2 font-semibold text-lg text-gray-900 tracking-tight select-none flex items-center h-10">ClearStatus</span>
    </Link>
    {/* Navigation Buttons */}
    <div className="flex gap-2">
      <Link href="/dashboard">
        <Button
          variant={active === 'dashboard' ? 'default' : 'ghost'}
          className={active === 'dashboard' ? 'font-semibold' : ''}
          disabled={active === 'dashboard'}
        >
          Dashboard
        </Button>
      </Link>
      <Link href="/dashboard/incidents">
        <Button
          variant={active === 'incidents' ? 'default' : 'ghost'}
          className={active === 'incidents' ? 'font-semibold' : ''}
          disabled={active === 'incidents'}
        >
          Incidents
        </Button>
      </Link>
      <Link href="/status">
        <Button
          variant={active === 'status' ? 'default' : 'ghost'}
          className={active === 'status' ? 'font-semibold' : ''}
          disabled={active === 'status'}
        >
          Status
        </Button>
      </Link>
    </div>
  </nav>
);
