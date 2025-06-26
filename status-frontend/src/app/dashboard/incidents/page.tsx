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
  <div className="p-4 md:p-6 max-w-6xl mx-auto">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <h1 className="text-2xl font-bold">Incidents & Maintenance</h1>
      <Button 
        onClick={() => setAddOpen(true)} 
        variant="default"
        className="w-full md:w-auto"
      >
        + Add Incident
      </Button>
    </div>
    
    {loading && (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
      </div>
    )}
    
    {error && (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
        {error}
      </div>
    )}
    
    <div className="mt-4">
      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {incidents.map((incident) => (
          <div key={incident.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{incident.title}</h3>
                <div className="text-sm text-gray-500 mt-1">
                  {new Date(incident.createdAt).toLocaleDateString()}
                </div>
              </div>
              <Badge className={
                incident.status === 'Operational'
                  ? 'bg-green-100 text-green-800 border-green-300'
                  : incident.status === 'Degraded Performance'
                  ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                  : incident.status === 'Partial Outage'
                  ? 'bg-orange-100 text-orange-800 border-orange-300'
                  : 'bg-red-100 text-red-800 border-red-300'
              }>
                {incident.status}
              </Badge>
            </div>
            
            <div className="mt-3 text-sm text-gray-700 line-clamp-2">
              {incident.description}
            </div>
            
            <div className="mt-4 flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setSelectedIncident(incident);
                  setEditOpen(true);
                }}
              >
                Edit
              </Button>
              {!incident.isResolved && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSelectedIncident(incident);
                    setResolveOpen(true);
                  }}
                >
                  Resolve
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setSelectedIncident(incident);
                  setUpdateOpen(true);
                }}
              >
                Update
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setSelectedIncident(incident);
                  setUpdatesOpen(true);
                }}
              >
                Details
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Desktop Table View */}
      <div className="hidden md:block">
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
    </div>
    
    {/* Add Incident Modal */}
    <IncidentForm
      open={addOpen}
      onOpenChange={setAddOpen}
      onSubmit={handleAddIncident}
      loading={addLoading}
      error={addError}
      services={services}
    />
    
    {/* Edit Incident Modal */}
    <IncidentForm
      open={editOpen}
      onOpenChange={(open) => { setEditOpen(open); if (!open) setSelectedIncident(null); }}
      onSubmit={handleEditIncident}
      loading={editLoading}
      error={editError}
      services={services}
      initialIncident={selectedIncident}
    />
    
    {/* Resolve Incident Modal */}
    <Dialog open={resolveOpen} onOpenChange={(open) => { setResolveOpen(open); if (!open) setSelectedIncident(null); }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Resolve Incident</DialogTitle>
        </DialogHeader>
        <div className="mb-4 text-gray-700">Are you sure you want to mark this incident as resolved?</div>
        {resolveError && <div className="text-red-500 text-sm mb-2">{resolveError}</div>}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Button variant="outline" onClick={() => setResolveOpen(false)} disabled={resolveLoading}>
            Cancel
          </Button>
          <Button variant="default" onClick={handleResolveIncident} disabled={resolveLoading}>
            {resolveLoading ? 'Resolving...' : 'Resolve'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    
    {/* Add Update Modal */}
    <Dialog open={updateOpen} onOpenChange={(open) => { 
      setUpdateOpen(open); 
      if (!open) { 
        setSelectedIncident(null); 
        setUpdateMessage(''); 
        setUpdateError(null); 
      } 
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Update</DialogTitle>
        </DialogHeader>
        <form onSubmit={e => { e.preventDefault(); handleAddUpdate(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Update Message</label>
            <textarea
              className="w-full border rounded px-3 py-2 min-h-[100px] text-sm"
              value={updateMessage}
              onChange={e => setUpdateMessage(e.target.value)}
              disabled={updateLoading}
              required
              placeholder="Provide details about the incident update..."
            />
          </div>
          {updateError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
              {updateError}
            </div>
          )}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setUpdateOpen(false)} 
              disabled={updateLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="default" 
              disabled={updateLoading || !updateMessage.trim()}
            >
              {updateLoading ? 'Adding...' : 'Add Update'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    
    {/* View Updates Modal */}
    <Dialog open={updatesOpen} onOpenChange={(open) => { setUpdatesOpen(open); if (!open) setSelectedIncident(null); }}>
      <DialogContent className="max-w-[90vw] md:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Incident Details & Timeline</DialogTitle>
        </DialogHeader>
        {selectedIncident && (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="text-lg font-semibold text-gray-900">{selectedIncident.title}</div>
              <div className="flex flex-wrap gap-2 items-center">
                <Badge className="bg-gray-100 text-gray-700 border-gray-300 text-xs">
                  {selectedIncident.type}
                </Badge>
                <Badge className={
                  selectedIncident.status === 'Operational'
                    ? 'bg-green-100 text-green-800 border-green-300'
                    : selectedIncident.status === 'Degraded Performance'
                    ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                    : selectedIncident.status === 'Partial Outage'
                    ? 'bg-orange-100 text-orange-800 border-orange-300'
                    : 'bg-red-100 text-red-800 border-red-300'
                }>
                  {selectedIncident.status}
                </Badge>
                {selectedIncident.isResolved ? (
                  <Badge className="bg-green-100 text-green-800 border-green-300">
                    Resolved
                  </Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800 border-red-300">
                    Unresolved
                  </Badge>
                )}
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Affected Services:</span> {(Array.isArray(selectedIncident.services) ? selectedIncident.services : []).map(s => s.name).join(', ') || 'None'}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                <div>Created: {new Date(selectedIncident.createdAt).toLocaleString()}</div>
                <div>Updated: {new Date(selectedIncident.updatedAt).toLocaleString()}</div>
              </div>
              <div className="text-sm mt-2 text-gray-700 bg-gray-50 p-3 rounded">
                {selectedIncident.description}
              </div>
            </div>
            
            <div>
              <div className="font-semibold mb-3 text-gray-800">Timeline</div>
              <div className="space-y-4 max-h-[50vh] overflow-y-auto border-l-2 border-gray-200 pl-4 pr-2">
                {selectedIncident && Array.isArray(selectedIncident.updates) && selectedIncident.updates.length > 0 ? (
                  selectedIncident.updates.map((upd, idx) => (
                    <div key={upd.id} className="relative">
                      <div className="absolute -left-[9px] top-1.5 w-3 h-3 rounded-full bg-blue-500 border-2 border-white"></div>
                      <div className="text-xs text-gray-500 mb-1">
                        {new Date(upd.createdAt).toLocaleString()}
                      </div>
                      <div className="text-sm bg-gray-50 rounded p-3 border text-gray-700">
                        {upd.message}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400 text-sm italic py-4">
                    No updates for this incident yet.
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                onClick={() => setUpdatesOpen(false)}
                className="mt-2"
              >
                Close
              </Button>
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