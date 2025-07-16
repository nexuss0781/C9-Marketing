// This layout will apply to all authentication pages (sign-in, sign-up)
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4">
      {children}
    </main>
  );
}
