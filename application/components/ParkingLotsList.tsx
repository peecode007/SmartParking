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
    <div className="mt-10 p-6 bg-white/5 backdrop-blur border border-gray-700 rounded-lg shadow-lg text-gray-100">
      <h2 className="text-2xl font-semibold text-white">Parking Lots</h2>
      {parkingLots.length === 0 ? (
        <p className="mt-4 text-gray-500">No parking lots found.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full border border-gray-600">
            <thead className="bg-gray-800">
              <tr>
                <th className="p-3 text-left text-gray-300 border-b">Name</th>
                <th className="p-3 text-left text-gray-300 border-b">Total Slots</th>
                <th className="p-3 text-left text-gray-300 border-b">Available Slots</th>
                <th className="p-3 text-left text-gray-300 border-b">Camera Tokens</th>
              </tr>
            </thead>
            <tbody>
              {parkingLots.map((lot) => (
                <tr key={lot._id} className="hover:bg-gray-700 text-gray-200">
                  <td className="p-3 border-b">{lot.name}</td>
                  <td className="p-3 border-b">{lot.totalSlots}</td>
                  <td className="p-3 border-b">{lot.availableSlots}</td>
                  <td className="p-3 border-b">{getCameraTokensForLot(lot)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

}