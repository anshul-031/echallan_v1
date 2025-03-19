export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen h-screen bg-gradient-to-br from-black-50 to-green-50 flex items-center justify-center p-4">
      {children}
    </div>
  );
}
