'use client';

interface ParkingLotsListProps {
  parkingLots: any[];
  cameras: any[];
}

export default function ParkingLotsList({ parkingLots, cameras }: ParkingLotsListProps) {
  const getCameraTokensForLot = (lot: any) => {
    const lotCameras = cameras.filter(
      (camera) =>
        camera.location === lot.name || (camera.parkingLot && camera.parkingLot.toString() === lot._id.toString())
    );
    return lotCameras.length > 0
      ? lotCameras.map((camera) => camera.token).join(', ')
      : 'None';
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold text-gray-700">Parking Lots</h2>
      {parkingLots.length === 0 ? (
        <p className="mt-4 text-gray-600">No parking lots found.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left text-gray-700 border-b">Name</th>
                <th className="p-2 text-left text-gray-700 border-b">Total Slots</th>
                <th className="p-2 text-left text-gray-700 border-b">Available Slots</th>
                <th className="p-2 text-left text-gray-700 border-b">Camera Tokens</th>
              </tr>
            </thead>
            <tbody>
              {parkingLots.map((lot) => (
                <tr key={lot._id} className="hover:bg-gray-50 text-black">
                  <td className="p-2 border-b">{lot.name}</td>
                  <td className="p-2 border-b">{lot.totalSlots}</td>
                  <td className="p-2 border-b">{lot.availableSlots}</td>
                  <td className="p-2 border-b">{getCameraTokensForLot(lot)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}