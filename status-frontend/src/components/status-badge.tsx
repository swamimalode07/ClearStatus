import { Badge } from "@/components/ui/badge";

export type ServiceStatus =
  | "Operational"
  | "Degraded Performance"
  | "Partial Outage"
  | "Major Outage";

const statusColor: Record<ServiceStatus, string> = {
  Operational: "bg-green-100 text-green-800 border-green-200",
  "Degraded Performance": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "Partial Outage": "bg-orange-100 text-orange-800 border-orange-200",
  "Major Outage": "bg-red-100 text-red-800 border-red-200",
};

export function StatusBadge({ status }: { status: ServiceStatus }) {
  return (
    <Badge className={statusColor[status] + " border font-medium"}>{status}</Badge>
  );
} 