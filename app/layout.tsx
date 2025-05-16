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
          <nav className="flex items-center justify-between px-6 py-4 bg-black/30 backdrop-blur border-b border-gray-700 text-white shadow-md relative z-50">
      {/* Left: Brand */}
      <Link href="/" className="text-2xl font-extrabold tracking-tight hover:text-blue-400 transition">
        Smart Parking
      </Link>

      {/* Center: Dashboard Link */}
      <div className="absolute left-1/2 transform -translate-x-1/2">
        {session && (
          <Link
            href={session.user.role === 'admin' ? '/admin-dashboard' : '/dashboard'}
            className="text-sm font-medium text-gray-300 hover:text-white transition"
          >
            {session.user.role === 'admin' ? 'Admin Dashboard' : 'Dashboard'}
          </Link>
        )}
      </div>

      {/* Right: Auth Links */}
      <div className="flex space-x-4 items-center text-sm font-medium">
        {session ? (
          <Link
            href="/api/auth/signout"
            className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 transition text-white"
          >
            Logout
          </Link>
        ) : (
          <>
            <Link
              href="/login"
              className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 transition text-white"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-md border border-blue-600 hover:bg-blue-600 transition"
            >
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