'use client'

import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs"
import { Navbar } from '@/components/navbar'
import Image from "next/image"
import { useEffect, useState } from 'react'

const mockServices = [
  { name: 'Website', status: 'Operational' as const },
  { name: 'API', status: 'Degraded' as const },
  { name: 'Database', status: 'Outage' as const },
]

const statusColor: Record<'Operational' | 'Degraded' | 'Outage', string> = {
  Operational: 'bg-green-100 text-green-800 border-green-200',
  Degraded: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Outage: 'bg-red-100 text-red-800 border-red-200',
}

const statusDot: Record<'Operational' | 'Degraded' | 'Outage', string> = {
  Operational: 'bg-green-400',
  Degraded: 'bg-yellow-400',
  Outage: 'bg-red-500',
}

export default function Home() {
  // Fix hydration mismatch: use client-side year
  const [year, setYear] = useState<number | null>(null);
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  // Move navbar shadow logic to useEffect
  useEffect(() => {
    const nav = document.getElementById('navbar');
    if (!nav) return;
    const onScroll = () => {
      if (window.scrollY > 8) {
        nav.classList.add('shadow-md');
      } else {
        nav.classList.remove('shadow-md');
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col bg-white">
      {/* Sticky Navbar with shadow on scroll */}
      <nav id="navbar" className="w-full flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b bg-white/80 backdrop-blur z-10 transition-shadow duration-300 sticky top-0">
        <div className="flex items-center gap-2">
          {/* Minimal checkmark-in-circle logo for ClearStatus */}
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-gray-200 shadow-sm cursor-pointer" tabIndex={0} aria-label="ClearStatus Home">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="14" cy="14" r="11" stroke="#222" strokeWidth="2" fill="#fff" />
              <path d="M9.5 14.5l3 3 6-6" stroke="#222" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </span>
          <span className="ml-2 font-semibold text-lg text-gray-900 tracking-tight select-none flex items-center h-10">ClearStatus</span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium text-gray-700">
          <a href="#features" className="hover:text-black transition-colors">Features</a>
          <a
  href="https://youtu.be/MzEFeIRJ0eQ?si=Ns70xAk6MsLpeiCO"
  target="_blank"
  rel="noopener noreferrer"
  className="hover:text-black transition-colors"
>
  How it Works
</a>

         
        </div>
        <div>
          <div className="flex gap-2 items-center">
            <Link href="/dashboard">
              <Button size="sm" className="bg-black text-white hover:bg-gray-900 px-5 py-2 rounded-full font-semibold shadow-none transition-transform duration-200 hover:scale-105">Get Started</Button>
            </Link>
            <SignedOut>
              <SignInButton mode="modal">
                <Button size="sm" variant="outline" className="px-5 py-2 rounded-full font-semibold shadow-none border-gray-300 text-gray-900 bg-white hover:bg-gray-100 transition-transform duration-200 hover:scale-105">Sign in</Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </nav>
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-2 sm:px-4 py-12 md:py-20 lg:py-24 bg-white relative fade-in-page">
        <div className="flex flex-col items-center w-full max-w-xl md:max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight text-center text-gray-900 mb-3 leading-tight animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
            Effortless Status Pages for <span className="text-gray-400">SaaS Teams</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-500 font-normal mb-8 text-center max-w-md md:max-w-xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.25s', animationFillMode: 'both' }}>
            Communicate incidents, maintenance, and uptime in real time. Multi-tenant, beautiful, and reliable. Keep your users informed and build trust with a modern, customizable status page for your product.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center w-full mb-10 animate-fade-in-up" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
            <Link href="/dashboard">
              <Button size="lg" className="bg-black text-white hover:bg-gray-900 px-8 py-3 rounded-full font-semibold shadow-none w-full sm:w-auto transition-transform duration-200 hover:scale-105 focus:scale-95">Get Started</Button>
            </Link>
            <a
  href="https://youtu.be/MzEFeIRJ0eQ?si=Ns70xAk6MsLpeiCO"
  target="_blank"
  rel="noopener noreferrer"
>
  <Button
    size="lg"
    variant="outline"
    className="border-gray-300 text-gray-900 bg-white hover:bg-gray-100 px-8 py-3 rounded-full font-semibold w-full sm:w-auto transition-transform duration-200 hover:scale-105 focus:scale-95"
  >
    Watch Demo
  </Button>
</a>

          </div>
        </div>
        {/* Service Preview */}
        <div className="flex flex-col items-center mt-8 w-full">
          <span className="text-sm text-gray-400 mb-4 animate-fade-in-up" style={{ animationDelay: '0.55s', animationFillMode: 'both' }}>Live Service Preview</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-2xl px-2">
            {mockServices.map((service, idx) => (
              <div
                key={service.name}
                className={
                  `rounded-xl border border-gray-200 bg-white shadow-sm p-5 flex flex-col items-center gap-2 transition-all duration-200 ` +
                  `hover:scale-105 hover:shadow-lg hover:border-gray-400 group animate-fade-in-up`
                }
                style={{ animationDelay: `${0.7 + idx * 0.12}s`, animationFillMode: 'both' }}
                tabIndex={0}
                aria-label={`Service: ${service.name}, Status: ${service.status}`}
              >
                <span className="text-base font-medium mb-1 text-gray-900">{service.name}</span>
                <span className={`flex items-center gap-2 text-sm font-semibold px-3 py-1 rounded-full border ${statusColor[service.status]} transition-all duration-200`}> 
                  <span className={`inline-block w-2 h-2 rounded-full ${statusDot[service.status]}`} aria-label={service.status}></span>
                  {service.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
      {/* Features Section */}
      <section id="features" className="w-full bg-gradient-to-b from-gray-50 via-white to-gray-100 py-14 sm:py-20 md:py-24 px-2 sm:px-4 border-t relative overflow-hidden">
        <div className="max-w-5xl mx-auto flex flex-col items-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 text-center animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
            Everything You Need for a World-Class Status Page
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-500 mb-10 sm:mb-14 text-center animate-fade-in-up" style={{ animationDelay: '0.18s', animationFillMode: 'both' }}>
            Powerful, reliable, and beautiful—built for SaaS teams who care about uptime and trust.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-10 w-full">
            {/* Feature 1 */}
            <div className="group flex flex-col min-h-[340px] md:min-h-[360px] p-6 sm:p-8 md:p-10 bg-white border border-gray-200 rounded-2xl shadow-sm animate-fade-in-up transition-all duration-300 hover:shadow-xl hover:border-gray-400 relative">
              <div className="flex flex-col flex-1 items-center justify-center text-center">
                <span className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gray-50 border border-gray-200 mb-4 sm:mb-6 -mt-10 transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-lg group-hover:border-gray-300 ">
                  {/* Real-Time Updates Icon */}
                  <svg aria-label="Real-Time Updates Icon" width="36" height="36" fill="none" viewBox="0 0 36 36" className="text-gray-900 group-hover:text-black transition-colors duration-300">
                    <circle cx="18" cy="18" r="16" stroke="currentColor" strokeWidth="2.5" fill="none" />
                    <path d="M18 10v8l6 3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 text-center">Real-Time Status Updates</h3>
                <div className="w-8 h-0.5 bg-gray-200 mb-2 sm:mb-3 mx-auto" />
                <p className="text-gray-500 text-center min-h-[56px]">Instantly broadcast incidents, maintenance, and recovery to your users with blazing-fast real-time updates.</p>
              </div>
            </div>
            {/* Feature 2 */}
            <div className="group flex flex-col min-h-[340px] md:min-h-[360px] p-6 sm:p-8 md:p-10 bg-white border border-gray-200 rounded-2xl shadow-sm animate-fade-in-up transition-all duration-300 hover:shadow-xl hover:border-gray-400 relative">
              <div className="flex flex-col flex-1 items-center justify-center text-center">
                <span className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gray-50 border border-gray-200 mb-4 sm:mb-6 transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-lg group-hover:border-gray-300">
                  {/* Multi-Tenant Icon */}
                  <svg aria-label="Multi-Tenant Icon" width="36" height="36" fill="none" viewBox="0 0 36 36" className="text-gray-900 group-hover:text-black transition-colors duration-300">
                    <rect x="6" y="12" width="24" height="14" rx="4" stroke="currentColor" strokeWidth="2.5" fill="none" />
                    <circle cx="12" cy="19" r="2" fill="currentColor" />
                    <circle cx="24" cy="19" r="2" fill="currentColor" />
                  </svg>
                </span>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 text-center">Multi-Tenant Organizations</h3>
                <div className="w-8 h-0.5 bg-gray-200 mb-2 sm:mb-3 mx-auto" />
                <p className="text-gray-500 text-center min-h-[56px]">Each team or company gets their own secure, isolated status page and dashboard—perfect for SaaS and agencies.</p>
              </div>
            </div>
            {/* Feature 3 */}
            <div className="group flex flex-col min-h-[340px] md:min-h-[360px] p-6 sm:p-8 md:p-10 bg-white border border-gray-200 rounded-2xl shadow-sm animate-fade-in-up transition-all duration-300 hover:shadow-xl hover:border-gray-400 relative">
              <div className="flex flex-col flex-1 items-center justify-center text-center">
                <span className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gray-50 border border-gray-200 mb-4 sm:mb-6 transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-lg group-hover:border-gray-300">
                  {/* Effortless Management Icon */}
                  <svg aria-label="Effortless Management Icon" width="36" height="36" fill="none" viewBox="0 0 36 36" className="text-gray-900 group-hover:text-black transition-colors duration-300">
                    <rect x="10" y="10" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="2.5" fill="none" />
                    <path d="M18 14v4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="18" cy="22" r="1.5" fill="currentColor" />
                  </svg>
                </span>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 text-center">Effortless Service & Incident Management</h3>
                <div className="w-8 h-0.5 bg-gray-200 mb-2 sm:mb-3 mx-auto" />
                <p className="text-gray-500 text-center min-h-[56px]">Add, update, and resolve incidents or maintenance with just a few clicks. Designed for speed and clarity.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="w-full py-5 text-center text-xs text-gray-400 border-t border-gray-200 bg-white/90 mt-auto">
        &copy; {year ? year : ''} ClearStatus. Effortless status pages for SaaS. Built with Next.js &amp; shadcn/ui. {' '}
        <a href="https://github.com/" className="underline hover:text-gray-600" target="_blank" rel="noopener noreferrer">GitHub</a>
      </footer>
    </div>
  )
}
