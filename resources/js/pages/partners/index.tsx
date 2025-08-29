import { Form, Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import partnersRoutes from '@/routes/partners';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import HeadingSmall from '@/components/heading-small';
import { Transition } from '@headlessui/react';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState } from 'react';

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

type PageProps = {
  partners: Partner[];
};

export default function PartnersPage({ partners }: PageProps) {
  const [editing, setEditing] = useState<Partner | null>(null);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Partners" />

      <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
        <div className="space-y-6">
          <HeadingSmall title="Add partner" description="Create a new partner with name and brief description" />

          <Form {...partnersRoutes.store.form()} options={{ preserveScroll: true }} className="space-y-6">
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

                <div className="flex items-center gap-4">
                  <Button disabled={processing}>Save</Button>
                  <Transition show={recentlySuccessful} enter="transition ease-in-out" enterFrom="opacity-0" leave="transition ease-in-out" leaveTo="opacity-0">
                    <p className="text-sm text-neutral-600">Saved</p>
                  </Transition>
                </div>
              </>
            )}
          </Form>
        </div>

        <div className="space-y-4">
          <HeadingSmall title="Your partners" description="Manage your saved partners" />
          <div className="overflow-hidden rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Description</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {partners.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-muted-foreground">
                      No partners yet.
                    </td>
                  </tr>
                )}
                {partners.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="px-4 py-2">
                      {editing?.id === p.id ? (
                        <Form {...partnersRoutes.update.form(p.id)} options={{ preserveScroll: true }} resetOnSuccess onSuccess={() => setEditing(null)} className="grid gap-2 sm:grid-cols-2">
                          {({ processing, errors }) => (
                            <>
                              <div className="grid gap-2">
                                <Label htmlFor={`name-${p.id}`} className="sr-only">
                                  Name
                                </Label>
                                <Input id={`name-${p.id}`} name="name" defaultValue={p.name} required />
                                <InputError message={errors.name} />
                              </div>
                              <div className="grid gap-2 sm:col-span-2">
                                <Label htmlFor={`description-${p.id}`} className="sr-only">
                                  Description
                                </Label>
                                <Input id={`description-${p.id}`} name="description" defaultValue={p.description ?? ''} />
                                <InputError message={errors.description} />
                              </div>
                              <div className="col-span-2 flex justify-end gap-2">
                                <Button variant="secondary" type="button" onClick={() => setEditing(null)}>
                                  Cancel
                                </Button>
                                <Button disabled={processing} type="submit">
                                  Save
                                </Button>
                              </div>
                            </>
                          )}
                        </Form>
                      ) : (
                        <div className="pr-4">
                          <div className="font-medium">{p.name}</div>
                          <div className="text-muted-foreground">{p.description}</div>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 align-top hidden sm:table-cell">{/* description already shown in first cell on mobile */}</td>
                    <td className="px-4 py-2 text-right align-top">
                      {editing?.id === p.id ? null : (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="secondary" onClick={() => setEditing(p)}>
                            Edit
                          </Button>
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
                              <Form {...partnersRoutes.destroy.form(p.id)} options={{ preserveScroll: true }} resetOnSuccess>
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
                      )}
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
