CREATE TABLE t_p4107898_fuel_sales_ai_app.users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    name VARCHAR(255),
    company VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    session_token VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE t_p4107898_fuel_sales_ai_app.chat_sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES t_p4107898_fuel_sales_ai_app.users(id),
    messages JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
