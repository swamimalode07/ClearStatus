'use client'

// Incidents Dashboard Page
import React, { useEffect, useState } from 'react';
import { useAuth, useOrganization } from '@clerk/nextjs';
import { IncidentTable } from '@/components/incident-table';
import { Button } from '@/components/ui/button';
import { IncidentForm } from '@/components/incident-form';

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

  useEffect(() => {
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
    fetchData();
  }, [organization, getToken]);

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
      // Refresh incidents
      const incidentsRes = await fetch(`${API}/incidents`, { headers: { Authorization: `Bearer ${token}` } });
      const incidentsData = await incidentsRes.json();
      setIncidents(Array.isArray(incidentsData) ? incidentsData : []);
    } catch (err: any) {
      setAddError(err.message || 'Unknown error');
    } finally {
      setAddLoading(false);
    }
  };

  return (
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
      {/* IncidentForm, IncidentResolveDialog, IncidentUpdateDialog will go here */}
    </div>
  );
};

export default IncidentsPage; 