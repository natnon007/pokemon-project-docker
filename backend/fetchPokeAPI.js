// ฟังก์ชันสำหรับดึงข้อมูลจาก PokeAPI และบันทึกลงฐานข้อมูล
import fetch from "node-fetch";
import { createPokemon } from "./api.js";

export const fetchAndStorePokemon = async (id) => {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const data = await response.json();
    const pokemon = {
        name: data.name,
        type: data.types[0].type.name,
    };
    return await createPokemon(pokemon);
};
