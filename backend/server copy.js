import express from 'express';
import cors from 'cors';
import { addPokemon, getAllPokemon, getPokemon, updatePokemon, deletePokemon } from "./api.js";

const app = express();
const PORT = 3001;

// ใช้งาน cors middleware เพื่ออนุญาต CORS
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// กำหนด route สำหรับการเพิ่มโปเกมอน
app.post('/api/pokemons', async (req, res) => {
    const newPokemon = await addPokemon(req.body);
    res.status(201).json(newPokemon);
});

// กำหนด route สำหรับการดึงข้อมูลโปเกมอนทั้งหมด
app.get('/api/pokemons', async (req, res) => {
    const pokemons = await getAllPokemon();
    res.json(pokemons);
});

// กำหนด route สำหรับดึงข้อมูลโปเกมอนโดยใช้ ID
app.get('/api/pokemons/:id', async (req, res) => {
    const pokemon = await getPokemon(req.params.id);
    res.json(pokemon);
});

// กำหนด route สำหรับอัปเดตข้อมูลโปเกมอน
app.put('/api/pokemons/:id', async (req, res) => {
    const updatedPokemon = await updatePokemon(req.params.id, req.body);
    res.json(updatedPokemon);
});

// กำหนด route สำหรับลบข้อมูลโปเกมอน
app.delete('/api/pokemons/:id', async (req, res) => {
    const deletedPokemon = await deletePokemon(req.params.id);
    res.json(deletedPokemon);
});

// เริ่มเซิร์ฟเวอร์
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
