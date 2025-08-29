import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Partner Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Partner Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <h1 className="scroll-m-20 text-2xl font-semibold tracking-tight text-primary">Welcome to Life Partner</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Your AI assistant for all things relationship planning</p>
                </div>
            </div>
        </AppLayout>
    );
}
