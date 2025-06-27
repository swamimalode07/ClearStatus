// Public Status Page
'use client';
import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/navbar'

const API = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080') + '/api/public';

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
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Status Page</h1>
      {loading && <div className="text-center py-4">Loading...</div>}
      {error && <div className="text-red-500 text-center py-4">{error}</div>}
      
      {/* Service Status */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Current Service Status</h2>
        <div className="grid grid-cols-1 gap-3">
          {services.map((svc) => (
            <Card key={svc.id} className="flex items-center justify-between p-3 sm:p-4">
              <div className="font-medium text-sm sm:text-base truncate">{svc.name}</div>
              <Badge className={
                `text-xs sm:text-sm ${
                  svc.status === 'Operational'
                    ? 'bg-green-100 text-green-800 border-green-300'
                    : svc.status === 'Degraded Performance'
                    ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                    : svc.status === 'Partial Outage'
                    ? 'bg-orange-100 text-orange-800 border-orange-300'
                    : 'bg-red-100 text-red-800 border-red-300'
                }`
              }>
                {svc.status}
              </Badge>
            </Card>
          ))}
        </div>
      </section>
      
      {/* Incidents & Maintenance */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Active Incidents & Maintenance</h2>
        {incidents.filter(i => !i.isResolved).length === 0 ? (
          <div className="text-gray-500 text-center py-4">No active incidents or maintenance.</div>
        ) : (
          <div className="space-y-4">
            {incidents.filter(i => !i.isResolved).map((incident) => (
              <Card key={incident.id} className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 items-start sm:items-center mb-3">
                  <span className="font-semibold text-lg break-words">{incident.title}</span>
                  <div className="flex gap-2 flex-wrap">
                    <Badge className="bg-gray-100 text-gray-700 border-gray-300 text-xs">{incident.type}</Badge>
                    <Badge className="bg-red-100 text-red-800 border-red-300 text-xs">{incident.status}</Badge>
                  </div>
                </div>
                <div className="text-sm text-gray-700 mb-3 break-words">{incident.description}</div>
                <div className="text-xs text-gray-500 mb-2 break-words">
                  Affected: {(Array.isArray(incident.services) ? incident.services : []).map(s => s.name).join(', ') || 'None'}
                </div>
                <div className="text-xs text-gray-400 mb-3">Started: {new Date(incident.createdAt).toLocaleString()}</div>
                
                {/* Timeline of updates */}
                <div className="mt-3 border-l-2 border-gray-200 pl-3 sm:pl-4 space-y-3">
                  {Array.isArray(incident.updates) && incident.updates.length > 0 ? (
                    incident.updates.map(upd => (
                      <div key={upd.id} className="relative">
                        <div className="absolute -left-2.5 sm:-left-3.5 top-1.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-blue-500 border-2 border-white"></div>
                        <div className="text-xs text-gray-500 mb-1">{new Date(upd.createdAt).toLocaleString()}</div>
                        <div className="text-sm bg-gray-50 rounded p-2 border break-words">{upd.message}</div>
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