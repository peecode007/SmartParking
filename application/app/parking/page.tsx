'use client';

import { useState } from 'react';

export default function ParkingForm() {
  type ParkingResponse = {
    message: string;
    info?: string;
  };

  const [info, setInfo] = useState<ParkingResponse | null>(null);
  const [numberplate, setNumberplate] = useState('');
  const [token, setToken] = useState('');
  const [result, setResult] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    setInfo(null);

    try {
      const res = await fetch('/api/parking/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, numberplate }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResult(`Error: ${data.error || 'Access Denied'}`);
        return;
      }

      setResult('Access Granted');
      setInfo(data);
    } catch (error) {
      console.error('Fetch error:', error);
      setResult('Error: Server unavailable');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center text-gray-800">Smart Parking System</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
        <div className="flex flex-col">
          <label htmlFor="numberplate" className="font-semibold text-gray-700">
            Numberplate:
          </label>
          <input
            id="numberplate"
            type="text"
            value={numberplate}
            onChange={(e) => setNumberplate(e.target.value)}
            placeholder="e.g., ABC123"
            className="text-black p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="token" className="font-semibold text-gray-700">
            Camera Token:
          </label>
          <input
            id="token"
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="e.g., valid-camera-token-123"
            className="text-black p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Check Access
        </button>
      </form>
      {result === 'Access Granted' && info && (
        <div className="mt-6 p-4 bg-gray-100 border rounded-md text-sm text-gray-800 space-y-2">
          <p className="text-green-700 font-medium">{result}: {info.message}</p>
          <p>{info.info}</p>
        </div>
      )}
      {result && result !== 'Access Granted' && (
        <p className="mt-4 text-center text-red-600">{result}</p>
      )}
    </div>
  );
}