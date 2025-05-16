'use client';

import { useState, useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [numberplate, setNumberplate] = useState('');
  const [money, setMoney] = useState('');
  const [numberplates, setNumberplates] = useState([]);
  const [balance, setBalance] = useState<number | null>(null);
  const [logs, setLogs] = useState([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('desc');
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const limit = 10;

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

  const fetchLogs = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const res = await fetch(
        `/api/logs/user?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&sort=${sort}`,
        { headers: { 'Content-Type': 'application/json' } }
      );
      const data = await res.json();
      console.log('Fetch logs response:', JSON.stringify(data, null, 2));
      if (res.ok) {
        setLogs(data.logs || []);
        setTotalLogs(data.total || 0);
        if (data.logs.length === 0 && !search) {
          setMessage('No parking history found');
        }
      } else {
        setMessage(data.error || 'Failed to load parking history');
        setLogs([]);
        setTotalLogs(0);
      }
    } catch (err) {
      setMessage('Error fetching parking history');
      console.error('Fetch logs error:', err);
      setLogs([]);
      setTotalLogs(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user?.id) {
      console.log('Session user:', session.user);
      fetchBalance();
      fetchNumberplates();
      fetchLogs();
    }
  }, [status, session, router, page, search, sort]);

  const handleSubmitNumberplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!numberplate.trim()) {
      setMessage('Numberplate is required');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/numberplate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numberplate: numberplate.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Numberplate added successfully');
        setNumberplate('');
        await fetchNumberplates();
        await fetchLogs(); // Refresh logs in case new numberplate has logs
      } else {
        setMessage(data.error || 'Failed to add numberplate');
      }
    } catch {
      setMessage('Server error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const amount = Number(money);
    if (!money.trim() || isNaN(amount) || amount <= 0) {
      setMessage('Enter a valid amount');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/user/balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Money added successfully');
        setMoney('');
        await fetchBalance();
      } else {
        setMessage(data.error || 'Failed to add money');
      }
    } catch {
      setMessage('Server error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleSort = () => {
    setSort(sort === 'desc' ? 'asc' : 'desc');
    setPage(1);
  };

  if (status === 'loading') return <p className="text-center text-gray-600">Loading...</p>;

  return (
  <div className="max-w-6xl mx-auto mt-10 px-4 py-6 bg-gray-50 min-h-screen">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">User Dashboard</h1>
        <p className="mt-1 text-gray-600">Welcome, {session?.user?.email}</p>
      </div>
    </div>

    {message && (
      <div className={`p-3 rounded-md mb-4 text-sm ${message.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        {message}
      </div>
    )}

    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Balance */}
      <div className="bg-white p-5 rounded-md shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Balance</h2>
        <p className="text-gray-600">
          Current Balance:{' '}
          <span className={`font-bold ${balance !== null && balance < 100 ? 'text-red-600' : 'text-black'}`}>
            Rs {balance !== null ? balance : 'Loading...'}
          </span>
        </p>
      </div>

      {/* Add Money */}
      <div className="bg-white p-5 rounded-md shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Add Money</h2>
        <form onSubmit={handleSubmitBalance} className="flex gap-3 items-center">
          <input
            type="number"
            value={money}
            onChange={(e) => setMoney(e.target.value)}
            placeholder="e.g., 100"
            className="flex-1 p-2 border border-gray-300 rounded-md text-black"
            disabled={isLoading}
            min="1"
          />
          <button
            type="submit"
            disabled={isLoading}
            className={`px-4 py-2 rounded-md text-white ${isLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isLoading ? 'Adding...' : 'Add'}
          </button>
        </form>
      </div>

      {/* Add Numberplate */}
      <div className="bg-white p-5 rounded-md shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Add Numberplate</h2>
        <form onSubmit={handleSubmitNumberplate} className="flex gap-3 items-center">
          <input
            type="text"
            value={numberplate}
            onChange={(e) => setNumberplate(e.target.value)}
            placeholder="e.g., ABC123"
            className="flex-1 p-2 border border-gray-300 rounded-md text-black uppercase"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className={`px-4 py-2 rounded-md text-white ${isLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isLoading ? 'Adding...' : 'Add'}
          </button>
        </form>
      </div>

      {/* Numberplates */}
      <div className="bg-white p-5 rounded-md shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Your Numberplates</h2>
        {numberplates.length === 0 ? (
          <p className="text-gray-600">No numberplates added.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {numberplates.map((np: any) => (
              <li key={np._id} className="bg-gray-200 px-3 py-1 rounded font-semibold text-black">
                {np.numberplate}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>

    {/* Logs Table */}
    <div className="mt-8 bg-white p-6 rounded-md shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
        <h2 className="text-xl font-semibold text-gray-800">Parking History</h2>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search by numberplate..."
            value={search}
            onChange={handleSearch}
            className="p-2 border border-gray-300 rounded-md text-black"
          />
          <button
            onClick={handleSort}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {sort === 'desc' ? 'Newest First' : 'Oldest First'}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="h-1 bg-blue-600 animate-pulse rounded-md"></div>
      ) : logs.length === 0 ? (
        <p className="text-gray-600">No parking history found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border text-sm text-left text-gray-700">
            <thead className="bg-gray-100 text-gray-800 uppercase">
              <tr>
                <th className="p-2">Numberplate</th>
                <th className="p-2">Parking Lot</th>
                <th className="p-2">Action</th>
                <th className="p-2">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log: any) => (
                <tr key={log._id} className="border-t hover:bg-gray-50">
                  <td className="p-2">{log.numberplate}</td>
                  <td className="p-2">{log.parkingLot}</td>
                  <td className="p-2 capitalize">{log.action}</td>
                  <td className="p-2">{format(new Date(log.timestamp), 'PPp')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
        <span>
          Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalLogs)} of {totalLogs}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page * limit >= totalLogs}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
);

}