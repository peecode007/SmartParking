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
  <div className="max-w-md mx-auto mt-16 p-6 bg-white/5 backdrop-blur border border-gray-700 rounded-lg shadow-lg text-gray-100">
    <h1 className="text-3xl font-bold text-center mb-6 text-white">Login</h1>
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Email Field */}
      <div className="flex flex-col">
        <label htmlFor="email" className="font-medium text-gray-300 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="e.g., testing@gmail.com"
          className="p-2 bg-gray-900 border border-gray-600 rounded-md text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>

      {/* Password Field */}
      <div className="flex flex-col">
        <label htmlFor="password" className="font-medium text-gray-300 mb-1">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 bg-gray-900 border border-gray-600 rounded-md text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition font-semibold"
      >
        Login
      </button>
    </form>

    {/* Error Message */}
    {error && (
      <p className="mt-4 text-center text-red-400 font-medium bg-red-600/10 py-2 px-4 rounded-md border border-red-500">
        {error}
      </p>
    )}
  </div>
);

}