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
console.log('Using PORT:', PORT);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Database connection
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_LRoBpjJvz01h@ep-tiny-thunder-aech14yn-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require'
});

// Initialize database tables
async function initializeDatabase() {
  try {
    const client = await pool.connect();
    
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
    
    // Insert initial tasks if table is empty
    const taskCount = await client.query('SELECT COUNT(*) FROM tasks');
    if (parseInt(taskCount.rows[0].count) === 0) {
      const initialTasks = [
        // Simple, everyday activities (start here)
        "🤗 HUG", "☕ Buy the same tee", "🤝 Come up with an awesome handshake", "✍️ Write each other letters",
        "🤫 Share a real and a big secret", "🍜 Eat from the same noodle bowl", "🥤 Drink something with two straws",
        "😂 Take funny pictures", "🎤 Sing together wearing headphones", "💃 Dance on the streets",
        
        // Outdoor and social activities
        "🌇 Watch the sunset together", "🚶 Go for a loonggg walk", "🕺 Slow dance", "🍿 Movie marathon",
        "🌌 Stargazing", "🍦 Share the same ice cream", "💋 Kiss at midnight", "🎨 Try to make a sketch of the other person in 10 mins",
        
        // Creative and fun activities
        "🛍️ Pick out each other's outfit", "💄 Let the other one do your makeup", "🎭 Try on each other's clothes",
        "🚗 Go on an unplanned date", "💧 Kiss underwater", "😡 Eat something you hate", "🌸 Get a flower",
        "🎥 Drive-in cinema", "🏊 Learn swimming", "🕺 Learn a dance together", "🏅 Learn a sport",
        
        // Cultural and learning activities
        "🗣️ Learn 5 Korean words", "👗 Decide an outfit, purchase it and wear it for a dinner date",
        "🤝 Share food with a needy person",
        
        // Big adventures and travel (save for later)
        "✈️ Trip to London during Christmas", "🇲🇻 Sea of stars in the Maldives", "🪂 Skydiving", "💉 Get a tattoo"
      ];
      
      for (const taskText of initialTasks) {
        await client.query('INSERT INTO tasks (text) VALUES ($1)', [taskText]);
      }
    }
    
    client.release();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// API Routes

// Get all data
app.get('/api/data', async (req, res) => {
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
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// Save all data
app.post('/api/data', async (req, res) => {
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
    res.status(500).json({ error: 'Failed to save data' });
  }
});

// Add new task
app.post('/api/tasks', async (req, res) => {
  try {
    const { text } = req.body;
    const client = await pool.connect();
    
    const result = await client.query(
      'INSERT INTO tasks (text) VALUES ($1) RETURNING *',
      [text]
    );
    
    client.release();
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error adding task:', error);
    res.status(500).json({ error: 'Failed to add task' });
  }
});

// Update task
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { text, done, imageUrl, videoUrl } = req.body;
    const client = await pool.connect();
    
    const result = await client.query(
      'UPDATE tasks SET text = $1, done = $2, image_url = $3, video_url = $4 WHERE id = $5 RETURNING *',
      [text, done, imageUrl, videoUrl, id]
    );
    
    client.release();
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Mark task as undone
app.put('/api/tasks/:id/undo', async (req, res) => {
  try {
    const { id } = req.params;
    const client = await pool.connect();
    
    const result = await client.query(
      'UPDATE tasks SET done = FALSE, image_url = NULL, video_url = NULL WHERE id = $1 RETURNING *',
      [id]
    );
    
    client.release();
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error undoing task:', error);
    res.status(500).json({ error: 'Failed to undo task' });
  }
});

// Reorder tasks
app.put('/api/tasks/reorder', async (req, res) => {
  try {
    const { order } = req.body;
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
    res.status(500).json({ error: 'Failed to reorder tasks' });
  }
});

// Delete task
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const client = await pool.connect();
    
    await client.query('DELETE FROM tasks WHERE id = $1', [id]);
    
    client.release();
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Add journal entry
app.post('/api/journal', async (req, res) => {
  try {
    const { question, answer, author } = req.body;
    const client = await pool.connect();
    
    const result = await client.query(
      'INSERT INTO journal (question, answer, author) VALUES ($1, $2, $3) RETURNING *',
      [question, answer, author]
    );
    
    client.release();
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error adding journal entry:', error);
    res.status(500).json({ error: 'Failed to add journal entry' });
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
    message: 'Our Story Todo App is running!'
  });
});

// Serve the main app
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Initialize database and start server
initializeDatabase().then(() => {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`App available at: http://0.0.0.0:${PORT}`);
    console.log('Health check available at: /health');
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
      process.exit(0);
    });
  });
}); 