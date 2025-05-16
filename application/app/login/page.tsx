// app/login/page.tsx
'use client';

import { useState } from 'react';
import { getSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError(result.error || 'Invalid email or password');
      } else {
        const session = await getSession();
        const role = session?.user?.role;

        if (role === 'admin') {
          router.push('/admin-dashboard');
          router.refresh(); // Refresh the page to ensure the session is updated
        } else {
          router.push('/dashboard');
          router.refresh(); // Refresh the page to ensure the session is updated
        }
      }
    } catch (err) {
      console.error('signIn error:', err);
      setError('An unexpected error occurred');
    }
  };


  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center text-gray-800">Login</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
        <div className="flex flex-col">
          <label htmlFor="email" className="font-semibold text-gray-700">
                        Email:
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g., testing@gmail.com"
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="password" className="font-semibold text-gray-700">
                        Password:
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
        </div>
        <button
          type="submit"
          className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
                    Login
        </button>
      </form>
      {error && <p className="mt-4 text-center text-red-600">{error}</p>}
    </div>
  );
}
