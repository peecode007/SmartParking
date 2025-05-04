'use client';

import { FormEvent } from 'react';

interface RecordExitFormProps {
  exitParkingLot: string;
  setExitParkingLot: (value: string) => void;
  exitToken: string;
  setExitToken: (value: string) => void;
  exitNumberplate: string;
  setExitNumberplate: (value: string) => void;
  parkingLots: any[];
  getAvailableCameraTokens: () => string[];
  setError: (value: string | null) => void;
  setSuccess: (value: string | null) => void;
  fetchParkingLots: () => Promise<void>;
}

export default function RecordExitForm({
  exitParkingLot,
  setExitParkingLot,
  exitToken,
  setExitToken,
  exitNumberplate,
  setExitNumberplate,
  parkingLots,
  getAvailableCameraTokens,
  setError,
  setSuccess,
  fetchParkingLots,
}: RecordExitFormProps) {
  const handleRecordExit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    console.log('Exit form submitted:', { token: exitToken, numberplate: exitNumberplate, parkingLot: exitParkingLot });

    try {
      if (!exitToken || !exitNumberplate) {
        throw new Error('Please select a camera token and enter a numberplate');
      }

      const res = await fetch('/api/parking/exit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: exitToken, numberplate: exitNumberplate }),
      });
      const data = await res.json();
      console.log('Exit API response:', data);

      if (!res.ok) {
        throw new Error(data.error || 'Failed to record exit');
      }

      setSuccess('Exit recorded successfully');
      setExitToken(getAvailableCameraTokens()[0] || '');
      setExitNumberplate('');
      await fetchParkingLots();
    } catch (err: any) {
      setError(err.message);
      console.error('Exit error:', err);
    }
  };

  return (
    <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Record Vehicle Exit</h2>
      <form onSubmit={handleRecordExit} className="space-y-4 md:grid md:grid-cols-3 md:gap-6">
        <div className="col-span-1">
          <label htmlFor="exitParkingLot" className="block font-medium text-gray-700">
            Parking Lot:
          </label>
          <select
            id="exitParkingLot"
            value={exitParkingLot}
            onChange={(e) => {
              setExitParkingLot(e.target.value);
              setExitToken('');
            }}
            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-500 text-black"
            disabled={parkingLots.length === 0}
          >
            {parkingLots.length === 0 ? (
              <option value="">No parking lots available</option>
            ) : (
              parkingLots.map((lot) => (
                <option key={lot._id} value={lot.name}>
                  {lot.name} ({lot.availableSlots} slots)
                </option>
              ))
            )}
          </select>
        </div>
        <div className="col-span-1">
          <label htmlFor="exitToken" className="block font-medium text-gray-700">
            Camera Token:
          </label>
          <select
            id="exitToken"
            value={exitToken}
            onChange={(e) => setExitToken(e.target.value)}
            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-500 text-black"
            disabled={getAvailableCameraTokens().length === 0}
          >
            {getAvailableCameraTokens().length === 0 ? (
              <option value="">No tokens available</option>
            ) : (
              getAvailableCameraTokens().map((token) => (
                <option key={token} value={token}>
                  {token}
                </option>
              ))
            )}
          </select>
        </div>
        <div className="col-span-1">
          <label htmlFor="exitNumberplate" className="block font-medium text-gray-700">
            Numberplate:
          </label>
          <input
            id="exitNumberplate"
            type="text"
            value={exitNumberplate}
            onChange={(e) => setExitNumberplate(e.target.value)}
            placeholder="e.g., ABC123"
            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-500 text-black"
            required
          />
        </div>
        <div className="col-span-3 mt-4">
          <button
            type="submit"
            disabled={!exitParkingLot || !exitToken || !exitNumberplate}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md transition"
          >
            Record Exit
          </button>
        </div>
      </form>
    </div>
  );
}