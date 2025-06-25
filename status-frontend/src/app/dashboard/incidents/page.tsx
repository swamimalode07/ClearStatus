'use client'

// Incidents Dashboard Page
import React, { useEffect, useState } from 'react';
import { useAuth, useOrganization } from '@clerk/nextjs';
import { IncidentTable } from '@/components/incident-table';
import { Button } from '@/components/ui/button';
import { IncidentForm } from '@/components/incident-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Navbar } from '@/components/navbar'

const API = 'http://localhost:8080/api';

// Placeholder types
interface Service {
  id: string;
  name: string;
  status: string;
  organizationId: string;
}
interface Incident {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  isResolved: boolean;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  services: Service[];
  updates: { id: string; message: string; createdAt: string }[];
}

const IncidentsPage = () => {
  const { getToken } = useAuth();
  const { organization } = useOrganization();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [resolveLoading, setResolveLoading] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateMessage, setUpdateMessage] = useState('');
  const [updatesOpen, setUpdatesOpen] = useState(false);

  const fetchData = async () => {
    if (!organization) return;
    setLoading(true);
    setError(null);
    try {
      const token = await getToken({
        template: 'status_jwt',
        organizationId: organization.id,
      });
      if (!token) throw new Error('No token');
      const [incidentsRes, servicesRes] = await Promise.all([
        fetch(`${API}/incidents`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/services`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (!incidentsRes.ok || !servicesRes.ok) throw new Error('Failed to fetch data');
      const incidentsData = await incidentsRes.json();
      const servicesData = await servicesRes.json();
      setIncidents(Array.isArray(incidentsData) ? incidentsData : []);
      setServices(Array.isArray(servicesData) ? servicesData : []);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organization, getToken]);

  useEffect(() => {
    if (!organization) return;
    // SSE connection for real-time updates
    const sse = new EventSource(`${API}/stream`, { withCredentials: true });
    sse.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        let msg = '';
        if (data.event === 'service_created') msg = 'A service was created.';
        else if (data.event === 'service_updated') msg = 'A service was updated.';
        else if (data.event === 'service_deleted') msg = 'A service was deleted.';
        else if (data.event === 'incident_created') msg = 'A new incident was created.';
        else if (data.event === 'incident_updated') msg = 'An incident was updated.';
        else if (data.event === 'incident_update_added') msg = 'An incident update was added.';
        if (msg) toast.info(msg);
      } catch {}
      // Always refresh data
      fetchData();
    };
    sse.onerror = () => {
      sse.close();
      toast.error('Lost real-time connection. Trying to reconnect...');
      // Optionally, try to reconnect after a delay
      setTimeout(() => window.location.reload(), 3000);
    };
    return () => {
      sse.close();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organization]);

  const handleAddIncident = async (data: {
    title: string;
    description: string;
    type: string;
    status: string;
    serviceIds: string[];
  }) => {
    setAddLoading(true);
    setAddError(null);
    try {
      const token = await getToken({
        template: 'status_jwt',
        organizationId: organization?.id,
      });
      if (!token) throw new Error('No token');
      const res = await fetch(`${API}/incidents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create incident');
      setAddOpen(false);
      toast.success('Incident created!');
      // Refresh incidents
      const incidentsRes = await fetch(`${API}/incidents`, { headers: { Authorization: `Bearer ${token}` } });
      const incidentsData = await incidentsRes.json();
      setIncidents(Array.isArray(incidentsData) ? incidentsData : []);
    } catch (err: any) {
      setAddError(err.message || 'Unknown error');
      toast.error('Failed to create incident');
    } finally {
      setAddLoading(false);
    }
  };

  const handleEditIncident = async (data: {
    id?: string;
    title: string;
    description: string;
    type: string;
    status: string;
    serviceIds: string[];
  }) => {
    if (!data.id) return;
    setEditLoading(true);
    setEditError(null);
    try {
      const token = await getToken({
        template: 'status_jwt',
        organizationId: organization?.id,
      });
      if (!token) throw new Error('No token');
      const res = await fetch(`${API}/incidents/${data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          type: data.type,
          status: data.status,
          serviceIds: data.serviceIds,
          isResolved: selectedIncident?.isResolved || false,
        }),
      });
      if (!res.ok) throw new Error('Failed to update incident');
      setEditOpen(false);
      setSelectedIncident(null);
      toast.success('Incident updated!');
      // Refresh incidents
      const incidentsRes = await fetch(`${API}/incidents`, { headers: { Authorization: `Bearer ${token}` } });
      const incidentsData = await incidentsRes.json();
      setIncidents(Array.isArray(incidentsData) ? incidentsData : []);
    } catch (err: any) {
      setEditError(err.message || 'Unknown error');
      toast.error('Failed to update incident');
    } finally {
      setEditLoading(false);
    }
  };

  const handleResolveIncident = async () => {
    if (!selectedIncident) return;
    setResolveLoading(true);
    setResolveError(null);
    try {
      const token = await getToken({
        template: 'status_jwt',
        organizationId: organization?.id,
      });
      if (!token) throw new Error('No token');
      const res = await fetch(`${API}/incidents/${selectedIncident.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: selectedIncident.title,
          description: selectedIncident.description,
          type: selectedIncident.type,
          status: selectedIncident.status,
          serviceIds: selectedIncident.services.map(s => s.id),
          isResolved: true,
        }),
      });
      if (!res.ok) throw new Error('Failed to resolve incident');
      setResolveOpen(false);
      setSelectedIncident(null);
      toast.success('Incident resolved!');
      // Refresh incidents
      const incidentsRes = await fetch(`${API}/incidents`, { headers: { Authorization: `Bearer ${token}` } });
      const incidentsData = await incidentsRes.json();
      setIncidents(Array.isArray(incidentsData) ? incidentsData : []);
    } catch (err: any) {
      setResolveError(err.message || 'Unknown error');
      toast.error('Failed to resolve incident');
    } finally {
      setResolveLoading(false);
    }
  };

  const handleAddUpdate = async () => {
    if (!selectedIncident || !updateMessage.trim()) return;
    setUpdateLoading(true);
    setUpdateError(null);
    try {
      const token = await getToken({
        template: 'status_jwt',
        organizationId: organization?.id,
      });
      if (!token) throw new Error('No token');
      const res = await fetch(`${API}/incidents/${selectedIncident.id}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: updateMessage }),
      });
      if (!res.ok) throw new Error('Failed to add update');
      setUpdateOpen(false);
      setSelectedIncident(null);
      setUpdateMessage('');
      toast.success('Update added!');
      // Refresh incidents
      const incidentsRes = await fetch(`${API}/incidents`, { headers: { Authorization: `Bearer ${token}` } });
      const incidentsData = await incidentsRes.json();
      setIncidents(Array.isArray(incidentsData) ? incidentsData : []);
    } catch (err: any) {
      setUpdateError(err.message || 'Unknown error');
      toast.error('Failed to add update');
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <>
      <Navbar active="incidents" />
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Incidents & Maintenance</h1>
        <div className="mb-4">
          <Button onClick={() => setAddOpen(true)} variant="default">+ Add Incident</Button>
        </div>
        {loading && <div>Loading...</div>}
        {error && <div className="text-red-500">{error}</div>}
        <div className="mt-6">
          <IncidentTable
            incidents={incidents}
            services={services}
            onEdit={(incident) => {
              setSelectedIncident(incident);
              setEditOpen(true);
            }}
            onResolve={(incident) => {
              setSelectedIncident(incident);
              setResolveOpen(true);
            }}
            onAddUpdate={(incident) => {
              setSelectedIncident(incident);
              setUpdateOpen(true);
            }}
            onViewUpdates={(incident) => {
              setSelectedIncident(incident);
              setUpdatesOpen(true);
            }}
          />
        </div>
        <IncidentForm
          open={addOpen}
          onOpenChange={setAddOpen}
          onSubmit={handleAddIncident}
          loading={addLoading}
          error={addError}
          services={services}
        />
        <IncidentForm
          open={editOpen}
          onOpenChange={(open) => { setEditOpen(open); if (!open) setSelectedIncident(null); }}
          onSubmit={handleEditIncident}
          loading={editLoading}
          error={editError}
          services={services}
          initialIncident={selectedIncident}
        />
        <Dialog open={resolveOpen} onOpenChange={(open) => { setResolveOpen(open); if (!open) setSelectedIncident(null); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Resolve Incident</DialogTitle>
            </DialogHeader>
            <div className="mb-4">Are you sure you want to mark this incident as resolved?</div>
            {resolveError && <div className="text-red-500 text-sm mb-2">{resolveError}</div>}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setResolveOpen(false)} disabled={resolveLoading}>Cancel</Button>
              <Button variant="default" onClick={handleResolveIncident} disabled={resolveLoading}>
                {resolveLoading ? 'Resolving...' : 'Resolve'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={updateOpen} onOpenChange={(open) => { setUpdateOpen(open); if (!open) { setSelectedIncident(null); setUpdateMessage(''); setUpdateError(null); } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Update</DialogTitle>
            </DialogHeader>
            <form onSubmit={e => { e.preventDefault(); handleAddUpdate(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Update Message</label>
                <textarea
                  className="w-full border rounded px-2 py-1 min-h-[80px]"
                  value={updateMessage}
                  onChange={e => setUpdateMessage(e.target.value)}
                  disabled={updateLoading}
                  required
                />
              </div>
              {updateError && <div className="text-red-500 text-sm mb-2">{updateError}</div>}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setUpdateOpen(false)} disabled={updateLoading}>Cancel</Button>
                <Button type="submit" variant="default" disabled={updateLoading || !updateMessage.trim()}>
                  {updateLoading ? 'Adding...' : 'Add Update'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        <Dialog open={updatesOpen} onOpenChange={(open) => { setUpdatesOpen(open); if (!open) setSelectedIncident(null); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Incident Details & Timeline</DialogTitle>
            </DialogHeader>
            {selectedIncident && (
              <div>
                <div className="mb-4 space-y-2">
                  <div className="text-lg font-semibold">{selectedIncident.title}</div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <Badge className="bg-gray-100 text-gray-700 border-gray-300">{selectedIncident.type}</Badge>
                    <Badge className={
                      selectedIncident.status === 'Operational'
                        ? 'bg-green-100 text-green-800 border-green-300'
                        : selectedIncident.status === 'Degraded Performance'
                        ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                        : selectedIncident.status === 'Partial Outage'
                        ? 'bg-orange-100 text-orange-800 border-orange-300'
                        : 'bg-red-100 text-red-800 border-red-300'
                    }>{selectedIncident.status}</Badge>
                    {selectedIncident.isResolved ? (
                      <Badge className="bg-green-100 text-green-800 border-green-300">Resolved</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800 border-red-300">Unresolved</Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">Affected Services: {(Array.isArray(selectedIncident.services) ? selectedIncident.services : []).map(s => s.name).join(', ') || 'None'}</div>
                  <div className="text-xs text-gray-400">Created: {new Date(selectedIncident.createdAt).toLocaleString()}</div>
                  <div className="text-xs text-gray-400">Updated: {new Date(selectedIncident.updatedAt).toLocaleString()}</div>
                  <div className="text-sm mt-2 text-gray-700">{selectedIncident.description}</div>
                </div>
                <div className="font-semibold mb-2">Timeline</div>
                <div className="space-y-4 max-h-72 overflow-y-auto border-l-2 border-gray-200 pl-4">
                  {selectedIncident && Array.isArray(selectedIncident.updates) && selectedIncident.updates.length > 0 ? (
                    selectedIncident.updates.map((upd, idx) => (
                      <div key={upd.id} className="relative">
                        <div className="absolute -left-5 top-1.5 w-3 h-3 rounded-full bg-blue-500 border-2 border-white"></div>
                        <div className="text-xs text-gray-500 mb-1">{new Date(upd.createdAt).toLocaleString()}</div>
                        <div className="text-sm bg-gray-50 rounded p-2 border">{upd.message}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400 text-sm">No updates for this incident yet.</div>
                  )}
                </div>
                <div className="flex justify-end mt-4">
                  <Button variant="outline" onClick={() => setUpdatesOpen(false)}>Close</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default IncidentsPage; 