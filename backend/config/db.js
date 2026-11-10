const dns = require('dns');
const mongoose = require('mongoose');

const DEFAULT_LOCAL_URI = 'mongodb://127.0.0.1:27017/khushi_general_store';

/**
 * Ensures SRV DNS lookups succeed even on networks whose default router DNS
 * drops or times out on _mongodb._tcp SRV queries.
 */
async function ensureSrvResolution(mongoUri) {
  if (!mongoUri.startsWith('mongodb+srv://')) return;

  const hostPart = mongoUri.slice('mongodb+srv://'.length).split('/')[0];
  const host = hostPart.includes('@') ? hostPart.split('@').pop() : hostPart;
  if (!host) return;

  const srvName = `_mongodb._tcp.${host}`;
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('SRV_TIMEOUT')), 2500);
  });

  try {
    await Promise.race([dns.promises.resolveSrv(srvName), timeoutPromise]);
  } catch {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } finally {
    clearTimeout(timer);
  }
}

let cached = global.__mongooseCache;
if (!cached) {
  cached = global.__mongooseCache = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // Reset stale cache if a previously established connection dropped.
  if (mongoose.connection.readyState === 0) {
    cached.conn = null;
    cached.promise = null;
  }

  const mongoUri = process.env.MONGO_URI || (process.env.VERCEL ? '' : DEFAULT_LOCAL_URI);

  if (!mongoUri) {
    throw new Error('MONGO_URI environment variable is not set.');
  }

  if (mongoUri.includes('<db_password>')) {
    throw new Error(
      'Please replace <db_password> in MONGO_URI with your actual MongoDB Atlas password.'
    );
  }

  if (!cached.promise) {
    cached.promise = (async () => {
      await ensureSrvResolution(mongoUri);
      return mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 8000,
      });
    })();
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    cached.conn = null;
    throw err;
  }

  return cached.conn;
}

module.exports = { connectDB, DEFAULT_LOCAL_URI };

