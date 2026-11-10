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
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('SRV_TIMEOUT')), 2500)
  );

  try {
    await Promise.race([dns.promises.resolveSrv(srvName), timeoutPromise]);
  } catch {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  }
}

async function connectDB() {
  const mongoUri = process.env.MONGO_URI || DEFAULT_LOCAL_URI;

  if (mongoUri.includes('<db_password>')) {
    throw new Error(
      'Please replace <db_password> in backend/.env with your actual MongoDB Atlas password.'
    );
  }

  await ensureSrvResolution(mongoUri);
  await mongoose.connect(mongoUri);
  return mongoUri;
}

module.exports = { connectDB, DEFAULT_LOCAL_URI };

