import dotenv from "dotenv";
dotenv.config();

import pkg from 'pg';
const {Pool} = pkg;

const pool = new Pool ({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? {rejectUnauthorized: false} : false
});

export default pool;