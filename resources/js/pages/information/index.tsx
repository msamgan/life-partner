import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import AppLayout from '@/layouts/app-layout';
import informationRoutes from '@/routes/information';
import partnersRoutes from '@/routes/partners';
import { type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Form, Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Information',
        href: informationRoutes.index().url,
    },
];

type Information = {
    id: number;
    content: string;
    partner_id: number | null;
    partner_name?: string | null;
};

type Partner = {
    id: number;
    name: string;
};


function Textarea(props: React.ComponentProps<'textarea'>) {
    return (
        <textarea
            data-slot="textarea"
            className={
                'flex h-32 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:ring-destructive/40'
            }
            {...props}
        />
    );
}


export default function InformationPage() {
    const [items, setItems] = useState<Information[]>([]);
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const loadItems = async () => {
        try {
            setError(null);
            const res = await fetch(informationRoutes.list().url, { headers: { Accept: 'application/json' } });
            if (!res.ok) throw new Error('Failed to load information');
            const json = await res.json();
            setItems(json.data ?? []);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const loadPartners = async () => {
        try {
            const res = await fetch(partnersRoutes.list().url, { headers: { Accept: 'application/json' } });
            if (!res.ok) throw new Error('Failed to load partners');
            const json = await res.json();
            setPartners(json.data ?? []);
        } catch {
            // ignore partner loading error on this page, keep empty list
        }
    };

    useEffect(() => {
        void loadItems();
        void loadPartners();
    }, []);

    const [editing, setEditing] = useState<Information | null>(null);
    const [addOpen, setAddOpen] = useState<boolean>(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('open') === 'add') {
            setAddOpen(true);
        }
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Information" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <HeadingSmall title="Information" description="Add notes or information about your partner" />
                        <Sheet open={addOpen} onOpenChange={setAddOpen}>
                            <SheetTrigger asChild>
                                <Button size="sm">Add information</Button>
                            </SheetTrigger>
                            <SheetContent side="right">
                                <SheetHeader>
                                    <SheetTitle>Information</SheetTitle>
                                    <SheetDescription>Write the information about your partner below.</SheetDescription>
                                </SheetHeader>
                                <div className="p-4 pt-0">
                                    <Form
                                        {...informationRoutes.store.form()}
                                        options={{ preserveScroll: true }}
                                        resetOnSuccess
                                        onSuccess={() => {
                                            setAddOpen(false);
                                            void loadItems();
                                        }}
                                        className="space-y-6"
                                    >
                                        {({ processing, recentlySuccessful, errors }) => (
                                            <>
                                                <div className="grid gap-2">
                                                    {partners.length <= 1 ? (
                                                        <div className="text-sm text-muted-foreground">
                                                            {partners.length === 1 ? (
                                                                <>
                                                                    Adding info for <span className="font-medium">{partners[0].name}</span>
                                                                    <input type="hidden" name="partner_id" value={partners[0].id} />
                                                                </>
                                                            ) : (
                                                                <>No partners found. Please add a partner first.</>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <Label htmlFor="partner_id">Partner</Label>
                                                            <input type="hidden" id="partner_id_hidden" name="partner_id" defaultValue={String(partners[0]?.id)} />
                                                            <Select defaultValue={String(partners[0]?.id)} onValueChange={(v) => { const el = document.getElementById('partner_id_hidden') as HTMLInputElement | null; if (el) el.value = v; }}>
                                                                <SelectTrigger id="partner_id">
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
                                                            <InputError message={errors.partner_id} />
                                                        </>
                                                    )}
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="content">Content</Label>
                                                    <Textarea id="content" name="content" placeholder="Type your information here" required />
                                                    <InputError message={errors.content} />
                                                </div>

                                                <div className="flex items-center justify-end gap-2">
                                                    <SheetClose asChild>
                                                        <Button variant="secondary" type="button">
                                                            Cancel
                                                        </Button>
                                                    </SheetClose>
                                                    <Button disabled={processing || partners.length === 0} type="submit">
                                                        Save
                                                    </Button>
                                                    <Transition
                                                        show={recentlySuccessful}
                                                        enter="transition ease-in-out"
                                                        enterFrom="opacity-0"
                                                        leave="transition ease-in-out"
                                                        leaveTo="opacity-0"
                                                    >
                                                        <p className="text-sm text-neutral-600">Saved</p>
                                                    </Transition>
                                                </div>
                                            </>
                                        )}
                                    </Form>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>

                <div className="space-y-4">
                    <HeadingSmall title="Your information" description="Manage saved information entries" />
                    <div className="overflow-hidden rounded-md border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-muted-foreground/80">
                                <tr>
                                    <th className="px-4 py-2 text-left">Content</th>
                                    <th className="px-4 py-2 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && (
                                    <tr>
                                        <td colSpan={2} className="px-4 py-4">
                                            <div className="space-y-2">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1 space-y-2">
                                                        <Skeleton className="h-4 w-1/4" />
                                                        <Skeleton className="h-3 w-3/4" />
                                                        <Skeleton className="h-3 w-2/3" />
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Skeleton className="h-8 w-16" />
                                                        <Skeleton className="h-8 w-20" />
                                                    </div>
                                                </div>
                                                <Skeleton className="h-px w-full" />
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1 space-y-2">
                                                        <Skeleton className="h-4 w-1/4" />
                                                        <Skeleton className="h-3 w-3/4" />
                                                        <Skeleton className="h-3 w-1/2" />
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Skeleton className="h-8 w-16" />
                                                        <Skeleton className="h-8 w-20" />
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {!loading && error && (
                                    <tr>
                                        <td colSpan={2} className="px-4 py-6 text-center text-red-600">
                                            {error}
                                        </td>
                                    </tr>
                                )}
                                {!loading && !error && items.length === 0 && (
                                    <tr>
                                        <td colSpan={2} className="px-4 py-6 text-center text-muted-foreground">
                                            No information yet.
                                        </td>
                                    </tr>
                                )}
                                {!loading &&
                                    !error &&
                                    items.map((it) => (
                                        <tr key={it.id} className="border-t hover:bg-muted/40 transition-colors">
                                            <td className="px-4 py-2">
                                                <div className="pr-4">
                                                    {it.partner_name && (
                                                        <div className="text-xs text-muted-foreground mb-1">For: <span className="font-medium text-foreground">{it.partner_name}</span></div>
                                                    )}
                                                    <div className="whitespace-pre-wrap text-muted-foreground">{it.content}</div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 text-right align-top">
                                                <div className="flex justify-end gap-2">
                                                    <Sheet
                                                        open={!!editing && editing.id === it.id}
                                                        onOpenChange={(open) => setEditing(open ? it : editing?.id === it.id ? null : editing)}
                                                    >
                                                        <SheetTrigger asChild>
                                                            <Button size="sm" variant="secondary" onClick={() => setEditing(it)}>
                                                                Edit
                                                            </Button>
                                                        </SheetTrigger>
                                                        <SheetContent side="right">
                                                            <SheetHeader>
                                                                <SheetTitle>Edit information</SheetTitle>
                                                                <SheetDescription>Update the content and save changes.</SheetDescription>
                                                            </SheetHeader>
                                                            <div className="p-4 pt-0">
                                                                <Form
                                                                    {...informationRoutes.update.form(it.id)}
                                                                    options={{ preserveScroll: true }}
                                                                    resetOnSuccess
                                                                    onSuccess={() => {
                                                                        setEditing(null);
                                                                        void loadItems();
                                                                    }}
                                                                    className="space-y-6"
                                                                >
                                                                    {({ processing, errors, recentlySuccessful }) => (
                                                                        <>
                                                                            <div className="grid gap-2">
                                                                                {partners.length <= 1 ? (
                                                                                    <div className="text-sm text-muted-foreground">
                                                                                        {partners.length === 1 ? (
                                                                                            <>
                                                                                                Adding info for <span className="font-medium">{partners[0].name}</span>
                                                                                                <input type="hidden" name="partner_id" value={partners[0].id} />
                                                                                            </>
                                                                                        ) : (
                                                                                            <>No partners found. Please add a partner first.</>
                                                                                        )}
                                                                                    </div>
                                                                                ) : (
                                                                                    <>
                                                                                        <Label htmlFor={`edit-partner_id-${it.id}`}>Partner</Label>
                                                                                        <input type="hidden" id={`edit-partner_id_hidden_${it.id}`} name="partner_id" defaultValue={String(it.partner_id ?? partners[0]?.id)} />
                                                                                        <Select defaultValue={String(it.partner_id ?? partners[0]?.id)} onValueChange={(v) => { const el = document.getElementById(`edit-partner_id_hidden_${it.id}`) as HTMLInputElement | null; if (el) el.value = v; }}>
                                                                                            <SelectTrigger id={`edit-partner_id-${it.id}`}>
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
                                                                                        <InputError message={errors.partner_id} />
                                                                                    </>
                                                                                )}
                                                                            </div>

                                                                            <div className="grid gap-2">
                                                                                <Label htmlFor={`edit-content-${it.id}`}>Content</Label>
                                                                                <Textarea id={`edit-content-${it.id}`} name="content" defaultValue={it.content} required />
                                                                                <InputError message={errors.content} />
                                                                            </div>
                                                                            <div className="flex items-center justify-end gap-2">
                                                                                <SheetClose asChild>
                                                                                    <Button variant="secondary" type="button">
                                                                                        Cancel
                                                                                    </Button>
                                                                                </SheetClose>
                                                                                <Button disabled={processing} type="submit">
                                                                                    Save
                                                                                </Button>
                                                                                <Transition
                                                                                    show={recentlySuccessful}
                                                                                    enter="transition ease-in-out"
                                                                                    enterFrom="opacity-0"
                                                                                    leave="transition ease-in-out"
                                                                                    leaveTo="opacity-0"
                                                                                >
                                                                                    <p className="text-sm text-neutral-600">Saved</p>
                                                                                </Transition>
                                                                            </div>
                                                                        </>
                                                                    )}
                                                                </Form>
                                                            </div>
                                                        </SheetContent>
                                                    </Sheet>
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button size="sm" variant="destructive">
                                                                Delete
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogTitle>Delete information</DialogTitle>
                                                            <DialogDescription>
                                                                Are you sure you want to delete this information? This action cannot be undone.
                                                            </DialogDescription>
                                                            <Form
                                                                {...informationRoutes.destroy.form(it.id)}
                                                                options={{ preserveScroll: true }}
                                                                resetOnSuccess
                                                                onSuccess={() => {
                                                                    void loadItems();
                                                                }}
                                                            >
                                                                {({ processing }) => (
                                                                    <DialogFooter className="gap-2">
                                                                        <DialogClose asChild>
                                                                            <Button variant="secondary" type="button">
                                                                                Cancel
                                                                            </Button>
                                                                        </DialogClose>
                                                                        <Button variant="destructive" disabled={processing} asChild>
                                                                            <button type="submit">Delete</button>
                                                                        </Button>
                                                                    </DialogFooter>
                                                                )}
                                                            </Form>
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
