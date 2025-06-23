'use client'

import { UserButton } from '@clerk/nextjs'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'

const mockServices = [
  { name: 'Website', status: 'Operational' },
  { name: 'API', status: 'Degraded' },
  { name: 'Database', status: 'Outage' },
]

export default function Dashboard() {
  const { user } = useUser()

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user?.firstName}</h1>
          <p className="text-gray-500">Manage your services here.</p>
        </div>
        <UserButton afterSignOutUrl="/" />
      </div>

      <div className="flex gap-4 mb-4">
        <Button variant="outline">+ Add Service</Button>
        <Button variant="outline">+ Create Incident</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockServices.map((s) => (
          <div key={s.name} className="p-4 border rounded-lg">
            <h2 className="font-semibold">{s.name}</h2>
            <p className="text-sm text-muted-foreground">{s.status}</p>
          </div>
        ))}
      </div>
    </div>
  )
}