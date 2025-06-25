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
import { ServiceTable, Service } from '@/components/service-table'
import { ServiceDialog } from '@/components/service-dialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

import { Navbar } from '@/components/navbar'

const API = 'http://localhost:8080/api'

type Status = 'Operational' | 'Degraded' | 'Outage'

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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selected, setSelected] = useState<Service | null>(null)

  // Fetch services
  const fetchServices = async () => {
    if (!organization) return
    setLoading(true)
    setError(null)
    try {
      const token = await getToken({
        template: 'status_jwt',
        organizationId: organization?.id,
      })
      if (!token) throw new Error('No token')
      const res = await fetch(`${API}/services`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to fetch services')
      const data = await res.json()
      setServices(Array.isArray(data) ? data : [])
    } catch (e: any) {
      setError(e.message || 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organization])

  // Add service
  const handleAdd = async (input: { name: string; status: Service["status"] }) => {
    setLoading(true)
    setError(null)
    try {
      const token = await getToken({
        template: 'status_jwt',
        organizationId: organization?.id,
      })
      if (!token) throw new Error('No token')
      const res = await fetch(`${API}/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(input),
      })
      if (!res.ok) throw new Error('Failed to add service')
      setAddOpen(false)
      fetchServices()
    } catch (e: any) {
      setError(e.message || 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  // Edit service
  const handleEdit = async (input: { name: string; status: Service["status"] }) => {
    if (!selected) return
    setLoading(true)
    setError(null)
    try {
      const token = await getToken({
        template: 'status_jwt',
        organizationId: organization?.id,
      })
      if (!token) throw new Error('No token')
      const res = await fetch(`${API}/services/${selected.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(input),
      })
      if (!res.ok) throw new Error('Failed to update service')
      setEditOpen(false)
      setSelected(null)
      fetchServices()
    } catch (e: any) {
      setError(e.message || 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  // Delete service
  const handleDelete = async () => {
    if (!selected) return
    setLoading(true)
    setError(null)
    try {
      const token = await getToken({
        template: 'status_jwt',
        organizationId: organization?.id,
      })
      if (!token) throw new Error('No token')
      const res = await fetch(`${API}/services/${selected.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to delete service')
      setDeleteOpen(false)
      setSelected(null)
      fetchServices()
    } catch (e: any) {
      setError(e.message || 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar active="dashboard" />
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

        {/* Add Service Button */}
        <div className="mb-6">
          <Button onClick={() => setAddOpen(true)}>+ Add Service</Button>
        </div>

        {/* Error */}
        {error && <div className="text-red-600 mb-4">{error}</div>}

        {/* Service Table */}
        <div className="mb-8">
          <ServiceTable
            services={services}
            onEdit={(service) => {
              setSelected(service)
              setEditOpen(true)
            }}
            onDelete={(service) => {
              setSelected(service)
              setDeleteOpen(true)
            }}
          />
          {loading && <div className="text-gray-500 mt-2">Loading...</div>}
        </div>

        {/* Add Dialog */}
        <ServiceDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          onSubmit={handleAdd}
          loading={loading}
          error={error}
        />

        {/* Edit Dialog */}
        <ServiceDialog
          open={editOpen}
          onOpenChange={(open) => {
            setEditOpen(open)
            if (!open) setSelected(null)
          }}
          onSubmit={handleEdit}
          initialData={selected ? { name: selected.name, status: selected.status } : undefined}
          loading={loading}
          error={error}
        />

        {/* Delete Dialog */}
        <Dialog open={deleteOpen} onOpenChange={(open) => {
          setDeleteOpen(open)
          if (!open) setSelected(null)
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Service</DialogTitle>
            </DialogHeader>
            <div>Are you sure you want to delete <b>{selected?.name}</b>?</div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={loading}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete} disabled={loading}>Delete</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}
