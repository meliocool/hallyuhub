export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex items-center justify-center w-full min-h-screen bg-muted/40 p-4">
      {children}
    </main>
  );
}
