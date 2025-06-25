import { ServiceStatus, StatusBadge } from "./status-badge";
import { Button } from "@/components/ui/button";

export interface Service {
  id: string;
  name: string;
  status: ServiceStatus;
  organizationId: string;
}

type Props = {
  services: Service[];
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
};

export function ServiceTable({ services, onEdit, onDelete }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border rounded-md">
        <thead>
          <tr className="bg-muted">
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service) => (
            <tr key={service.id} className="border-t">
              <td className="px-4 py-2">{service.name}</td>
              <td className="px-4 py-2"><StatusBadge status={service.status} /></td>
              <td className="px-4 py-2 text-right space-x-2">
                <Button size="sm" variant="outline" onClick={() => onEdit(service)}>
                  Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => onDelete(service)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 