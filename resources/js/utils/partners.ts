import partnersRoutes from '@/routes/partners';
import { type Partner } from '@types';

export async function fetchPartners(): Promise<Partner[]> {
  const res = await fetch(partnersRoutes.list().url, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    throw new Error('Failed to load partners');
  }
  const json = await res.json();
  return json.data ?? [];
}
