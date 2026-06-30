import mongoose from 'mongoose';
import { env } from './env';
import { MongoMemoryServer } from 'mongodb-memory-server';
import fs from 'fs';
import path from 'path';

let mongoServer: MongoMemoryServer | null = null;

export const connectDB = async (): Promise<void> => {
  let uri = env.mongoUri;

  const isDefaultLocal = uri.startsWith('mongodb://127.0.0.1:27017') || uri.startsWith('mongodb://localhost:27017');
  const isUnconfiguredAtlas = uri.includes('<cluster-url>') || uri.includes('<username>') || uri.includes('<password>');

  if (isDefaultLocal || isUnconfiguredAtlas) {
    console.log('No external or configured MongoDB Atlas URI found. Starting persistent embedded MongoDB database...');
    
    const dbPath = path.join(process.cwd(), '.mongodb_data');
    if (!fs.existsSync(dbPath)) {
      fs.mkdirSync(dbPath, { recursive: true });
    }

    try {
      mongoServer = await MongoMemoryServer.create({
        instance: {
          dbPath,
          storageEngine: 'wiredTiger',
        },
      });
      uri = mongoServer.getUri();
      console.log(`Persistent embedded MongoDB started successfully at: ${uri}`);
    } catch (error) {
      console.error('Failed to start embedded MongoDB database. Falling back to default URI.', error);
    }
  }

  await mongoose.connect(uri);
  console.log('MongoDB connected successfully');

  // Seed default admin user for testing if it doesn't exist
  try {
    const { User } = require('../modules/auth/auth.model');
    const bcrypt = require('bcryptjs');
    const adminExists = await User.findOne({ role: 'ADMIN' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('Password@123', 10);
      await User.create({
        name: 'System Admin',
        email: 'admin@example.com',
        phone: '9999999999',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true
      });
      console.log('Seeded default admin user: admin@example.com / Password@123');
    }
  } catch (error) {
    console.error('Failed to seed admin user:', error);
  }
};

// Clean shutdown handler to stop the embedded DB when the node process exits
const cleanup = async () => {
  if (mongoServer) {
    await mongoServer.stop();
  }
};
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

