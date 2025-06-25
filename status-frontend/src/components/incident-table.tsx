import React from 'react';
import { Badge } from './ui/badge';
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

interface IncidentTableProps {
  incidents: Incident[];
  services: Service[];
  onEdit: (incident: Incident) => void;
  onResolve: (incident: Incident) => void;
  onAddUpdate: (incident: Incident) => void;
}

export const IncidentTable: React.FC<IncidentTableProps> = ({
  incidents,
  services,
  onEdit,
  onResolve,
  onAddUpdate,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-4 py-2 text-left">Title</th>
            <th className="px-4 py-2 text-left">Type</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-left">Resolved</th>
            <th className="px-4 py-2 text-left">Services</th>
            <th className="px-4 py-2 text-left">Created</th>
            <th className="px-4 py-2 text-left">Updated</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {incidents.length === 0 && (
            <tr>
              <td colSpan={8} className="text-center py-6 text-gray-400">
                No incidents or maintenances found.
              </td>
            </tr>
          )}
          {incidents.map((incident) => (
            <tr key={incident.id} className="border-t">
              <td className="px-4 py-2 font-medium">{incident.title}</td>
              <td className="px-4 py-2">
                <Badge className="bg-gray-100 text-gray-700 border-gray-300">{incident.type}</Badge>
              </td>
              <td className="px-4 py-2">
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
              </td>
              <td className="px-4 py-2">
                {incident.isResolved ? (
                  <Badge className="bg-green-100 text-green-800 border-green-300">Yes</Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800 border-red-300">No</Badge>
                )}
              </td>
              <td className="px-4 py-2">
                <div className="flex flex-wrap gap-1">
                  {incident.services.map((svc) => (
                    <Badge key={svc.id} className="bg-gray-200 text-gray-700 border-gray-300">
                      {svc.name}
                    </Badge>
                  ))}
                </div>
              </td>
              <td className="px-4 py-2">
                {new Date(incident.createdAt).toLocaleString()}
              </td>
              <td className="px-4 py-2">
                {new Date(incident.updatedAt).toLocaleString()}
              </td>
              <td className="px-4 py-2 space-x-2">
                <Button size="sm" variant="outline" onClick={() => onEdit(incident)}>
                  Edit
                </Button>
                {!incident.isResolved && (
                  <Button size="sm" variant="default" onClick={() => onResolve(incident)}>
                    Resolve
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => onAddUpdate(incident)}>
                  Add Update
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 