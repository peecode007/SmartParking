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
    <div className="bg-white/5 backdrop-blur border border-gray-700 p-6 rounded-lg shadow-lg text-gray-100">
      <h2 className="text-2xl font-bold text-white mb-4">Create Camera Token</h2>
      <form onSubmit={handleCreateToken} className="space-y-5">
        {/* Token Input */}
        <div>
<<<<<<< HEAD
          <label htmlFor="token" className="block font-medium text-gray-300">
          Token:
=======
          <label htmlFor="token" className="block font-medium text-gray-700">
                        Token:
>>>>>>> 72f467238828254b18ae9a2f965f5bdf175dc8a9
          </label>
          <input
            id="token"
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="e.g., cam-token-123"
            className="w-full mt-1 p-2 bg-gray-900 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />
        </div>

        {/* Location Select */}
        <div>
<<<<<<< HEAD
          <label htmlFor="location" className="block font-medium text-gray-300">
          Location:
=======
          <label htmlFor="location" className="block font-medium text-gray-700">
                        Location:
>>>>>>> 72f467238828254b18ae9a2f965f5bdf175dc8a9
          </label>
          <select
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full mt-1 p-2 bg-gray-900 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
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

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition"
        >
<<<<<<< HEAD
        Create Token
=======
                    Create Token
>>>>>>> 72f467238828254b18ae9a2f965f5bdf175dc8a9
        </button>
      </form>
    </div>
  );
<<<<<<< HEAD

}
=======
}
>>>>>>> 72f467238828254b18ae9a2f965f5bdf175dc8a9
