export function getCsrfToken() {
  if (typeof document === 'undefined') return undefined;
  return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? undefined;
}

export async function sendPartnerAssist(partnerId: number, message: string): Promise<{ reply?: string } | null> {
  const res = await fetch('/partners/assist', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-CSRF-TOKEN': getCsrfToken() ?? '',
    },
    body: JSON.stringify({ partner_id: partnerId, message }),
  });
  if (!res.ok) return null;
  const json = await res.json().catch(() => null);
  if (!json) return null;
  const reply = json?.data?.reply as string | undefined;
  return { reply };
}
