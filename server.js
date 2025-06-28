const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Debug logging
console.log('Environment variables:');
console.log('- PORT:', process.env.PORT);
console.log('- RAILWAY_STATIC_URL_PORT:', process.env.RAILWAY_STATIC_URL_PORT);
console.log('- RAILWAY_PORT:', process.env.RAILWAY_PORT);
console.log('Using PORT:', PORT);

// Basic middleware
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    port: PORT,
    message: 'Server is running!'
  });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.status(200).json({ 
    message: 'Test endpoint working!',
    port: PORT,
    time: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Our Story Todo App - Backend is running!',
    endpoints: {
      health: '/health',
      test: '/test'
    },
    port: PORT
  });
});

// Catch-all route
app.get('*', (req, res) => {
  console.log('Received request for:', req.url);
  res.status(404).json({ error: 'Not found', path: req.url });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`App available at: http://0.0.0.0:${PORT}`);
  console.log('Health check available at: /health');
  console.log('Test endpoint available at: /test');
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