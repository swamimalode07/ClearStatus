'use client'

import { useEffect, useState } from 'react'
import { UserButton, useUser, useAuth } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'

// 👉 Change this to your deployed Railway backend when ready
const API_URL = 'http://localhost:8080'

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
  const { getToken } = useAuth()

  const [services, setServices] = useState<Service[]>([])
  const [incidents, setIncidents] = useState<Incident[]>([])

  const [newService, setNewService] = useState('')
  const [newIncident, setNewIncident] = useState('')
  const [newStatus, setNewStatus] = useState<'Operational' | 'Degraded' | 'Outage'>('Operational')

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return
      try {
        const token = await getToken()
        if (!token) throw new Error('❌ No token from Clerk')

        const [servicesRes, incidentsRes] = await Promise.all([
          fetch(`${API_URL}/api/services`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/api/incidents`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])

        if (!servicesRes.ok || !incidentsRes.ok) throw new Error('❌ Failed to fetch')

        const servicesData = await servicesRes.json()
        const incidentsData = await incidentsRes.json()

        setServices(servicesData)
        setIncidents(incidentsData)
      } catch (err) {
        console.error('❌ Fetch error:', err)
      }
    }

    fetchData()
  }, [user, getToken])

  const handleAddService = async () => {
    if (!newService.trim()) return
    try {
      const token = await getToken()
      if (!token) throw new Error('❌ No token from Clerk')

      const res = await fetch(`${API_URL}/api/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newService, status: newStatus }),
      })

      const data = await res.json()
      setServices((prev) => [...prev, data])
      setNewService('')
    } catch (err) {
      console.error('❌ Failed to add service:', err)
    }
  }

  const handleAddIncident = async () => {
    if (!newIncident.trim()) return
    try {
      const token = await getToken()
      if (!token) throw new Error('❌ No token from Clerk')

      const res = await fetch(`${API_URL}/api/incidents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: newIncident, status: newStatus }),
      })

      const data = await res.json()
      setIncidents((prev) => [data, ...prev])
      setNewIncident('')
    } catch (err) {
      console.error('❌ Failed to create incident:', err)
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

      <div className="space-y-4 mb-6">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((s) => (
          <div key={s.id} className="p-4 border rounded-lg">
            <h2 className="font-semibold">{s.name}</h2>
            <p className="text-sm text-muted-foreground">{s.status}</p>
          </div>
        ))}
      </div>

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
