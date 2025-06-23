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

const mockServices = [
  { name: 'Website', status: 'Operational' as const },
  { name: 'API', status: 'Degraded' as const },
  { name: 'Database', status: 'Outage' as const },
]

const statusColor: Record<'Operational' | 'Degraded' | 'Outage', string> = {
  Operational: 'text-green-500',
  Degraded: 'text-yellow-500',
  Outage: 'text-red-500',
}

export default function Home() {
  return (
    <main className="max-w-3xl mx-auto py-10 px-4">
      {/* Header with auth buttons or dashboard navigation */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">🔧 Status Page</h1>

        <div className="flex gap-3 items-center">
          {/* Logged out view */}
          <SignedOut>
            <SignInButton mode="modal">
              <Button>Login</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button variant="outline">Sign Up</Button>
            </SignUpButton>
          </SignedOut>

          {/* Logged in view */}
          <SignedIn>
            <Link href="/dashboard">
              <Button variant="secondary">Dashboard</Button>
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>

      {/* Mock Service Statuses */}
      <div className="space-y-4">
        {mockServices.map((service) => (
          <div
            key={service.name}
            className="p-4 border rounded-lg flex justify-between items-center"
          >
            <span>{service.name}</span>
            <span className={`font-semibold ${statusColor[service.status]}`}>
              {service.status}
            </span>
          </div>
        ))}
      </div>
    </main>
  )
}
