import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Calendar, Gift, Sparkles } from 'lucide-react';

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
                <h1 className="text-2xl font-semibold text-primary">Welcome to LifePartner</h1>
                <p className="text-muted-foreground">Your AI assistant for all things relationship planning</p>

                <div className="grid auto-rows-min gap-6 md:grid-cols-3">
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-primary/20 bg-card p-4 shadow-sm transition-all hover:shadow-md">
                        <div className="flex flex-col items-center justify-center h-full space-y-2">
                            <Gift className="h-10 w-10 text-primary" />
                            <h3 className="font-medium text-center">Gift Ideas</h3>
                            <p className="text-sm text-center text-muted-foreground">Discover perfect gifts based on your partner's preferences</p>
                        </div>
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-primary/20 bg-card p-4 shadow-sm transition-all hover:shadow-md">
                        <div className="flex flex-col items-center justify-center h-full space-y-2">
                            <Calendar className="h-10 w-10 text-primary" />
                            <h3 className="font-medium text-center">Special Occasions</h3>
                            <p className="text-sm text-center text-muted-foreground">Keep track of important dates and anniversaries</p>
                        </div>
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-primary/20 bg-card p-4 shadow-sm transition-all hover:shadow-md">
                        <div className="flex flex-col items-center justify-center h-full space-y-2">
                            <Sparkles className="h-10 w-10 text-primary" />
                            <h3 className="font-medium text-center">AI Suggestions</h3>
                            <p className="text-sm text-center text-muted-foreground">Personalized recommendations for your relationship</p>
                        </div>
                    </div>
                </div>
                <div className="relative flex-1 overflow-hidden rounded-xl border border-primary/20 bg-card p-6 shadow-sm">
                    <h2 className="text-xl font-medium mb-4">Relationship Insights</h2>
                    <div className="space-y-4">
                        <p className="text-muted-foreground">Your AI assistant is ready to help you plan special moments for your partner.</p>
                        <p className="text-muted-foreground">Tell LifePartner about your partner's preferences, interests, and special dates to get personalized recommendations.</p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
