-- โครงสร้างตาราง pokemon ใหม่
CREATE TABLE pokemon (
    id INTEGER PRIMARY KEY,           -- รหัสโปเกมอน
    name VARCHAR(100) NOT NULL,       -- ชื่อโปเกมอน
    hp INTEGER NOT NULL,              -- ค่า HP
    attack INTEGER NOT NULL,          -- ค่า Attack
    defense INTEGER NOT NULL,         -- ค่า Defense
    special_attack INTEGER NOT NULL,  -- ค่า Special Attack
    special_defense INTEGER NOT NULL, -- ค่า Special Defense
    speed INTEGER NOT NULL,           -- ค่า Speed
    sprite VARCHAR(255)               -- URL ของภาพโปเกมอน
);
