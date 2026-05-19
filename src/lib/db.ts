import mongoose from 'mongoose';

declare global {
  // eslint-disable-next-line no-var
  var _mongoosePromise: Promise<typeof mongoose> | undefined;
}

export async function connectDB(): Promise<typeof mongoose> {
  // Re-use the already-connected instance across hot-reloads in dev
  // and across invocations in the same serverless container in prod.
  if (mongoose.connection.readyState === 1) return mongoose;

  if (!global._mongoosePromise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI is not set');

    global._mongoosePromise = mongoose.connect(uri, {
      bufferCommands: false,        // fail fast — don't queue ops while disconnected
      maxPoolSize: 10,
      minPoolSize: 1,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      heartbeatFrequencyMS: 10000,
      family: 4,                    // force IPv4; avoids DNS-flip flop on some hosts
    });
  }

  return global._mongoosePromise;
}
