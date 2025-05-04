// app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextauth]/route';
import Link from 'next/link';
import ClientSessionProvider from './ClientSessionProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Smart Parking System',
  description: 'A smart parking system with user authentication and fee deduction',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientSessionProvider session={session}>
          <nav className="flex items-center justify-between px-6 py-4 bg-gray-800 text-white">
            {/* Left: Smart Parking System */}
            <Link href="/" className="text-2xl font-bold">
              Smart Parking System
            </Link>

            {/* Center: Parking Test and Dashboard/Admin Dashboard */}
            <div className="absolute left-1/2 transform -translate-x-1/2 flex space-x-6">
              <Link href="/parking" className="hover:underline">
                Parking Test
              </Link>
              {session && (
                <Link
                  href={session.user.role === 'admin' ? '/admin-dashboard' : '/dashboard'}
                  className="hover:underline"
                >
                  {session.user.role === 'admin' ? 'Admin Dashboard' : 'Dashboard'}
                </Link>
              )}
            </div>

            {/* Right: Login/Register or Logout */}
            <div className="flex space-x-4">
              {session ? (
                <Link href="/api/auth/signout" className="hover:underline">
                  Logout
                </Link>
              ) : (
                <>
                  <Link href="/login" className="hover:underline">
                    Login
                  </Link>
                  <Link href="/register" className="hover:underline">
                    Register
                  </Link>
                </>
              )}
            </div>
          </nav>
          {children}
        </ClientSessionProvider>
      </body>
    </html>
  );
}