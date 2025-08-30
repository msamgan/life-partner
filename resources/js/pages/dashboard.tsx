import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import partnersRoutes from '@/routes/partners';
import { fetchPartners } from '@/utils/partners';
import informationRoutes from '@/routes/information';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem } from '@types';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Textarea from '@/components/ui/textarea';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
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
    const [selectedPartnerId, setSelectedPartnerId] = useState<number | null>(null);
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [infos, setInfos] = useState<Information[]>([]);
    const [infosLoading, setInfosLoading] = useState<boolean>(true);
    const [infosError, setInfosError] = useState<string | null>(null);

    const [input, setInput] = useState<string>('');
    const [isSending, setIsSending] = useState<boolean>(false);
    const [chatMode, setChatMode] = useState<boolean>(false);
    const [messages, setMessages] = useState<{ id: string; role: 'user' | 'assistant'; content: string; at: string }[]>([]);
    const chatEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                setError(null);
                const list = await fetchPartners();
                setPartners(list);
            } catch (e) {
                setError((e as Error).message);
            } finally {
                setLoading(false);
            }
        };
        void load();
    }, []);

    // Set default selected partner id when partners load
    useEffect(() => {
        if (partners.length > 0) {
            setSelectedPartnerId((prev) => prev ?? partners[0].id);
        } else {
            setSelectedPartnerId(null);
        }
    }, [partners]);

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
    const showEmptyInfo = !infosLoading && !infosError && infos.length === 0 && !showEmpty;
    const canShowAssistant = !loading && !infosLoading && !error && !infosError && partners.length > 0 && infos.length > 0;

    function getCsrfToken() {
        if (typeof document === 'undefined') return undefined;
        return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? undefined;
    }

    async function handleSend() {
        if (!input.trim() || selectedPartnerId === null || isSending) return;
        setIsSending(true);
        const userMsg = {
            id: `u-${Date.now()}`,
            role: 'user' as const,
            content: input.trim(),
            at: new Date().toISOString(),
        };
        if (!chatMode) setChatMode(true);
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        try {
            const res = await fetch('/partners/assist', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken() ?? '',
                },
                body: JSON.stringify({ partner_id: selectedPartnerId, message: userMsg.content }),
            });
            // We don't strictly need the response to switch UI; but we can optionally process it
            if (res.ok) {
                const json = await res.json().catch(() => null);
                if (json?.data?.reply) {
                    setMessages((prev) => [
                        ...prev,
                        { id: `a-${Date.now()}`, role: 'assistant', content: String(json.data.reply), at: new Date().toISOString() },
                    ]);
                }
            }
        } catch {
            // Show a simple error message in chat area
            setMessages((prev) => [
                ...prev,
                { id: `sys-${Date.now()}`, role: 'assistant', content: 'Failed to send. Please try again.', at: new Date().toISOString() },
            ]);
        } finally {
            setIsSending(false);
        }
    }

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6 pb-28">
                {loading && <div className="rounded-lg bg-card p-6 text-sm text-muted-foreground">Loading your partners...</div>}

                {error && !loading && <div className="rounded-lg bg-card p-6 text-sm text-red-600">{error}</div>}

                {showEmpty && (
                    <div className="flex flex-col items-center gap-4 rounded-lg bg-card p-8 text-center">
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
                            <Link href={partnersRoutes.index({ query: { open: 'add' } }).url}><svg aria-hidden className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>Add partner</Link>
                        </Button>
                    </div>
                )}

                {showEmptyInfo && (
                    <div className="flex flex-col items-center gap-4 rounded-lg bg-card p-8 text-center">
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
                            <Link href={informationRoutes.index({ query: { open: 'add' } }).url}><svg aria-hidden className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>Add information</Link>
                        </Button>
                    </div>
                )}

                {canShowAssistant && (
                    <div className="fixed bottom-6 left-0 right-0">
                        <div className="mx-auto w-full max-w-4xl px-4">
                            {partners.length > 1 && selectedPartnerId !== null && (
                                <div className="mb-2">
                                    <Select defaultValue={String(selectedPartnerId)} onValueChange={(v) => setSelectedPartnerId(Number(v))}>
                                        <SelectTrigger aria-label="Select partner">
                                            <SelectValue placeholder="Select a partner" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {partners.map((p) => (
                                                <SelectItem key={p.id} value={String(p.id)}>
                                                    {p.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Chat window */}
                            {chatMode && (
                                <div className="mb-3 max-h-80 overflow-y-auto rounded-lg border border-border bg-card p-3">
                                    {messages.length === 0 && (
                                        <div className="text-sm text-muted-foreground">No messages yet.</div>
                                    )}
                                    {messages.map((m) => (
                                        <div key={m.id} className={`mb-2 flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[80%] rounded-md px-3 py-2 text-sm ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                                                {m.content}
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={chatEndRef} />
                                </div>
                            )}

                            {/* Input + Send */}
                            <div className="space-y-2">
                                <Textarea
                                    autoFocus={true}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={
                                        partners.length === 1
                                            ? `Get advice from Life Partner AI for ${partners[0].name}`
                                            : `Get advice from Life Partner AI for ${partners.find((p) => p.id === selectedPartnerId)?.name ?? 'selected partner'}`
                                    }
                                    aria-label="Assistant input"
                                    onKeyDown={(e) => {
                                        if ((e.key === 'Enter' && (e.metaKey || e.ctrlKey)) || (e.key === 'Enter' && !e.shiftKey)) {
                                            e.preventDefault();
                                            void handleSend();
                                        }
                                    }}
                                />
                                <div className="flex justify-end">
                                    <Button onClick={() => void handleSend()} disabled={isSending || !input.trim() || selectedPartnerId === null}>
                                        {isSending ? (
                                            <>
                                                <svg aria-hidden className="size-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                                                Sending…
                                            </>
                                        ) : (
                                            <>
                                                <svg aria-hidden className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                                                Send
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
