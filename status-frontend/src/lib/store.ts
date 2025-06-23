// lib/store.ts

import { create } from 'zustand'

type Status = 'Operational' | 'Degraded' | 'Outage'

type Service = {
  id: string
  name: string
  status: Status
}

type Incident = {
  id: string
  title: string
  status: Status
  time: string
}

interface Store {
  services: Service[]
  incidents: Incident[]
  addService: (name: string, status: Status) => void
  addIncident: (title: string, status: Status) => void
}

export const useStore = create<Store>((set) => ({
  services: [
    { id: '1', name: 'Website', status: 'Operational' },
    { id: '2', name: 'API', status: 'Degraded' },
    { id: '3', name: 'Database', status: 'Outage' },
  ],
  incidents: [],
  addService: (name, status) =>
    set((state) => ({
      services: [
        ...state.services,
        { id: crypto.randomUUID(), name, status },
      ],
    })),
  addIncident: (title, status) =>
    set((state) => ({
      incidents: [
        ...state.incidents,
        {
          id: crypto.randomUUID(),
          title,
          status,
          time: new Date().toLocaleTimeString(),
        },
      ],
    })),
}))
