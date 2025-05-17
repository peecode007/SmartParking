'use client';

import { useState } from 'react';

export default function ParkingForm() {
  type ParkingResponse = {
    plate_number?: string;
    message: string;
  };

  const [info, setInfo] = useState<ParkingResponse | null>(null);
  const [numberplate, setNumberplate] = useState('');
  const [token, setToken] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Submit manual numberplate
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    setInfo(null);
    setLoading(true);

    try {
      const res = await fetch('/api/parking/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, numberplate }),
      });

      const data = await res.json();

      setResult(res.ok ? 'Access Granted' : `Error: ${data.error || 'Access Denied'}`);
      setInfo(data);
    } catch (error) {
      console.error('Manual submit error:', error);
      setResult('Error: Server unavailable');
    } finally {
      setLoading(false);
    }
  };

  // Submit image for plate recognition
  const handleImageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    setInfo(null);

    if (!imageFile) {
      setResult('Please select an image first');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const res = await fetch('/api/platerecog', {
        method: 'POST',
        headers: {
          'X-API-KEY': token,
        },
        body: formData,
      });

      const data = await res.json();

      setResult(res.ok ? 'Access Granted' : `Error: ${data.error || data.message}`);
      setInfo(data);
    } catch (error) {
      console.error('Image upload error:', error);
      setResult('Error: Server unavailable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center text-gray-800">Smart Parking System</h1>

      {/* Manual Numberplate Form */}
      <form onSubmit={handleManualSubmit} className="flex flex-col gap-4 mt-4">
        <div>
          <label htmlFor="numberplate" className="block font-medium text-gray-700">Numberplate:</label>
          <input
            id="numberplate"
            type="text"
            value={numberplate}
            onChange={(e) => setNumberplate(e.target.value)}
            placeholder="e.g., ABC123"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label htmlFor="token" className="block font-medium text-gray-700">Camera Token:</label>
          <input
            id="token"
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Camera API token"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
        >
          {loading ? 'Checking...' : 'Check Access Manually'}
        </button>
      </form>

      <hr className="my-6" />

      {/* Image Upload Form */}
      <form onSubmit={handleImageSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="image" className="block font-medium text-gray-700">Upload Image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white p-2 rounded-md hover:bg-green-700"
        >
          {loading ? 'Recognizing...' : 'Upload & Recognize Plate'}
        </button>
      </form>

      {/* Result Display */}
      {result && (
        <div className="mt-6 p-4 bg-gray-100 border rounded-md text-sm text-gray-800 space-y-2">
          <p className={result.startsWith('Access') ? 'text-green-700 font-medium' : 'text-red-600'}>
            {result}
          </p>
          {info?.plate_number && <p>Plate: <strong>{info.plate_number}</strong></p>}
          <p>{info?.message}</p>
        </div>
      )}
    </div>
  );
}
