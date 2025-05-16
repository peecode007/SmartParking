'use client';

import { FormEvent } from 'react';

interface CreateParkingLotFormProps {
    lotName: string;
    setLotName: (value: string) => void;
    totalSlots: string;
    setTotalSlots: (value: string) => void;
    setError: (value: string | null) => void;
    setSuccess: (value: string | null) => void;
    fetchParkingLots: () => Promise<void>;
}

export default function CreateParkingLotForm({
  lotName,
  setLotName,
  totalSlots,
  setTotalSlots,
  setError,
  setSuccess,
  fetchParkingLots,
}: CreateParkingLotFormProps) {
  const handleCreateParkingLot = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const parsedTotalSlots = parseInt(totalSlots);
      if (isNaN(parsedTotalSlots) || parsedTotalSlots < 1) {
        throw new Error('Total slots must be a positive number');
      }

      const res = await fetch('/api/parking-lots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: lotName, totalSlots: parsedTotalSlots }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create parking lot');
      }
      setSuccess('Parking lot created successfully');
      setLotName('');
      setTotalSlots('');
      await fetchParkingLots();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Create Parking Lot</h2>
      <form onSubmit={handleCreateParkingLot} className="space-y-4">
        <div>
          <label htmlFor="lotName" className="block font-medium text-gray-700">
                        Parking Lot Name:
          </label>
          <input
            id="lotName"
            type="text"
            value={lotName}
            onChange={(e) => setLotName(e.target.value)}
            placeholder="e.g., Lot A"
            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-500 text-black"
            required
          />
        </div>
        <div>
          <label htmlFor="totalSlots" className="block font-medium text-gray-700">
                        Total Slots:
          </label>
          <input
            id="totalSlots"
            type="number"
            value={totalSlots}
            onChange={(e) => setTotalSlots(e.target.value)}
            placeholder="e.g., 50"
            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-500 text-black"
            required
            min="1"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition"
        >
                    Create Parking Lot
        </button>
      </form>
    </div>
  );
}
