import informationRoutes from '@/routes/information';
import { type Information } from '@types';

export async function fetchInformation(): Promise<Information[]> {
  const res = await fetch(informationRoutes.list().url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error('Failed to load information');
  const json = await res.json();
  return json.data ?? [];
}
