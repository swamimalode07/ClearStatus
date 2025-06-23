'use client'

import { UserButton, useUser } from '@clerk/nextjs'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export default function Dashboard() {
  const { user } = useUser()
  const { services, incidents, addService, addIncident } = useStore()

  const [newService, setNewService] = useState('')
  const [newStatus, setNewStatus] = useState<'Operational' | 'Degraded' | 'Outage'>('Operational')
  const [newIncident, setNewIncident] = useState('')

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user?.firstName}</h1>
          <p className="text-gray-500">Manage your services here.</p>
        </div>
        <UserButton afterSignOutUrl="/" />
      </div>

      <div className="space-y-4 mb-6">
        {/* Add Service */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="New Service Name"
            className="border px-2 py-1 rounded"
            value={newService}
            onChange={(e) => setNewService(e.target.value)}
          />
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as any)}
            className="border px-2 py-1 rounded"
          >
            <option value="Operational">Operational</option>
            <option value="Degraded">Degraded</option>
            <option value="Outage">Outage</option>
          </select>
          <Button
            onClick={() => {
              if (newService) {
                addService(newService, newStatus)
                setNewService('')
              }
            }}
          >
            + Add Service
          </Button>
        </div>

        {/* Create Incident */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="New Incident Title"
            className="border px-2 py-1 rounded"
            value={newIncident}
            onChange={(e) => setNewIncident(e.target.value)}
          />
          <Button
            variant="destructive"
            onClick={() => {
              if (newIncident) {
                addIncident(newIncident, newStatus)
                setNewIncident('')
              }
            }}
          >
            + Create Incident
          </Button>
        </div>
      </div>

      {/* Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((s) => (
          <div key={s.id} className="p-4 border rounded-lg">
            <h2 className="font-semibold">{s.name}</h2>
            <p className="text-sm text-muted-foreground">{s.status}</p>
          </div>
        ))}
      </div>

      {/* Incidents */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">Incidents</h2>
        {incidents.map((i) => (
          <div key={i.id} className="p-3 border rounded mb-2">
            <strong>{i.status}</strong> - {i.title} <span className="text-xs">({i.time})</span>
          </div>
        ))}
      </div>
    </div>
  )
}
