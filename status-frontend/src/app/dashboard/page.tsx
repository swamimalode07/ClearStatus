'use client'

import { useEffect, useState } from 'react'
import {
  useUser,
  useAuth,
  useOrganization,
  UserButton,
  OrganizationSwitcher
} from '@clerk/nextjs'
import { Button } from '@/components/ui/button'

const API = 'http://localhost:8080/api'

type Status = 'Operational' | 'Degraded' | 'Outage'

interface Service {
  id: string
  name: string
  status: Status
  organizationId: string
}

interface Incident {
  id: string
  title: string
  status: Status
  time: string
  organizationId: string
}

export default function Dashboard() {
  const { user } = useUser()
  const { organization } = useOrganization()
  const { getToken } = useAuth()

  const [services, setServices] = useState<Service[]>([])
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [newService, setNewService] = useState('')
  const [newIncident, setNewIncident] = useState('')
  const [newStatus, setNewStatus] = useState<Status>('Operational')

// Update your debug useEffect
useEffect(() => {
  (async () => {
    console.log('Current organization:', organization?.id, organization?.name);
    const token = await getToken({ 
      template: 'status_jwt',
      organizationId: organization?.id 
    });
    console.log('🏷 raw JWT:', token);
    if (token) {
      try {
        const [, payload] = token.split('.');
        const decoded = JSON.parse(atob(payload));
        console.log('📋 decoded JWT claims:', decoded);
        console.log('🔑 org_id claim:', decoded.org_id);
        console.log('🔑 Current org in component:', organization?.id);
      } catch (err) {
        console.warn('⚠️ Could not decode JWT:', err);
      }
    }
  })();
}, [getToken, organization]); // Add organization to dependencies
  // Fetch services and incidents for current org
  const fetchData = async () => {
    if (!organization) return
const token = await getToken({ 
  template: 'status_jwt',
  organizationId: organization?.id // Make sure to pass the current org ID
});

    if (!token) return

    try {
      const headers = { Authorization: `Bearer ${token}` }

      const [servicesRes, incidentsRes] = await Promise.all([
        fetch(`${API}/services`, { headers }),
        fetch(`${API}/incidents`, { headers })
      ])

      const servicesData = await servicesRes.json()
      const incidentsData = await incidentsRes.json()

      setServices(Array.isArray(servicesData) ? servicesData : [])
      setIncidents(Array.isArray(incidentsData) ? incidentsData : [])
    } catch (error) {
      console.error('❌ Fetch error:', error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [organization])

  const handleAddService = async () => {
    if (!newService.trim()) return

const token = await getToken({ 
  template: 'status_jwt',
  organizationId: organization?.id 
});
    if (!token) return

    await fetch(`${API}/services`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name: newService, status: newStatus })
    })

    setNewService('')
    fetchData()
  }

  const handleAddIncident = async () => {
    if (!newIncident.trim()) return
const token = await getToken({ 
  template: 'status_jwt',
  organizationId: organization?.id 
});
    if (!token) return

    await fetch(`${API}/incidents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ title: newIncident, status: newStatus })
    })

    setNewIncident('')
    fetchData()
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user?.firstName}</h1>
          <p className="text-gray-500">Manage your services here.</p>
        </div>
        <div className="flex gap-3 items-center">
          <OrganizationSwitcher />
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>

      {/* Add Controls */}
      <div className="space-y-4 mb-6">
        {/* Service Form */}
        <div className="flex gap-2">
          <input
            className="border px-2 py-1 rounded"
            placeholder="New Service"
            value={newService}
            onChange={(e) => setNewService(e.target.value)}
          />
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as Status)}
            className="border px-2 py-1 rounded"
          >
            <option value="Operational">Operational</option>
            <option value="Degraded">Degraded</option>
            <option value="Outage">Outage</option>
          </select>
          <Button onClick={handleAddService}>+ Add Service</Button>
        </div>

        {/* Incident Form */}
        <div className="flex gap-2">
          <input
            className="border px-2 py-1 rounded"
            placeholder="New Incident"
            value={newIncident}
            onChange={(e) => setNewIncident(e.target.value)}
          />
          <Button variant="destructive" onClick={handleAddIncident}>
            + Add Incident
          </Button>
        </div>
      </div>

      {/* Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((s) => (
          <div key={s.id} className="p-4 border rounded">
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
