import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ServiceStatus } from "./status-badge";

const statusOptions: ServiceStatus[] = [
  "Operational",
  "Degraded Performance",
  "Partial Outage",
  "Major Outage",
];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; status: ServiceStatus }) => void;
  initialData?: { name: string; status: ServiceStatus };
  loading?: boolean;
  error?: string | null;
};

export function ServiceDialog({ open, onOpenChange, onSubmit, initialData, loading, error }: Props) {
  const [name, setName] = React.useState(initialData?.name || "");
  const [status, setStatus] = React.useState<ServiceStatus>(initialData?.status || "Operational");
  const [touched, setTouched] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setName(initialData?.name || "");
      setStatus(initialData?.status || "Operational");
      setTouched(false);
    }
  }, [open, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), status });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Service" : "Add Service"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Service name"
            value={name}
            onChange={e => setName(e.target.value)}
            disabled={loading}
            required
          />
          <Select value={status} onValueChange={v => setStatus(v as ServiceStatus)} disabled={loading}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(opt => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error && <div className="text-red-600 text-sm">{error}</div>}
        </form>
        <DialogFooter>
          <Button type="submit" form="service-form" onClick={handleSubmit} disabled={loading || !name.trim()}>
            {initialData ? "Save Changes" : "Add Service"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 