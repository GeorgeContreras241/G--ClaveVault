export const metadata = {
    title: "Online",
    description: "Online",
};

export default function OnlineLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-dvh flex flex-col">
            <header className="py-4 text-center">
                <h1>Header</h1>
            </header>
            {children}
            <footer className="mt-auto py-4 text-center">
                <p>Footer</p>
            </footer>
        </div>
    );
}