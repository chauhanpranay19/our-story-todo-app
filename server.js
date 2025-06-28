const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Debug logging
console.log('Environment variables:');
console.log('- PORT:', process.env.PORT);
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
console.log('Using PORT:', PORT);

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '.')));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Database connection with better error handling
let pool;
try {
  // Use environment variable if available, otherwise use hardcoded connection string
  const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_LRoBpjJvz01h@ep-tiny-thunder-aech14yn-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require';
  
  pool = new Pool({
    connectionString: connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  // Test the connection
  pool.on('connect', () => {
    console.log('Connected to database');
  });

  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
  });

} catch (error) {
  console.error('Database connection error:', error);
}

// Initialize database tables
async function initializeDatabase() {
  if (!pool) {
    console.error('Database pool not initialized');
    return;
  }

  try {
    const client = await pool.connect();
    console.log('Database client connected');
    
    // Create tasks table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL,
        done BOOLEAN DEFAULT FALSE,
        image_url TEXT,
        video_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Tasks table ready');
    
    // Create journal table
    await client.query(`
      CREATE TABLE IF NOT EXISTS journal (
        id SERIAL PRIMARY KEY,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        author VARCHAR(10) NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Journal table ready');
    
    // Insert initial tasks if table is empty
    const taskCount = await client.query('SELECT COUNT(*) FROM tasks');
    if (parseInt(taskCount.rows[0].count) === 0) {
      console.log('Inserting initial tasks...');
      const initialTasks = [
        // Simple, everyday activities (start here)
        "🤗 Hug", "🌸 Get a flower", "✍️ Write each other letters", "🤝 Share food to a needy",
        "🍜 Eat same noodle", "🥤 Drink something with two straws", "😂 Take funny pictures",
        "🚶 Go for a longggg walk", "🌇 Watch the sunset together", "🎤 Sing together any song wearing headphones",
        "🌌 Stargazing", "🍦 Share same ice cream", "👗 Pick out each other's outfit", "👕 Buy same tee",
        "👔 Try on each other's clothes", "🤝 Come up with an awesome handshake", "💃 Dance on the streets",
        "🕺 Slow dance", "💋 Kiss at midnight", "🚪 Go to the same changing room", "🚗 Go on an unplanned date",
        "🎨 Try to make a sketch of the other person in 10 mins", "🍿 Movie marathon",
        "💄 Let the other one do your makeup however they want", "😡 Eat something you hate",
        "🗣️ Learn 5 korean words", "🏅 Learn a sport", "🏊 Learn swimming", "🎥 Drive in cinema",
        "🕺 Learn a dance together", "👗 Decide an outfit for the other person, purchase it and wear it as your dinner date outfit",
        "🤫 Share a real and a big secret to the other person", "💧 Kiss underwater", "❄️ Go to the snowpark",
        "💉 Get a tattoo", "🇲🇻 Sea of stars Maldives", "✈️ Trip to London during Christmas", "🪂 Skydiving"
      ];
      
      for (const taskText of initialTasks) {
        await client.query('INSERT INTO tasks (text) VALUES ($1)', [taskText]);
      }
      console.log('Initial tasks inserted');
    } else {
      console.log('Tasks already exist, skipping initial insertion');
    }
    
    client.release();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

// API Routes

// Get all data
app.get('/api/data', async (req, res) => {
  if (!pool) {
    console.error('Database pool not available');
    return res.status(500).json({ error: 'Database connection not available' });
  }

  try {
    const client = await pool.connect();
    
    const tasksResult = await client.query('SELECT * FROM tasks ORDER BY created_at');
    const journalResult = await client.query('SELECT * FROM journal ORDER BY timestamp');
    
    client.release();
    
    res.json({
      tasks: tasksResult.rows,
      journal: journalResult.rows
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data', details: error.message });
  }
});

// Save all data
app.post('/api/data', async (req, res) => {
  if (!pool) {
    console.error('Database pool not available');
    return res.status(500).json({ error: 'Database connection not available' });
  }

  try {
    const { tasks, journal } = req.body;
    const client = await pool.connect();
    
    // Clear existing data
    await client.query('DELETE FROM tasks');
    await client.query('DELETE FROM journal');
    
    // Insert tasks
    for (const task of tasks) {
      await client.query(
        'INSERT INTO tasks (id, text, done, image_url, video_url) VALUES ($1, $2, $3, $4, $5)',
        [task.id, task.text, task.done, task.imageUrl, task.videoUrl]
      );
    }
    
    // Insert journal entries
    for (const entry of journal) {
      await client.query(
        'INSERT INTO journal (question, answer, author, timestamp) VALUES ($1, $2, $3, $4)',
        [entry.question, entry.answer, entry.author, entry.timestamp]
      );
    }
    
    client.release();
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ error: 'Failed to save data', details: error.message });
  }
});

// Add new task
app.post('/api/tasks', async (req, res) => {
  if (!pool) {
    console.error('Database pool not available');
    return res.status(500).json({ error: 'Database connection not available' });
  }

  try {
    const { text } = req.body;
    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'Task text is required' });
    }

    const client = await pool.connect();
    
    const result = await client.query(
      'INSERT INTO tasks (text) VALUES ($1) RETURNING *',
      [text.trim()]
    );
    
    client.release();
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error adding task:', error);
    res.status(500).json({ error: 'Failed to add task', details: error.message });
  }
});

// Update task
app.put('/api/tasks/:id', async (req, res) => {
  if (!pool) {
    console.error('Database pool not available');
    return res.status(500).json({ error: 'Database connection not available' });
  }

  try {
    const { id } = req.params;
    const { text, done, imageUrl, videoUrl } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'Task ID is required' });
    }

    const client = await pool.connect();
    
    const result = await client.query(
      'UPDATE tasks SET text = $1, done = $2, image_url = $3, video_url = $4 WHERE id = $5 RETURNING *',
      [text, done, imageUrl, videoUrl, id]
    );
    
    if (result.rows.length === 0) {
      client.release();
      return res.status(404).json({ error: 'Task not found' });
    }
    
    client.release();
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task', details: error.message });
  }
});

// Mark task as undone
app.put('/api/tasks/:id/undo', async (req, res) => {
  if (!pool) {
    console.error('Database pool not available');
    return res.status(500).json({ error: 'Database connection not available' });
  }

  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Task ID is required' });
    }

    const client = await pool.connect();
    
    const result = await client.query(
      'UPDATE tasks SET done = FALSE, image_url = NULL, video_url = NULL WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      client.release();
      return res.status(404).json({ error: 'Task not found' });
    }
    
    client.release();
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error undoing task:', error);
    res.status(500).json({ error: 'Failed to undo task', details: error.message });
  }
});

// Reorder tasks
app.put('/api/tasks/reorder', async (req, res) => {
  if (!pool) {
    console.error('Database pool not available');
    return res.status(500).json({ error: 'Database connection not available' });
  }

  try {
    const { order } = req.body;
    if (!order || !Array.isArray(order)) {
      return res.status(400).json({ error: 'Order array is required' });
    }

    const client = await pool.connect();
    
    // Update the order of tasks
    for (let i = 0; i < order.length; i++) {
      await client.query(
        'UPDATE tasks SET created_at = $1 WHERE id = $2',
        [new Date(Date.now() + i * 1000), order[i]]
      );
    }
    
    client.release();
    res.json({ success: true });
  } catch (error) {
    console.error('Error reordering tasks:', error);
    res.status(500).json({ error: 'Failed to reorder tasks', details: error.message });
  }
});

// Delete task
app.delete('/api/tasks/:id', async (req, res) => {
  if (!pool) {
    console.error('Database pool not available');
    return res.status(500).json({ error: 'Database connection not available' });
  }

  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Task ID is required' });
    }

    const client = await pool.connect();
    
    const result = await client.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      client.release();
      return res.status(404).json({ error: 'Task not found' });
    }
    
    client.release();
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task', details: error.message });
  }
});

// Add journal entry
app.post('/api/journal', async (req, res) => {
  if (!pool) {
    console.error('Database pool not available');
    return res.status(500).json({ error: 'Database connection not available' });
  }

  try {
    const { question, answer, author } = req.body;
    
    if (!question || !answer || !author) {
      return res.status(400).json({ error: 'Question, answer, and author are required' });
    }

    const client = await pool.connect();
    
    const result = await client.query(
      'INSERT INTO journal (question, answer, author) VALUES ($1, $2, $3) RETURNING *',
      [question, answer, author]
    );
    
    client.release();
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error adding journal entry:', error);
    res.status(500).json({ error: 'Failed to add journal entry', details: error.message });
  }
});

// Get journal history
app.get('/api/journal/history', async (req, res) => {
  try {
    const client = await pool.connect();
    
    const result = await client.query(`
      SELECT 
        DATE(timestamp) as date,
        question,
        json_agg(
          json_build_object(
            'id', id,
            'answer', answer,
            'author', author,
            'timestamp', timestamp
          ) ORDER BY timestamp
        ) as entries
      FROM journal 
      GROUP BY DATE(timestamp), question
      ORDER BY date DESC, question
    `);
    
    client.release();
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching journal history:', error);
    res.status(500).json({ error: 'Failed to fetch journal history' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    port: PORT,
    message: 'Our Story Todo App is running!',
    database: pool ? 'connected' : 'disconnected'
  });
});

// Fallback endpoint for when database is not available
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    database: pool ? 'connected' : 'disconnected',
    message: pool ? 'All features available' : 'Database features disabled'
  });
});

// Serve the main app
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Initialize database and start server
async function startServer() {
  try {
    console.log('Starting server initialization...');
    
    // Try to initialize database
    if (pool) {
      await initializeDatabase();
      console.log('Database initialized successfully');
    } else {
      console.warn('Database pool not available, starting in fallback mode');
    }
    
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`App available at: http://0.0.0.0:${PORT}`);
      console.log('Health check available at: /health');
      if (!pool) {
        console.log('⚠️  Running in fallback mode - database features disabled');
      }
    });
    
    // Error handling
    server.on('error', (error) => {
      console.error('Server error:', error);
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
      }
    });
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('Server closed');
        if (pool) {
          pool.end();
        }
        process.exit(0);
      });
    });
    
    process.on('SIGINT', () => {
      console.log('SIGINT received, shutting down gracefully');
      server.close(() => {
        console.log('Server closed');
        if (pool) {
          pool.end();
        }
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    console.log('Starting server without database...');
    
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT} (fallback mode)`);
      console.log(`App available at: http://0.0.0.0:${PORT}`);
      console.log('Health check available at: /health');
      console.log('⚠️  Database features disabled due to initialization error');
    });
    
    // Error handling
    server.on('error', (error) => {
      console.error('Server error:', error);
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
      }
    });
  }
}

startServer(); 