'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    if (res.ok) {
      router.push('/login');
    } else {
      const data = await res.json();
      setError(data.error);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white/5 backdrop-blur border border-gray-700 rounded-lg shadow-lg text-gray-100">
      <h1 className="text-3xl font-bold text-center mb-6 text-white">Register</h1>
    
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Name */}
        <div className="flex flex-col">
          <label htmlFor="name" className="font-medium text-gray-300 mb-1">
          Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., John Doe"
            className="p-2 bg-gray-900 border border-gray-600 rounded-md text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {/* Email */}
        <div className="flex flex-col">
          <label htmlFor="email" className="font-medium text-gray-300 mb-1">
          Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g., user@example.com"
            className="p-2 bg-gray-900 border border-gray-600 rounded-md text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {/* Password */}
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
        Register
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