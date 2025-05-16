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
    <div className="max-w-7xl mx-auto mt-10 px-6 py-8 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        {/* <SignOutButton /> */}
      </div>
      <p className="text-gray-600 mb-8">Welcome, {session?.user?.email}</p>
      {/* <MessageDisplay error={error} success={success} /> */}
      <div
        className={`p-4 rounded-md mb-6 ${error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}
      >
        {error || success}
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <CreateParkingLotForm
          lotName={lotName}
          setLotName={setLotName}
          totalSlots={totalSlots}
          setTotalSlots={setTotalSlots}
          setError={setError}
          setSuccess={setSuccess}
          fetchParkingLots={fetchParkingLots}
        />
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
      <ParkingLotsList parkingLots={parkingLots} cameras={cameras} />
      <div className="mt-10">
        {/* <h2 className="text-2xl font-bold mb-4">Recent Activity Logs</h2> */}
        <AdminLogsTable />
      </div>
    </div>
  );
}
