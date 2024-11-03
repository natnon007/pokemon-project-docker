import React, { useState, useEffect } from "react";
import { Tooltip } from "react-tooltip";

const PokemonManager = () => {
    const [pokemons, setPokemons] = useState([]); // ข้อมูลโปเกมอนในฐานข้อมูล
    const [currentPageDb, setCurrentPageDb] = useState(0); // หน้าปัจจุบันสำหรับ Database
    const [apiPokemons, setApiPokemons] = useState([]); // ข้อมูลโปเกมอนจาก PokeAPI
    const [currentPage, setCurrentPage] = useState(0); // หน้าปัจจุบันสำหรับ PokeAPI
    const itemsPerPage = 20; // จำนวนโปเกมอนที่จะแสดงต่อหน้า (5x4)
    const [selectedPokemon, setSelectedPokemon] = useState(null); // เก็บข้อมูลโปเกมอนที่ถูกเลือก
    const [selectedDbPokemon, setSelectedDbPokemon] = useState(null); // โปเกมอนที่เลือกจาก Database
    const [isEditing, setIsEditing] = useState(false); // สถานะการแก้ไข
    const [addedPokemonIds, setAddedPokemonIds] = useState([]); // เก็บ ID ของโปเกมอนที่ถูกเพิ่มแล้ว

    useEffect(() => {
        fetchPokemons(); // ดึงข้อมูลจากฐานข้อมูลเมื่อโหลดหน้า
        fetchAllPokemonsFromAPI(); // ดึงข้อมูลจาก PokeAPI แบบไม่จำกัดเมื่อโหลดหน้า
    }, []);

    // ดึงข้อมูลโปเกมอนทั้งหมดจากฐานข้อมูล
    const fetchPokemons = () => {
        fetch("http://localhost:3001/api/pokemons")
            .then((res) => res.json())
            .then((data) => {
                console.log("Pokemons from API:", data); // ตรวจสอบข้อมูลที่ดึงจาก backend
                setPokemons(data);
                const ids = data.map((pokemon) => pokemon.id); // ดึง ID ของโปเกมอนในฐานข้อมูล
                setAddedPokemonIds(ids); // เก็บ ID ของโปเกมอนที่ถูกเพิ่มแล้ว
            })
            .catch((error) => console.error("Failed to fetch Pokemons:", error));
    };

    // ดึงข้อมูลโปเกมอนแบบไม่จำกัดจาก PokeAPI
    const fetchAllPokemonsFromAPI = async () => {
        let offset = 0;
        const limit = 50; 
        let allFetched = false;

        while (!allFetched) {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`);
            const data = await response.json();

            if (data.results.length > 0) {
                const pokemonDetails = await Promise.all(
                    data.results.map(async (pokemon) => {
                        const res = await fetch(pokemon.url);
                        return await res.json();
                    })
                );

                setApiPokemons((prev) => [...prev, ...pokemonDetails]);
                offset += limit;
            } else {
                allFetched = true;
            }
        }
    };

    // ฟังก์ชันเมื่อคลิกโปเกมอน
    const handlePokemonClick = (pokemon, isFromDatabase = false) => {
        if (isFromDatabase) {
            setSelectedDbPokemon(pokemon); // ตั้งค่าโปเกมอนที่เลือกจากฐานข้อมูล
        } else {
            const selected = {
                id: pokemon.id,
                name: pokemon.name,
                hp: pokemon.stats.find(stat => stat.stat.name === 'hp').base_stat,
                attack: pokemon.stats.find(stat => stat.stat.name === 'attack').base_stat,
                defense: pokemon.stats.find(stat => stat.stat.name === 'defense').base_stat,
                special_attack: pokemon.stats.find(stat => stat.stat.name === 'special-attack').base_stat,
                special_defense: pokemon.stats.find(stat => stat.stat.name === 'special-defense').base_stat,
                speed: pokemon.stats.find(stat => stat.stat.name === 'speed').base_stat,
                sprite: pokemon.sprites.front_default 
            };
            setSelectedPokemon(selected);
        }
    };

    // ฟังก์ชันเพิ่มโปเกมอนเข้าไปในฐานข้อมูล
    const addPokemonToDatabase = () => {
        console.log("addPokemonToDatabase function called"); // เพิ่มข้อความนี้เพื่อตรวจสอบว่าเรียกฟังก์ชันได้สำเร็จหรือไม่
        if (!selectedPokemon) return;
        console.log("Sending data to API:", selectedPokemon);
        fetch("http://localhost:3001/api/pokemons", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(selectedPokemon),
        })
        .then((res) => res.json())
        .then((data) => {
            setPokemons([...pokemons, data]);
            fetchPokemons(); // อัปเดตข้อมูลใหม่ทันทีหลังเพิ่มลงฐานข้อมูล
            alert(`${selectedPokemon.name} added to database!`);
            setSelectedPokemon(null); // ล้างการเลือกหลังจากเพิ่มลงฐานข้อมูล
        })
        .catch((error) => console.error("Error adding Pokemon to database:", error));
    };

    const deletePokemonFromDatabase = () => {
        if (!selectedDbPokemon) return;
    
        fetch(`http://localhost:3001/api/pokemons/${selectedDbPokemon.id}`, {
            method: "DELETE",
        })
        .then((res) => res.json())
        .then((data) => {
            alert(`${selectedDbPokemon.name} deleted from database!`);
            setPokemons(pokemons.filter(pokemon => pokemon.id !== selectedDbPokemon.id)); // อัปเดต pokemons ใหม่
            setAddedPokemonIds(addedPokemonIds.filter(id => id !== selectedDbPokemon.id)); // ลบ id ที่ถูกลบออกจาก addedPokemonIds
            setSelectedDbPokemon(null); // ล้างการเลือกหลังจากลบ
        })
        .catch((error) => console.error("Error deleting Pokemon:", error));
    };

    const handleEditToggle = () => {
        if (isEditing) {
            // หากอยู่ในโหมดการแก้ไข เมื่อกดปุ่มจะอัปเดตข้อมูล
            fetch(`http://localhost:3001/api/pokemons/${selectedDbPokemon.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: selectedDbPokemon.name }),
            })
            .then((res) => res.json())
            .then((data) => {
                setPokemons((prev) =>
                    prev.map((pokemon) => (pokemon.id === data.id ? data : pokemon))
                );
                setIsEditing(false); // เปลี่ยนโหมดกลับเป็นไม่แก้ไข
                alert(`Pokemon name updated to ${data.name}!`);
                setSelectedDbPokemon(null); // ล้างข้อมูลใน textbox หลังจากกด DONE
            })
            .catch((error) => console.error("Error updating Pokemon:", error));
        } else {
            // หากไม่อยู่ในโหมดการแก้ไข จะเข้าสู่โหมดการแก้ไข
            setIsEditing(true);
        }
    };

    // Pagination
    const startIndex = currentPage * itemsPerPage;
    const selectedPokemons = apiPokemons.slice(startIndex, startIndex + itemsPerPage);
    const totalPages = Math.ceil(apiPokemons.length / itemsPerPage);

    const startIndexDb = currentPageDb * itemsPerPage;
    const selectedDbPokemons = pokemons.slice(startIndexDb, startIndexDb + itemsPerPage);
    const totalPagesDb = Math.ceil(pokemons.length / itemsPerPage);   

    return (
        <div style={{ display: "flex", gap: "20px" }}>
            {/* โซนด้านซ้าย: ข้อมูลจาก PokeAPI */}
            <div style={{ flex: 1 }}>
                <h2>Pokemons from PokeAPI</h2>
                <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px" }}>
                    <input
                        type="text"
                        value={selectedPokemon ? selectedPokemon.id : ""}
                        placeholder="Pokemon ID"
                        readOnly
                        style={{ width: "100px", padding: "5px", backgroundColor: "lightgray" }}
                    />
                    <input
                        type="text"
                        value={selectedPokemon ? selectedPokemon.name : ""}
                        placeholder="Pokemon Name"
                        readOnly
                        style={{ width: "150px", padding: "5px", backgroundColor: "lightgray"  }}
                    />
                    <button 
                        onClick={addPokemonToDatabase} 
                        style={{ padding: "5px 10px" }} 
                        disabled={!selectedPokemon || addedPokemonIds.includes(selectedPokemon.id)} // ปิดใช้งานปุ่มหากยังไม่ได้เลือกโปเกมอน หรือหากโปเกมอนอยู่ในฐานข้อมูลแล้ว
                    >
                        ADD
                    </button>
                </div>
                <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "repeat(4, 1fr)", 
                    gap: "10px", 
                    width: "100%", 
                    maxWidth: "800px", 
                }}>
                    {selectedPokemons.map((pokemon) => {
                        const status = pokemon.stats
                            .map((stat) => `${stat.stat.name}: ${stat.base_stat}`)
                            .join("\n");
                        
                        const isAdded = addedPokemonIds.includes(pokemon.id); // ตรวจสอบว่าโปเกมอนถูกเพิ่มในฐานข้อมูลหรือยัง
                        const isSelected = selectedPokemon && selectedPokemon.id === pokemon.id; // ตรวจสอบว่าเป็นโปเกมอนที่ถูกเลือกหรือไม่

                        return (
                            <div 
                                key={pokemon.id} 
                                data-tooltip-id={`pokemon-tooltip-${pokemon.id}`} 
                                data-tooltip-content={status}
                                onClick={() => handlePokemonClick(pokemon)} 
                                style={{ 
                                    border: isSelected ? "3px solid red" : "1px solid #ddd", // เปลี่ยนสีและความหนาของกรอบเมื่อเลือก 
                                    padding: "10px", 
                                    textAlign: "center",
                                    width: "120px", 
                                    height: "120px",
                                    display: "flex", 
                                    flexDirection: "column", 
                                    alignItems: "center", 
                                    justifyContent: "center",
                                    position: "relative",
                                    cursor: "pointer",
                                    backgroundColor: isAdded ? "lightgray" : "white" // เปลี่ยนสีพื้นหลังเป็นสีเทาหากถูกเพิ่มแล้ว
                                }}
                            >
                                <strong>#{pokemon.id}</strong>
                                <span>{pokemon.name}</span>
                                <span>{pokemon.types[0].type.name}</span>
                                <img 
                                    src={pokemon.sprites.front_default} 
                                    alt={pokemon.name} 
                                    style={{ width: "80px", height: "80px", objectFit: "contain" }} 
                                />
                            </div>
                        );
                    })}
                </div>

                {/* Tooltip Component */}
                {selectedPokemons.map((pokemon) => (
                    <Tooltip 
                        key={pokemon.id} 
                        id={`pokemon-tooltip-${pokemon.id}`} 
                        place="top" 
                        effect="solid" 
                        style={{ whiteSpace: "pre-line", textAlign: "center" }} 
                    />
                ))}

                {/* ปุ่ม Pagination */}
                <div style={{ marginTop: "20px", display: "flex", justifyContent: "center", gap: "10px", alignItems: "center" }}>
                    <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 0}>
                        Previous
                    </button>
                    <span>Page {currentPage + 1} of {totalPages}</span>
                    <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage >= totalPages - 1}>
                        Next
                    </button>
                </div>
            </div>

            {/* โซนด้านขวา: ข้อมูลจาก Database */}
            <div style={{ flex: 1 }}>
                <h2>Pokemons in Database</h2>
                <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px" }}>
                    <input
                        type="text"
                        value={selectedDbPokemon ? selectedDbPokemon.name : ""}
                        onChange={(e) =>
                            setSelectedDbPokemon({
                                ...selectedDbPokemon,
                                name: e.target.value,
                            })
                        }
                        placeholder="Pokemon Name"
                        readOnly={!isEditing}
                        style={{ width: "150px", padding: "5px", backgroundColor: isEditing ? "white" : "lightgray" }}
                    />
                    <button onClick={handleEditToggle} 
                        style={{ padding: "5px 10px" }} 
                        disabled={!selectedDbPokemon || (isEditing && !selectedDbPokemon.name.trim())} // ปิดใช้งานปุ่ม DONE เมื่ออยู่ในโหมดแก้ไขและชื่อเป็นค่าว่าง
                    >
                        {isEditing ? "DONE" : "EDIT"}
                    </button>
                    <button onClick={deletePokemonFromDatabase} style={{ padding: "5px 10px" } } disabled={!selectedDbPokemon || isEditing}>DELETE</button>
                </div>
                <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "repeat(4, 1fr)", 
                    gap: "10px", 
                    width: "100%", 
                    maxWidth: "800px", 
                }}>
                    {selectedDbPokemons.map((pokemon) => {
                        const status = `
                            HP: ${pokemon.hp}
                            Attack: ${pokemon.attack}
                            Defense: ${pokemon.defense}
                            Special Attack: ${pokemon.special_attack}
                            Special Defense: ${pokemon.special_defense}
                            Speed: ${pokemon.speed}
                        `;

                        const isSelectedDb = selectedDbPokemon && selectedDbPokemon.id === pokemon.id; // ตรวจสอบว่าเป็นโปเกมอนที่ถูกเลือกในฝั่งฐานข้อมูลหรือไม่

                        return (
                            <div 
                                key={pokemon.id} 
                                data-tooltip-id={`pokemon-tooltip-db-${pokemon.id}`} 
                                data-tooltip-content={status}
                                onClick={() => handlePokemonClick(pokemon, true)} 
                                style={{ 
                                    border: isSelectedDb ? "3px solid blue" : "1px solid #ddd", // เปลี่ยนสีและความหนาของกรอบเมื่อเลือก
                                    padding: "10px", 
                                    textAlign: "center",
                                    width: "120px", 
                                    height: "120px",
                                    display: "flex", 
                                    flexDirection: "column", 
                                    alignItems: "center", 
                                    justifyContent: "center",
                                    position: "relative",
                                    cursor: "pointer"
                                }}
                            >
                                <strong>#{pokemon.id}</strong>
                                <span>{pokemon.name}</span>
                                <img 
                                    src={pokemon.sprite} 
                                    alt={pokemon.name} 
                                    style={{ width: "80px", height: "80px", objectFit: "contain" }} 
                                />
                            </div>
                        );
                    })}
                </div>

                {/* Tooltip Component */}
                {selectedDbPokemons.map((pokemon) => (
                    <Tooltip 
                        key={pokemon.id} 
                        id={`pokemon-tooltip-db-${pokemon.id}`} 
                        place="top" 
                        effect="solid" 
                        style={{ whiteSpace: "pre-line", textAlign: "center" }} 
                    />
                ))}

                {/* ปุ่ม Pagination */}
                <div style={{ marginTop: "20px", display: "flex", justifyContent: "center", gap: "10px", alignItems: "center" }}>
                    <button onClick={() => setCurrentPageDb(currentPageDb - 1)} disabled={currentPageDb === 0}>
                        Previous
                    </button>
                    <span>Page {currentPageDb + 1} of {totalPagesDb}</span>
                    <button onClick={() => setCurrentPageDb(currentPageDb + 1)} disabled={currentPageDb >= totalPagesDb - 1}>
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PokemonManager;
