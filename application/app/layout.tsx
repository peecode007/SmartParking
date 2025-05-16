// app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import { getServerSession } from 'next-auth/next';
<<<<<<< HEAD
import { authOptions } from '@/lib/authOptions';
=======
import { authOptions } from "@/lib/authOptions";
>>>>>>> 72f467238828254b18ae9a2f965f5bdf175dc8a9
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
<<<<<<< HEAD
          <nav className="flex items-center justify-between px-6 py-4 bg-black/30 backdrop-blur border-b border-gray-700 text-white shadow-md relative z-50">
            {/* Left: Brand */}
            <Link href="/" className="text-2xl font-extrabold tracking-tight hover:text-blue-400 transition">
        Smart Parking
=======
          <nav className="flex items-center justify-between px-6 py-4 bg-gray-800 text-white">
            {/* Left: Smart Parking System */}
            <Link href="/" className="text-2xl font-bold">
                            Smart Parking System
>>>>>>> 72f467238828254b18ae9a2f965f5bdf175dc8a9
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
<<<<<<< HEAD
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
=======
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
>>>>>>> 72f467238828254b18ae9a2f965f5bdf175dc8a9
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
