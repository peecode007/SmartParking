'use client';

import { useState, useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [numberplate, setNumberplate] = useState('');
  const [money, setMoney] = useState('');
  const [numberplates, setNumberplates] = useState([]);
  const [message, setMessage] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);

  const fetchBalance = async () => {
    try {
      const res = await fetch('/api/user/balance');
      if (res.ok) {
        const data = await res.json();
        setBalance(data.balance);
      } else {
        setMessage('Failed to fetch balance');
      }
    } catch {
      setMessage('Server error');
    }
  };

  const fetchNumberplates = async () => {
    try {
      const res = await fetch('/api/numberplate');
      if (res.ok) {
        const data = await res.json();
        setNumberplates(data);
      } else {
        setMessage('Failed to fetch numberplates');
      }
    } catch {
      setMessage('Server error');
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user?.id) {
      fetchBalance();
      fetchNumberplates();
    }
  }, [status, session, router]);

  useEffect(() => {
    if (balance !== null) {
      const interval = setInterval(() => {
        fetchBalance();
        fetchNumberplates(); // Refresh numberplates periodically
      }, 10000); // Fetch every 10 seconds
      return () => clearInterval(interval);
    }
  }, [balance]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      const res = await fetch('/api/numberplate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numberplate }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Numberplate added successfully');
        setNumberplate('');
        await fetchNumberplates(); // Refresh numberplates
      } else {
        setMessage(data.error || 'Failed to add numberplate');
      }
    } catch {
      setMessage('Server error');
    }
  };

  const handleSubmitBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      const res = await fetch('/api/user/balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(money) }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Money added successfully');
        setMoney('');
        await fetchBalance(); // Refresh balance
      } else {
        setMessage(data.error || 'Failed to add money');
      }
    } catch {
      setMessage('Server error');
    }
  };

  if (status === 'loading') return <p className="text-center text-gray-600">Loading...</p>;

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center text-gray-800">Dashboard</h1>
      <p className="mt-2 text-center text-gray-600">Welcome, {session?.user?.email}</p>
      <p className="mt-2 text-center text-gray-600">
        Balance: Rs {balance !== null ? balance : 'Loading...'}
      </p>

      {/* Add Numberplate Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6">
        <div className="flex flex-col">
          <label htmlFor="numberplate" className="font-semibold text-gray-700">
            Add Numberplate:
          </label>
          <input
            id="numberplate"
            type="text"
            value={numberplate}
            onChange={(e) => setNumberplate(e.target.value)}
            placeholder="e.g., ABC123"
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
        </div>
        <button
          type="submit"
          className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Add Numberplate
        </button>
      </form>

      {/* Add Money Form */}
      <form onSubmit={handleSubmitBalance} className="flex flex-col gap-4 mt-6">
        <div className="flex flex-col">
          <label htmlFor="balance" className="font-semibold text-gray-700">
            Add Money:
          </label>
          <input
            id="balance"
            type="text"
            value={money}
            onChange={(e) => setMoney(e.target.value)}
            placeholder="e.g., 100"
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
        </div>
        <button
          type="submit"
          className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Add Money
        </button>
      </form>

      {/* Numberplates List */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold text-gray-700">Your Numberplates</h2>
        {numberplates.length === 0 ? (
          <p className="mt-4 text-center text-gray-600">No numberplates added.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {numberplates.map((np: any) => (
              <li
                key={np._id}
                className="p-2 border border-gray-300 rounded-md text-black"
              >
                {np.numberplate}
              </li>
            ))}
          </ul>
        )}
      </div>

      {message && <p className="mt-4 text-center text-gray-600">{message}</p>}

      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="mt-6 p-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition w-full"
      >
        Logout
      </button>
    </div>
  );
}