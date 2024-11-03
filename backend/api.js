// ฟังก์ชัน CRUD สำหรับการจัดการข้อมูลโปเกมอน ไม่ใช้
import pool from './db.js';

// ฟังก์ชันสำหรับเพิ่มโปเกมอนลงในฐานข้อมูล
export const addPokemon = async (pokemon) => {
    const query = `
        INSERT INTO pokemon (id, name, hp, attack, defense, special_attack, special_defense, speed, sprite) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
        RETURNING *
    `;
    const values = [
        pokemon.id,
        pokemon.name,
        pokemon.hp,
        pokemon.attack,
        pokemon.defense,
        pokemon.special_attack,
        pokemon.special_defense,
        pokemon.speed,
        pokemon.sprite  // เพิ่ม URL ของภาพ
    ];
    try {
        const res = await pool.query(query, values);
        return res.rows[0];
    } catch (error) {
        console.error("Error inserting Pokemon:", error);
        throw error;
    }
};

export const getAllPokemon = async () => {
    const query = `SELECT * FROM pokemon`;
    const res = await pool.query(query);
    console.log("Data from database:", res.rows); // ตรวจสอบข้อมูลที่ดึงจากฐานข้อมูล
    return res.rows;
};

export const getPokemon = async (id) => {
    const res = await pool.query('SELECT * FROM pokemon WHERE id = $1', [id]);
    return res.rows[0];
};

export const updatePokemon = async (id, data) => {
    const query = `UPDATE pokemon SET name = $1 WHERE id = $2 RETURNING *`;
    const values = [data.name, id]; // แก้ไขเพื่อใช้ data.name แทนการส่ง data ตรงๆ
    const res = await pool.query(query, values);
    return res.rows[0];
};

// ฟังก์ชันสำหรับลบโปเกมอน
export const deletePokemon = async (id) => {
    const query = `DELETE FROM pokemon WHERE id = $1 RETURNING *`;
    const res = await pool.query(query, [id]);
    return res.rows[0];
};
