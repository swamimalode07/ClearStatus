import type { NextApiRequest, NextApiResponse } from 'next';
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const period = req.query.period || '7d';
  const backendUrl = `http://localhost:8080/api/services/${id}/uptime?period=${period}`;

  try {
    const response = await fetch(backendUrl, {
      method: 'GET',
    });

    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { error: await response.text() };
    }

    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Proxy error', details: (err as Error).message });
  }
}
