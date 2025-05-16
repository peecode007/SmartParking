'use client';

import { useEffect, useState } from 'react';

type LogEntry = {
    _id: string;
    numberplate: string;
    action: string;
    timestamp: string;
    parkingLot: string;
    user?: {
        name: string;
        email: string;

    };
};

export default function AdminLogsTable() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/logs/admin?page=${page}&limit=${limit}&search=${search}`);
      const data = await res.json();
      if (res.ok) {
        setLogs(data.logs);
        setTotal(data.total);
      } else {
        setError(data.error || 'Failed to fetch logs');
      }
    } catch (err) {
      setError('Something went wrong fetching logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, search]);

  const totalPages = Math.ceil(total / limit);

  return (
<<<<<<< HEAD
    <div className="mt-10 p-6 bg-white/5 backdrop-blur border border-gray-700 rounded-lg shadow-lg text-gray-100">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-white">Recent Activity Logs</h2>

        <input
          type="text"
          placeholder="Search by numberplate..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-64 px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>

      {loading ? (
        <p className="text-gray-400">Loading logs...</p>
=======
    <div className="mt-10 p-4 bg-white shadow-md rounded-lg text-black">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-700">Recent Activity Logs</h2>

        <div className="mb-4 flex items-center gap-2">
          <input
            type="text"
            placeholder="Search by numberplate..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2 rounded w-64"
          />
        </div>
      </div>


      {loading ? (
        <p className="text-gray-600">Loading logs...</p>
>>>>>>> 72f467238828254b18ae9a2f965f5bdf175dc8a9
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="overflow-x-auto">
<<<<<<< HEAD
          <table className="min-w-full text-sm text-gray-200 border border-gray-700 bg-gray-950/30">
            <thead className="bg-gray-800 text-gray-300 uppercase">
              <tr>
                <th className="py-2 px-4 border-b border-gray-700 text-left">Numberplate</th>
                <th className="py-2 px-4 border-b border-gray-700 text-left">Action</th>
                <th className="py-2 px-4 border-b border-gray-700 text-left">Parking Lot</th>
                <th className="py-2 px-4 border-b border-gray-700 text-left">Time</th>
                <th className="py-2 px-4 border-b border-gray-700 text-left">User</th>
                <th className="py-2 px-4 border-b border-gray-700 text-left">User Email</th>
=======
          <table className="min-w-full bg-white border border-gray-200 shadow-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border-b text-left">Numberplate</th>
                <th className="py-2 px-4 border-b text-left">Action</th>
                <th className="py-2 px-4 border-b text-left">Parking Lot</th>
                <th className="py-2 px-4 border-b text-left">Time</th>
                <th className="py-2 px-4 border-b text-left">User</th>
                <th className="py-2 px-4 border-b text-left">User Email</th>
>>>>>>> 72f467238828254b18ae9a2f965f5bdf175dc8a9
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
<<<<<<< HEAD
                <tr key={log._id} className="hover:bg-gray-800 transition">
                  <td className="py-2 px-4 border-b border-gray-700">{log.numberplate}</td>
                  <td className="py-2 px-4 border-b border-gray-700 capitalize">{log.action}</td>
                  <td className="py-2 px-4 border-b border-gray-700">{log.parkingLot}</td>
                  <td className="py-2 px-4 border-b border-gray-700">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-700">{log.user?.name || '-'}</td>
                  <td className="py-2 px-4 border-b border-gray-700">{log.user?.email || '-'}</td>
=======
                <tr key={log._id}>
                  <td className="py-2 px-4 border-b">{log.numberplate}</td>
                  <td className="py-2 px-4 border-b capitalize">{log.action}</td>
                  <td className="py-2 px-4 border-b">{log.parkingLot}</td>
                  <td className="py-2 px-4 border-b">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-2 px-4 border-b">{log.user?.name || '-'}</td>
                  <td className="py-2 px-4 border-b">{log.user?.email || '-'}</td>
>>>>>>> 72f467238828254b18ae9a2f965f5bdf175dc8a9
                </tr>
              ))}
            </tbody>
          </table>

<<<<<<< HEAD
          <div className="mt-6 flex justify-between items-center text-sm text-gray-400">
            <span>Page {page} of {totalPages}</span>
=======
          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
                            Page {page} of {totalPages}
            </p>
>>>>>>> 72f467238828254b18ae9a2f965f5bdf175dc8a9
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
<<<<<<< HEAD
                className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-40"
              >
              Prev
=======
                className="bg-gray-200 px-3 py-1 rounded disabled:opacity-50"
              >
                                Prev
>>>>>>> 72f467238828254b18ae9a2f965f5bdf175dc8a9
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
<<<<<<< HEAD
                className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-40"
              >
              Next
=======
                className="bg-gray-200 px-3 py-1 rounded disabled:opacity-50"
              >
                                Next
>>>>>>> 72f467238828254b18ae9a2f965f5bdf175dc8a9
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
<<<<<<< HEAD

=======
>>>>>>> 72f467238828254b18ae9a2f965f5bdf175dc8a9
}
