import { ServiceStatus, StatusBadge } from "./status-badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

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
  const [uptimeOpen, setUptimeOpen] = useState(false);
  const [uptimeData, setUptimeData] = useState<{ uptime: number; history: { Status: string; ChangedAt: string }[] } | null>(null);
  const [uptimeLoading, setUptimeLoading] = useState(false);
  const [uptimeError, setUptimeError] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const handleViewUptime = async (service: Service) => {
    setSelectedService(service);
    setUptimeOpen(true);
    setUptimeLoading(true);
    setUptimeError(null);
    try {
      const res = await fetch(`/api/services/${service.id}/uptime?period=7d`);
      if (!res.ok) throw new Error("Failed to fetch uptime");
      const data = await res.json();
      setUptimeData(data);
    } catch (e: any) {
      setUptimeError(e.message || "Unknown error");
    } finally {
      setUptimeLoading(false);
    }
  };

  // Prepare chart data
  let chartData = null;
  if (uptimeData && Array.isArray(uptimeData.history) && uptimeData.history.length > 0) {
    const labels = uptimeData.history.map((h: any) => new Date(h.ChangedAt).toLocaleString());
    const values = uptimeData.history.map((h: any) => h.Status === "Operational" ? 1 : 0);
    chartData = {
      labels,
      datasets: [
        {
          label: "Operational (1 = Up, 0 = Down)",
          data: values,
          backgroundColor: values.map((v: number) => v ? "#22c55e" : "#ef4444"),
        },
      ],
    };
  }

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
                <Button size="sm" variant="secondary" onClick={() => handleViewUptime(service)}>
                  View Uptime
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Dialog open={uptimeOpen} onOpenChange={setUptimeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Service Uptime - {selectedService?.name}</DialogTitle>
          </DialogHeader>
          {uptimeLoading && <div>Loading uptime...</div>}
          {uptimeError && <div className="text-red-500">{uptimeError}</div>}
          {uptimeData && (
            <>
              <div className="mb-2 font-medium">Uptime (last 7d): {uptimeData.uptime.toFixed(2)}%</div>
              {chartData && <Bar data={chartData} options={{ scales: { y: { min: 0, max: 1, ticks: { stepSize: 1 } } } }} />}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 