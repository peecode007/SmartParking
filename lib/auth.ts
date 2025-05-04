import Camera from '@/models/Camera';
import { connectToDatabase } from './db';

export async function verifyCameraToken(token: string) {
  try {
    await connectToDatabase();
    const camera = await Camera.findOne({ token, status: 'active' });
    if (!camera) {
      return null;
    }
    return { location: camera.location };
  } catch (error) {
    console.error('Error verifying camera token:', error);
    return null;
  }
}