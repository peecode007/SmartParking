'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import CreateParkingLotForm from '@/components/CreateParkingLotForm';
import CreateCameraTokenForm from '@/components/CreateCameraTokenForm';
import RecordExitForm from '@/components/RecordExitForm';
import ParkingLotsList from '@/components/ParkingLotsList';
import AdminLogsTable from '@/components/AdminLogsTable';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [parkingLots, setParkingLots] = useState<{ name: string; _id: string }[]>([]);
  const [cameras, setCameras] = useState<{ token: string; location: string; parkingLot?: string }[]>([]);
  const [token, setToken] = useState('');
  const [location, setLocation] = useState('');
  const [lotName, setLotName] = useState('');
  const [totalSlots, setTotalSlots] = useState('');
  const [exitParkingLot, setExitParkingLot] = useState('');
  const [exitToken, setExitToken] = useState('');
  const [exitNumberplate, setExitNumberplate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchParkingLots = async () => {
    try {
      const res = await fetch('/api/parking-lots', {
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      console.log('Fetched parking lots:', data);
      if (Array.isArray(data)) {
        setParkingLots(data);
        if (data.length > 0 && !exitParkingLot) {
          setExitParkingLot(data[0].name);
        }
      } else {
        setError('Failed to load parking lots');
      }
    } catch (err) {
      setError('Error fetching parking lots');
      console.error('Fetch parking lots error:', err);
    }
  };

  const fetchCameras = async () => {
    try {
      const res = await fetch('/api/cameras', {
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      console.log('Fetched cameras:', data);
      if (Array.isArray(data)) {
        setCameras(data);
        const availableTokens = getAvailableCameraTokens(data);
        if (availableTokens.length > 0 && !exitToken) {
          setExitToken(availableTokens[0]);
        }
      } else {
        setError('Failed to load cameras');
      }
    } catch (err) {
      setError('Error fetching cameras');
      console.error('Fetch cameras error:', err);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated' || (session && session.user.role !== 'admin')) {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchParkingLots();
      fetchCameras();
    }
  }, [status, session, router]);

  const getAvailableCameraTokens = (camerasData = cameras) => {
    if (!exitParkingLot) return [];
    const selectedLot = parkingLots.find((lot: any) => lot.name === exitParkingLot);
    if (!selectedLot) return [];
    const tokens = camerasData
      .filter(
        (camera: any) =>
          camera.location === selectedLot.name ||
          (camera.parkingLot && camera.parkingLot.toString() === selectedLot._id.toString())
      )
      .map((camera: any) => camera.token);
    console.log('Available camera tokens for', exitParkingLot, ':', tokens);
    return tokens;
  };

  if (status === 'loading') return <p className="text-center text-gray-600">Loading...</p>;

  return (
  <div className="max-w-7xl mx-auto mt-10 px-6 py-8 bg-gradient-to-br from-gray-900 via-black to-gray-800 min-h-screen text-gray-100">
    {/* Header */}
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-white">Admin Dashboard</h1>
    </div>
    <p className="text-gray-400 mb-8">Welcome, {session?.user?.email}</p>

    {/* Message Feedback */}
    {(error || success) && (
      <div
        className={`p-4 rounded-md mb-6 font-medium shadow-md ${
          error ? 'bg-red-600/20 text-red-300 border border-red-500' : 'bg-green-600/20 text-green-300 border border-green-500'
        }`}
      >
        {error || success}
      </div>
    )}

    {/* Forms Section */}
    <div className="grid md:grid-cols-2 gap-8">
      <div className="bg-white/5 backdrop-blur border border-gray-700 rounded-xl p-6 shadow-lg">
        <CreateParkingLotForm
          lotName={lotName}
          setLotName={setLotName}
          totalSlots={totalSlots}
          setTotalSlots={setTotalSlots}
          setError={setError}
          setSuccess={setSuccess}
          fetchParkingLots={fetchParkingLots}
        />
      </div>

      <div className="bg-white/5 backdrop-blur border border-gray-700 rounded-xl p-6 shadow-lg">
        <CreateCameraTokenForm
          token={token}
          setToken={setToken}
          location={location}
          setLocation={setLocation}
          parkingLots={parkingLots}
          setError={setError}
          setSuccess={setSuccess}
          fetchParkingLots={fetchParkingLots}
          fetchCameras={fetchCameras}
        />
      </div>

      <div className="md:col-span-2 bg-white/5 backdrop-blur border border-gray-700 rounded-xl p-6 shadow-lg">
        <RecordExitForm
          exitParkingLot={exitParkingLot}
          setExitParkingLot={setExitParkingLot}
          exitToken={exitToken}
          setExitToken={setExitToken}
          exitNumberplate={exitNumberplate}
          setExitNumberplate={setExitNumberplate}
          parkingLots={parkingLots}
          getAvailableCameraTokens={getAvailableCameraTokens}
          setError={setError}
          setSuccess={setSuccess}
          fetchParkingLots={fetchParkingLots}
        />
      </div>
    </div>

    {/* Parking Lots List */}
    <div className="mt-10">
      <ParkingLotsList parkingLots={parkingLots} cameras={cameras} />
    </div>

    {/* Logs Table */}
    <div className="mt-10">
      {/* <h2 className="text-2xl font-bold mb-4 text-white">Recent Activity Logs</h2> */}
      <div className="bg-white/5 backdrop-blur border border-gray-700 rounded-xl p-4 shadow-lg">
        <AdminLogsTable />
      </div>
    </div>
  </div>
);

}