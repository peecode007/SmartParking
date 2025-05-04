import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cachedConnection: typeof mongoose | null = null;

export async function connectToDatabase() {
  if (cachedConnection) return cachedConnection;
  const connection = await mongoose.connect(MONGODB_URI);
  cachedConnection = connection;
  console.log('Connected to MongoDB:', connection.connection.host);
  return connection;
}