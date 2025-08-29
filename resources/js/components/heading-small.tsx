export default function HeadingSmall({ title, description }: { title: string; description?: string }) {
    return (
        <header>
            <h3 className="text-base font-semibold tracking-tight text-foreground mb-1">{title}</h3>
            {description && <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>}
        </header>
    );
}
