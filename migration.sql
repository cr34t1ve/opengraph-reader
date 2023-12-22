-- create table with columns id, completion_data, link, title, created_at, updated_at
CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    completion_date DATE,
    link VARCHAR(255),
    title VARCHAR(255),
    image VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);