import { Pool } from 'pg';

let pool: Pool;

// This check prevents creating new connections on every hot-reload in development.
// It uses a global variable to store the connection pool.
if (process.env.NODE_ENV === 'production') {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // Required for services like Heroku
    },
  });
} else {
  const globalWithPool = global as typeof globalThis & {
    _pool?: Pool;
  };
  if (!globalWithPool._pool) {
    globalWithPool._pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }
  pool = globalWithPool._pool;
}

export default pool;
