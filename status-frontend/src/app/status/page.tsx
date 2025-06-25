// Public Status Page
'use client';
import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/navbar'

const API = 'http://localhost:8080/api/public';

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

const StatusPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [servicesRes, incidentsRes] = await Promise.all([
        fetch(`${API}/services`),
        fetch(`${API}/incidents`),
      ]);
      if (!servicesRes.ok || !incidentsRes.ok) throw new Error('Failed to fetch data');
      const servicesData = await servicesRes.json();
      const incidentsData = await incidentsRes.json();
      setServices(Array.isArray(servicesData) ? servicesData : []);
      setIncidents(Array.isArray(incidentsData) ? incidentsData : []);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <Navbar active="status" />
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Status Page</h1>
        {loading && <div>Loading...</div>}
        {error && <div className="text-red-500">{error}</div>}
        {/* Service Status */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Current Service Status</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {services.map((svc) => (
              <Card key={svc.id} className="flex items-center gap-4 p-4">
                <div className="font-medium flex-1">{svc.name}</div>
                <Badge className={
                  svc.status === 'Operational'
                    ? 'bg-green-100 text-green-800 border-green-300'
                    : svc.status === 'Degraded Performance'
                    ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                    : svc.status === 'Partial Outage'
                    ? 'bg-orange-100 text-orange-800 border-orange-300'
                    : 'bg-red-100 text-red-800 border-red-300'
                }>{svc.status}</Badge>
              </Card>
            ))}
          </div>
        </section>
        {/* Incidents & Maintenance */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Active Incidents & Maintenance</h2>
          {incidents.filter(i => !i.isResolved).length === 0 ? (
            <div className="text-gray-500">No active incidents or maintenance.</div>
          ) : (
            <div className="space-y-4">
              {incidents.filter(i => !i.isResolved).map((incident) => (
                <Card key={incident.id} className="p-4">
                  <div className="flex flex-wrap gap-2 items-center mb-2">
                    <span className="font-semibold text-lg">{incident.title}</span>
                    <Badge className="bg-gray-100 text-gray-700 border-gray-300">{incident.type}</Badge>
                    <Badge className="bg-red-100 text-red-800 border-red-300">{incident.status}</Badge>
                  </div>
                  <div className="text-sm text-gray-700 mb-2">{incident.description}</div>
                  <div className="text-xs text-gray-500 mb-1">Affected: {(Array.isArray(incident.services) ? incident.services : []).map(s => s.name).join(', ') || 'None'}</div>
                  <div className="text-xs text-gray-400">Started: {new Date(incident.createdAt).toLocaleString()}</div>
                  {/* Timeline of updates */}
                  <div className="mt-3 border-l-2 border-gray-200 pl-4 space-y-2">
                    {Array.isArray(incident.updates) && incident.updates.length > 0 ? (
                      incident.updates.map(upd => (
                        <div key={upd.id} className="relative">
                          <div className="absolute -left-5 top-1.5 w-3 h-3 rounded-full bg-blue-500 border-2 border-white"></div>
                          <div className="text-xs text-gray-500 mb-1">{new Date(upd.createdAt).toLocaleString()}</div>
                          <div className="text-sm bg-gray-50 rounded p-2 border">{upd.message}</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-400 text-sm">No updates yet.</div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
};

export default StatusPage; 