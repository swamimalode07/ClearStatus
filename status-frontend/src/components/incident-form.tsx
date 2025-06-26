import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';

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

interface IncidentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    id?: string;
    title: string;
    description: string;
    type: string;
    status: string;
    serviceIds: string[];
  }) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  services: Service[];
  initialIncident?: Incident | null;
}

const INCIDENT_TYPES = [
  { value: 'incident', label: 'Incident' },
  { value: 'maintenance', label: 'Maintenance' },
];
const INCIDENT_STATUSES = [
  'Investigating',
  'Identified',
  'Monitoring',
  'Resolved',
  'Scheduled',
  'In Progress',
  'Completed',
];

export const IncidentForm: React.FC<IncidentFormProps> = ({
  open,
  onOpenChange,
  onSubmit,
  loading,
  error,
  services,
  initialIncident,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('incident');
  const [status, setStatus] = useState('Investigating');
  const [serviceIds, setServiceIds] = useState<string[]>([]);

  useEffect(() => {
    if (initialIncident) {
      setTitle(initialIncident.title);
      setDescription(initialIncident.description);
      setType(initialIncident.type);
      setStatus(initialIncident.status);
      setServiceIds(Array.isArray(initialIncident.services) ? initialIncident.services.map(s => s.id) : []);
    } else {
      setTitle('');
      setDescription('');
      setType('incident');
      setStatus('Investigating');
      setServiceIds([]);
    }
  }, [initialIncident, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      id: initialIncident?.id,
      title,
      description,
      type,
      status,
      serviceIds,
    });
  };

  const handleServiceToggle = (id: string) => {
    setServiceIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialIncident ? 'Edit Incident / Maintenance' : 'Add Incident / Maintenance'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} required disabled={loading} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} disabled={loading} />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Type</label>
              <select className="w-full border rounded px-2 py-1" value={type} onChange={e => setType(e.target.value)} disabled={loading}>
                {INCIDENT_TYPES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Status</label>
              <select className="w-full border rounded px-2 py-1" value={status} onChange={e => setStatus(e.target.value)} disabled={loading}>
                {INCIDENT_STATUSES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Affected Services</label>
            <div className="flex flex-wrap gap-2">
              {services.map(svc => (
                <label key={svc.id} className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={serviceIds.includes(svc.id)}
                    onChange={() => handleServiceToggle(svc.id)}
                    disabled={loading}
                  />
                  {svc.name}
                </label>
              ))}
            </div>
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" variant="default" disabled={loading}>{initialIncident ? 'Save' : 'Add'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 