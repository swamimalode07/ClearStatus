'use client'

import { useEffect, useState } from 'react'
import { UserButton, useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'

type Service = {
  id: string
  name: string
  status: 'Operational' | 'Degraded' | 'Outage'
}

type Incident = {
  id: string
  title: string
  status: 'Operational' | 'Degraded' | 'Outage'
  time: string
}

export default function Dashboard() {
  const { user } = useUser()

  const [services, setServices] = useState<Service[]>([])
  const [incidents, setIncidents] = useState<Incident[]>([])

  const [newService, setNewService] = useState('')
  const [newIncident, setNewIncident] = useState('')
  const [newStatus, setNewStatus] = useState<'Operational' | 'Degraded' | 'Outage'>('Operational')

  // Fetch services and incidents
  useEffect(() => {
    fetch('http://localhost:8080/api/services')
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text())
        return res.json()
      })
      .then(setServices)
      .catch((err) => console.error('❌ Failed to fetch services:', err))

    fetch('http://localhost:8080/api/incidents')
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text())
        return res.json()
      })
      .then(setIncidents)
      .catch((err) => console.error('❌ Failed to fetch incidents:', err))
  }, [])

  // Add service
  const handleAddService = async () => {
    if (!newService.trim()) return

    try {
      const res = await fetch('http://localhost:8080/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newService, status: newStatus }),
      })

      if (!res.ok) throw new Error(await res.text())

      const data = await res.json()
      setServices((prev) => [...prev, data])
      setNewService('')
    } catch (err) {
      console.error('❌ Failed to add service:', err)
    }
  }

  // Add incident
  const handleAddIncident = async () => {
    if (!newIncident.trim()) return

    try {
      const res = await fetch('http://localhost:8080/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newIncident, status: newStatus }),
      })

      if (!res.ok) throw new Error(await res.text())

      const data = await res.json()
      setIncidents((prev) => [data, ...prev])
      setNewIncident('')
    } catch (err) {
      console.error('❌ Failed to create incident:', err)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user?.firstName}</h1>
          <p className="text-gray-500">Manage your services here.</p>
        </div>
        <UserButton afterSignOutUrl="/" />
      </div>

      {/* Controls */}
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
            onChange={(e) => setNewStatus(e.target.value as Service['status'])}
            className="border px-2 py-1 rounded"
          >
            <option value="Operational">Operational</option>
            <option value="Degraded">Degraded</option>
            <option value="Outage">Outage</option>
          </select>
          <Button onClick={handleAddService}>+ Add Service</Button>
        </div>

        {/* Add Incident */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="New Incident Title"
            className="border px-2 py-1 rounded"
            value={newIncident}
            onChange={(e) => setNewIncident(e.target.value)}
          />
          <Button variant="destructive" onClick={handleAddIncident}>
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
            <strong>{i.status}</strong> – {i.title}{' '}
            <span className="text-xs text-gray-500">
              ({new Date(i.time).toLocaleString()})
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
