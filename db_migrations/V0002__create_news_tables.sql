-- Create news articles table
CREATE TABLE IF NOT EXISTS news_articles (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('IT', 'Криптовалюта', 'Игры', 'Финансы', 'Мир')),
    image_url TEXT,
    word_count INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    view_count INTEGER DEFAULT 0
);

-- Create index for faster category filtering
CREATE INDEX IF NOT EXISTS idx_news_category ON news_articles(category);

-- Create index for sorting by creation date
CREATE INDEX IF NOT EXISTS idx_news_created_at ON news_articles(created_at DESC);

-- Create generation log table for tracking
CREATE TABLE IF NOT EXISTS generation_log (
    id SERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);