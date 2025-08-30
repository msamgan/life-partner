export default function AppLogo() {
    return (
        <>
            <img
                src="/lp-logo.png"
                alt="Life Partner Logo"
                className="h-8 w-8 rounded-md object-contain bg-sidebar-primary"
            />
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">Life Partner</span>
            </div>
        </>
    );
}
