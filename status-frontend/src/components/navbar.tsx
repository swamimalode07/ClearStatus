import Link from 'next/link';
import { Button } from '@/components/ui/button';
import React from 'react';

interface NavbarProps {
  active: 'dashboard' | 'incidents' | 'status';
}

export const Navbar: React.FC<NavbarProps> = ({ active }) => (
  <nav className="flex items-center justify-between h-14 min-h-[56px] px-6 bg-white border-b border-gray-200 shadow-sm w-full">
    {/* Logo/App Name */}
    <Link href="/" className="flex items-center gap-2 text-xl font-bold text-gray-800 hover:text-primary transition-colors">
      <span role="img" aria-label="Wrench">🔧</span>
      StatusApp
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
