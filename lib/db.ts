import { Pool } from 'pg';

// Database connection pool
let pool: Pool | null = null;

export function getPool(): Pool {
    if (!pool) {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/o_discipulo',
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });

        // Handle pool errors
        pool.on('error', (err) => {
            console.error('Unexpected error on idle client', err);
            process.exit(-1);
        });
    }

    return pool;
}

// Utility function to execute queries
export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
    const pool = getPool();
    const result = await pool.query(text, params);
    return result.rows;
}

// Utility function to execute a single query and return one result
export async function queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
    const rows = await query<T>(text, params);
    return rows.length > 0 ? rows[0] : null;
}

// Close pool (for graceful shutdown)
export async function closePool(): Promise<void> {
    if (pool) {
        await pool.end();
        pool = null;
    }
}
