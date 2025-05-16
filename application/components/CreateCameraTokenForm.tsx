'use client';

import { FormEvent } from 'react';

interface CreateCameraTokenFormProps {
    token: string;
    setToken: (value: string) => void;
    location: string;
    setLocation: (value: string) => void;
    parkingLots: any[];
    setError: (value: string | null) => void;
    setSuccess: (value: string | null) => void;
    fetchParkingLots: () => Promise<void>;
    fetchCameras: () => Promise<void>;
}

export default function CreateCameraTokenForm({
  token,
  setToken,
  location,
  setLocation,
  parkingLots,
  setError,
  setSuccess,
  fetchParkingLots,
  fetchCameras,
}: CreateCameraTokenFormProps) {
  const handleCreateToken = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const selectedLot = parkingLots.find((lot) => lot.name === location);
      if (!selectedLot) {
        throw new Error('Please select a valid parking lot');
      }

      const res = await fetch('/api/cameras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, location, parkingLotId: selectedLot._id }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create token');
      }
      setSuccess('Camera token created successfully');
      setToken('');
      setLocation('');
      await Promise.all([fetchParkingLots(), fetchCameras()]);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Create Camera Token</h2>
      <form onSubmit={handleCreateToken} className="space-y-4">
        <div>
          <label htmlFor="token" className="block font-medium text-gray-700">
                        Token:
          </label>
          <input
            id="token"
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="e.g., cam-token-123"
            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-500 text-black"
            required
          />
        </div>
        <div>
          <label htmlFor="location" className="block font-medium text-gray-700">
                        Location:
          </label>
          <select
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-500 text-black"
            required
          >
            <option value="">Select a parking lot</option>
            {parkingLots.map((lot) => (
              <option key={lot._id} value={lot.name}>
                {lot.name} ({lot.availableSlots} slots available)
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition"
        >
                    Create Token
        </button>
      </form>
    </div>
  );
}
