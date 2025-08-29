import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import AppLayout from '@/layouts/app-layout';
import informationRoutes from '@/routes/information';
import { type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Form, Head } from '@inertiajs/react';
import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Information',
        href: informationRoutes.index().url,
    },
];

type Information = {
    id: number;
    content: string;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
// Simple speech recognition hook using Web Speech API
function useSpeechToText(onText: (text: string, isFinal: boolean) => void) {
    const recognitionRef = useRef<any | null>(null);
    const [supported] = useState<boolean>(
        () => typeof window !== 'undefined' && (!!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition),
    );
    const [listening, setListening] = useState(false);

    useEffect(() => {
        if (!supported) return;
        type AnySpeechRecognition = any;
        const SR: AnySpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const rec: any = new (SR as any)();
        rec.lang = document.documentElement.lang || navigator.language || 'en-US';
        rec.interimResults = true;
        rec.continuous = true;
        rec.onresult = (e: any) => {
            for (let i = e.resultIndex; i < e.results.length; i++) {
                const result = e.results[i];
                const transcript = result[0]?.transcript ?? '';
                onText(transcript, result.isFinal);
            }
        };
        rec.onend = () => {
            setListening(false);
        };
        rec.onerror = () => {
            setListening(false);
        };
        recognitionRef.current = rec;
        return () => {
            try {
                rec.stop();
            } catch {
                /* ignore */
            }
            recognitionRef.current = null;
        };
    }, [supported, onText]);

    const start = () => {
        if (!supported || listening) return;
        try {
            recognitionRef.current?.start();
            setListening(true);
        } catch {
            /* ignore */
        }
    };

    const stop = () => {
        if (!supported || !listening) return;
        try {
            recognitionRef.current?.stop();
        } catch {
            /* ignore */
        } finally {
            setListening(false);
        }
    };

    return { supported, listening, start, stop } as const;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(function Textarea(props, ref) {
    return (
        <textarea
            ref={ref}
            data-slot="textarea"
            className={
                'flex h-32 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:ring-destructive/40'
            }
            {...props}
        />
    );
});

function MicTextarea(props: React.ComponentProps<'textarea'>) {
    const textareaProps = props;
    const textRef = useRef<HTMLTextAreaElement | null>(null);
    const speech = useSpeechToText((fragment, isFinal) => {
        const base = (textRef.current?.value ?? '').replace(/\s+$/, '');
        const interim = isFinal ? fragment + ' ' : fragment;
        const next = (base + (base ? ' ' : '') + interim).trimStart();
        if (textRef.current) textRef.current.value = next;
    });
    return (
        <div className="relative">
            <Textarea ref={textRef} {...textareaProps} />
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>{!speech.supported ? 'Speech recognition not supported in this browser.' : 'Tip: Click mic and start speaking.'}</span>
                {speech.supported && (
                    <Button
                        type="button"
                        variant={speech.listening ? 'destructive' : 'secondary'}
                        size="sm"
                        onClick={() => (speech.listening ? speech.stop() : speech.start())}
                        aria-pressed={speech.listening}
                        className="ml-2"
                    >
                        {speech.listening ? (
                            <>
                                <MicOff className="mr-1 h-4 w-4" /> Stop
                            </>
                        ) : (
                            <>
                                <Mic className="mr-1 h-4 w-4" /> Mic
                            </>
                        )}
                    </Button>
                )}
            </div>
        </div>
    );
}

export default function InformationPage() {
    // speech handled by MicTextarea component
    const [items, setItems] = useState<Information[]>([]);
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

    useEffect(() => {
        void loadItems();
    }, []);

    const [editing, setEditing] = useState<Information | null>(null);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Information" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <HeadingSmall title="Information" description="Add notes or information about your partner" />
                        <Sheet>
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
                                            void loadItems();
                                        }}
                                        className="space-y-6"
                                    >
                                        {({ processing, recentlySuccessful, errors }) => (
                                            <>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="content">Content</Label>
                                                    <MicTextarea
                                                        id="content"
                                                        name="content"
                                                        placeholder="Type your information here (or use the mic)"
                                                        required
                                                    />
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
                    </div>
                </div>

                <div className="space-y-4">
                    <HeadingSmall title="Your information" description="Manage saved information entries" />
                    <div className="overflow-hidden rounded-md border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-4 py-2 text-left">Content</th>
                                    <th className="px-4 py-2 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && (
                                    <tr>
                                        <td colSpan={2} className="px-4 py-6 text-center text-muted-foreground">
                                            Loading...
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
                                        <tr key={it.id} className="border-t">
                                            <td className="px-4 py-2">
                                                <div className="pr-4">
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
                                                                                <Label htmlFor={`edit-content-${it.id}`}>Content</Label>
                                                                                <MicTextarea
                                                                                    id={`edit-content-${it.id}`}
                                                                                    name="content"
                                                                                    defaultValue={it.content}
                                                                                    required
                                                                                />
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
