import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import partnersRoutes from '@/routes/partners';
import informationRoutes from '@/routes/information';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Partner Dashboard',
        href: dashboard().url,
    },
];

type Partner = {
    id: number;
    name: string;
    description?: string | null;
};

type Information = {
    id: number;
};

export default function Dashboard() {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [infos, setInfos] = useState<Information[]>([]);
    const [infosLoading, setInfosLoading] = useState<boolean>(true);
    const [infosError, setInfosError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                setError(null);
                const res = await fetch(partnersRoutes.list().url, { headers: { Accept: 'application/json' } });
                if (!res.ok) throw new Error('Failed to load partners');
                const json = await res.json();
                setPartners(json.data ?? []);
            } catch (e) {
                setError((e as Error).message);
            } finally {
                setLoading(false);
            }
        };
        void load();
    }, []);

    useEffect(() => {
        const loadInfo = async () => {
            try {
                setInfosError(null);
                const res = await fetch(informationRoutes.list().url, { headers: { Accept: 'application/json' } });
                if (!res.ok) throw new Error('Failed to load information');
                const json = await res.json();
                setInfos(json.data ?? []);
            } catch (e) {
                setInfosError((e as Error).message);
            } finally {
                setInfosLoading(false);
            }
        };
        void loadInfo();
    }, []);

    const showEmpty = !loading && !error && partners.length === 0;
    const showEmptyInfo = !infosLoading && !infosError && infos.length === 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Partner Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <h1 className="scroll-m-20 text-2xl font-semibold tracking-tight text-primary">Welcome to Life Partner</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Your AI assistant for all things relationship planning</p>
                </div>

                {loading && (
                    <div className="rounded-lg border bg-card p-6 shadow-sm text-sm text-muted-foreground">Loading your partners...</div>
                )}

                {error && !loading && (
                    <div className="rounded-lg border bg-card p-6 shadow-sm text-sm text-red-600">{error}</div>
                )}

                {showEmpty && (
                    <div className="rounded-lg border bg-card p-8 shadow-sm flex flex-col items-center text-center gap-4">
                        {/* Inline SVG illustration to avoid asset dependencies */}
                        <svg width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                            <rect x="10" y="20" width="140" height="80" rx="12" fill="#F3F4F6" />
                            <path d="M55 60c0-8 6.5-14.5 14.5-14.5S84 52 84 60s-6.5 14.5-14.5 14.5S55 68 55 60Z" fill="#E5E7EB" />
                            <path d="M88 48h28" stroke="#E5E7EB" strokeWidth="4" strokeLinecap="round" />
                            <path d="M88 60h28" stroke="#E5E7EB" strokeWidth="4" strokeLinecap="round" />
                            <path d="M88 72h18" stroke="#E5E7EB" strokeWidth="4" strokeLinecap="round" />
                            <circle cx="80" cy="14" r="4" fill="#F59E0B" />
                        </svg>
                        <div>
                            <h2 className="text-lg font-semibold text-primary">You don’t have a partner yet</h2>
                            <p className="text-sm text-muted-foreground">Add a partner to get started with planning and insights.</p>
                        </div>
                        <Button asChild>
                            <Link href={partnersRoutes.index({ query: { open: 'add' } }).url}>Add partner</Link>
                        </Button>
                    </div>
                )}
                {showEmptyInfo && (
                    <div className="rounded-lg border bg-card p-8 shadow-sm flex flex-col items-center text-center gap-4">
                        <svg width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                            <rect x="10" y="20" width="140" height="80" rx="12" fill="#F3F4F6" />
                            <path d="M55 60c0-8 6.5-14.5 14.5-14.5S84 52 84 60s-6.5 14.5-14.5 14.5S55 68 55 60Z" fill="#E5E7EB" />
                            <path d="M88 48h28" stroke="#E5E7EB" strokeWidth="4" strokeLinecap="round" />
                            <path d="M88 60h28" stroke="#E5E7EB" strokeWidth="4" strokeLinecap="round" />
                            <path d="M88 72h18" stroke="#E5E7EB" strokeWidth="4" strokeLinecap="round" />
                            <circle cx="80" cy="14" r="4" fill="#3B82F6" />
                        </svg>
                        <div>
                            <h2 className="text-lg font-semibold text-primary">No information added yet</h2>
                            <p className="text-sm text-muted-foreground">Add information about your partner to keep important notes.</p>
                        </div>
                        <Button asChild>
                            <Link href={informationRoutes.index({ query: { open: 'add' } }).url}>Add information</Link>
                        </Button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
