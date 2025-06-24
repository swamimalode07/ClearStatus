'use client'

import { useEffect, useState } from 'react'
import { UserButton, useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'

type Service = {
  id: string
  name: string
  status: 'Operational' | 'Degraded' | 'Outage'
}

export default function Dashboard() {
  const { user } = useUser()

  const [services, setServices] = useState<Service[]>([])
  const [newService, setNewService] = useState('')
  const [newStatus, setNewStatus] = useState<'Operational' | 'Degraded' | 'Outage'>('Operational')

  // Load services from Go backend on mount
  useEffect(() => {
    fetch('http://localhost:8080/api/services')
      .then((res) => res.json())
      .then((data) => setServices(data))
      .catch((err) => console.error('Failed to fetch services:', err))
  }, [])

  // Add service via Go backend
  const handleAddService = async () => {
    if (!newService.trim()) return

    try {
      const res = await fetch('http://localhost:8080/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newService, status: newStatus }),
      })

      const data = await res.json()
      setServices((prev) => [...prev, data])
      setNewService('')
    } catch (err) {
      console.error('Failed to add service:', err)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user?.firstName}</h1>
          <p className="text-gray-500">Manage your services here.</p>
        </div>
        <UserButton afterSignOutUrl="/" />
      </div>

      {/* Add Service Form */}
      <div className="flex items-center gap-2 mb-6">
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

      {/* Services List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((s) => (
          <div key={s.id} className="p-4 border rounded-lg">
            <h2 className="font-semibold">{s.name}</h2>
            <p className="text-sm text-muted-foreground">{s.status}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
