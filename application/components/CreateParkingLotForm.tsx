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
    <div className="bg-white/5 backdrop-blur border border-gray-700 p-6 rounded-lg shadow-lg text-gray-100">
      <h2 className="text-2xl font-bold text-white mb-4">Create Parking Lot</h2>
      <form onSubmit={handleCreateParkingLot} className="space-y-5">
        {/* Parking Lot Name */}
        <div>
<<<<<<< HEAD
          <label htmlFor="lotName" className="block font-medium text-gray-300">
          Parking Lot Name:
=======
          <label htmlFor="lotName" className="block font-medium text-gray-700">
                        Parking Lot Name:
>>>>>>> 72f467238828254b18ae9a2f965f5bdf175dc8a9
          </label>
          <input
            id="lotName"
            type="text"
            value={lotName}
            onChange={(e) => setLotName(e.target.value)}
            placeholder="e.g., Lot A"
            className="w-full mt-1 p-2 bg-gray-900 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />
        </div>

        {/* Total Slots */}
        <div>
<<<<<<< HEAD
          <label htmlFor="totalSlots" className="block font-medium text-gray-300">
          Total Slots:
=======
          <label htmlFor="totalSlots" className="block font-medium text-gray-700">
                        Total Slots:
>>>>>>> 72f467238828254b18ae9a2f965f5bdf175dc8a9
          </label>
          <input
            id="totalSlots"
            type="number"
            value={totalSlots}
            onChange={(e) => setTotalSlots(e.target.value)}
            placeholder="e.g., 50"
            className="w-full mt-1 p-2 bg-gray-900 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
            min="1"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition"
        >
<<<<<<< HEAD
        Create Parking Lot
=======
                    Create Parking Lot
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
