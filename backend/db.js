// ตั้งค่าการเชื่อมต่อกับฐานข้อมูล PostgreSQL
//import { Client } from "pg";

import pkg from 'pg';
const { Pool  } = pkg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const connectWithRetry = () => {
    pool.connect()
        .then((client) => {
            console.log("Connected to database successfully.");

            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS pokemon (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(50) NOT NULL,
                    hp INTEGER,
                    attack INTEGER,
                    defense INTEGER,
                    special_attack INTEGER,
                    special_defense INTEGER,
                    speed INTEGER,
                    sprite VARCHAR(255)
                );
            `;
            return client.query(createTableQuery)
                .finally(() => client.release()); // ปล่อยการเชื่อมต่อหลังจากการ query
        })
        .then(() => {
            console.log("Pokemon table created or already exists.");
        })
        .catch((err) => {
            console.error("Database connection error, retrying in 5 seconds...", err);
            setTimeout(connectWithRetry, 5000); // รอ 5 วินาทีก่อนเชื่อมต่อใหม่
        });
};

connectWithRetry();

export default pool;

// ฟังก์ชันทดสอบการเชื่อมต่อกับฐานข้อมูล
export const testConnection = async () => {
    try {
        await client.query("SELECT 1"); // สั่งให้ฐานข้อมูลรัน SELECT 1
        console.log("Database connection successful!");
    } catch (error) {
        console.error("Database connection failed:", error.message);
    }
};