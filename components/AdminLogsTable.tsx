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
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 shadow-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-2 px-4 border-b text-left">Numberplate</th>
                                <th className="py-2 px-4 border-b text-left">Action</th>
                                <th className="py-2 px-4 border-b text-left">Parking Lot</th>
                                <th className="py-2 px-4 border-b text-left">Time</th>
                                <th className="py-2 px-4 border-b text-left">User</th>
                                <th className="py-2 px-4 border-b text-left">User Email</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log) => (
                                <tr key={log._id}>
                                    <td className="py-2 px-4 border-b">{log.numberplate}</td>
                                    <td className="py-2 px-4 border-b capitalize">{log.action}</td>
                                    <td className="py-2 px-4 border-b">{log.parkingLot}</td>
                                    <td className="py-2 px-4 border-b">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td className="py-2 px-4 border-b">{log.user?.name || '-'}</td>
                                    <td className="py-2 px-4 border-b">{log.user?.email || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="mt-4 flex justify-between items-center">
                        <p className="text-sm text-gray-600">
                            Page {page} of {totalPages}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="bg-gray-200 px-3 py-1 rounded disabled:opacity-50"
                            >
                                Prev
                            </button>
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="bg-gray-200 px-3 py-1 rounded disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
