import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import AppLayout from '@/layouts/app-layout';
import partnersRoutes from '@/routes/partners';
import { fetchPartners } from '@/utils/partners';
import { type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Form, Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Partners',
        href: partnersRoutes.index().url,
    },
];

type Partner = {
    id: number;
    name: string;
    description?: string | null;
};

export default function PartnersPage() {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const loadPartners = async () => {
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

    useEffect(() => {
        void loadPartners();
    }, []);

    const [editing, setEditing] = useState<Partner | null>(null);
        const [addOpen, setAddOpen] = useState<boolean>(false);

        useEffect(() => {
            const params = new URLSearchParams(window.location.search);
            if (params.get('open') === 'add') {
                setAddOpen(true);
            }
        }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Partners" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <HeadingSmall title="Partner" description="Create/Update a partner with name and brief description" />
                        <Sheet open={addOpen} onOpenChange={setAddOpen}>
                            <SheetTrigger asChild>
                                <Button size="sm">Add partner</Button>
                            </SheetTrigger>
                            <SheetContent side="right">
                                <SheetHeader>
                                    <SheetTitle>Partner</SheetTitle>
                                    <SheetDescription>Fill in the details below to add a new partner.</SheetDescription>
                                </SheetHeader>
                                <div className="p-4 pt-0">
                                    <Form
                                        {...partnersRoutes.store.form()}
                                        options={{ preserveScroll: true }}
                                        resetOnSuccess
                                        onSuccess={() => {
                                            setAddOpen(false);
                                            void loadPartners();
                                        }}
                                        className="space-y-6"
                                    >
                                        {({ processing, recentlySuccessful, errors }) => (
                                            <>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="name">Name</Label>
                                                    <Input id="name" name="name" placeholder="Partner name" required />
                                                    <InputError message={errors.name} />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="description">Description</Label>
                                                    <Input id="description" name="description" placeholder="Brief description" />
                                                    <InputError message={errors.description} />
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
                    </div>
                </div>

                <div className="space-y-4">
                    <HeadingSmall title="Your partners" description="Manage your saved partners" />
                    <div className="overflow-hidden rounded-md border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-muted-foreground/80">
                                <tr>
                                    <th className="px-4 py-2 text-left">Partner</th>
                                    <th className="px-4 py-2 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && (
                                    <tr>
                                        <td colSpan={3} className="px-4 py-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="mb-2 h-4 w-1/3"><Skeleton className="h-4 w-1/3" /></div>
                                                        <Skeleton className="h-3 w-2/3" />
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Skeleton className="h-8 w-16" />
                                                        <Skeleton className="h-8 w-20" />
                                                    </div>
                                                </div>
                                                <Skeleton className="h-px w-full" />
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="mb-2 h-4 w-1/3"><Skeleton className="h-4 w-1/3" /></div>
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
                                        <td colSpan={3} className="px-4 py-6 text-center text-red-600">
                                            {error}
                                        </td>
                                    </tr>
                                )}
                                {!loading && !error && partners.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-4 py-6 text-center text-muted-foreground">
                                            No partners yet.
                                        </td>
                                    </tr>
                                )}
                                {!loading &&
                                    !error &&
                                    partners.map((p) => (
                                        <tr key={p.id} className="border-t hover:bg-muted/40 transition-colors">
                                            <td className="px-4 py-2">
                                                <div className="pr-4">
                                                    <div className="font-medium">{p.name}</div>
                                                    <div className="text-muted-foreground">{p.description}</div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 text-right align-top">
                                                <div className="flex justify-end gap-2">
                                                    <Sheet
                                                        open={!!editing && editing.id === p.id}
                                                        onOpenChange={(open) => setEditing(open ? p : editing?.id === p.id ? null : editing)}
                                                    >
                                                        <SheetTrigger asChild>
                                                            <Button size="sm" variant="secondary" onClick={() => setEditing(p)}>
                                                                Edit
                                                            </Button>
                                                        </SheetTrigger>
                                                        <SheetContent side="right">
                                                            <SheetHeader>
                                                                <SheetTitle>Edit partner</SheetTitle>
                                                                <SheetDescription>Update the details and save changes.</SheetDescription>
                                                            </SheetHeader>
                                                            <div className="p-4 pt-0">
                                                                <Form
                                                                    {...partnersRoutes.update.form(p.id)}
                                                                    options={{ preserveScroll: true }}
                                                                    resetOnSuccess
                                                                    onSuccess={() => {
                                                                        setEditing(null);
                                                                        void loadPartners();
                                                                    }}
                                                                    className="space-y-6"
                                                                >
                                                                    {({ processing, errors, recentlySuccessful }) => (
                                                                        <>
                                                                            <div className="grid gap-2">
                                                                                <Label htmlFor={`edit-name-${p.id}`}>Name</Label>
                                                                                <Input
                                                                                    id={`edit-name-${p.id}`}
                                                                                    name="name"
                                                                                    defaultValue={p.name}
                                                                                    required
                                                                                />
                                                                                <InputError message={errors.name} />
                                                                            </div>
                                                                            <div className="grid gap-2">
                                                                                <Label htmlFor={`edit-description-${p.id}`}>Description</Label>
                                                                                <Input
                                                                                    id={`edit-description-${p.id}`}
                                                                                    name="description"
                                                                                    defaultValue={p.description ?? ''}
                                                                                />
                                                                                <InputError message={errors.description} />
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
                                                            <DialogTitle>Delete partner</DialogTitle>
                                                            <DialogDescription>
                                                                Are you sure you want to delete "{p.name}"? This action cannot be undone.
                                                            </DialogDescription>
                                                            <Form
                                                                {...partnersRoutes.destroy.form(p.id)}
                                                                options={{ preserveScroll: true }}
                                                                resetOnSuccess
                                                                onSuccess={() => {
                                                                    void loadPartners();
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
