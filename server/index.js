// server/index.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // Vite default
    methods: ['GET', 'POST']
  }
});

// Seed trade data
function generateTrades(count = 3000) {
  const trades = [];
  const symbols = ['RELIANCE', 'TCS', 'INFY', 'HDFC', 'ICICI', 'SBIN', 'ADANIENT'];
  const clients = ['CLIENT_A', 'CLIENT_B', 'CLIENT_C', 'CLIENT_D'];

  for (let i = 0; i < count; i++) {
    trades.push({
      tradeId: `T${100000 + i}`,
      client: clients[Math.floor(Math.random() * clients.length)],
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      quantity: Math.floor(Math.random() * 1000) + 1,
      price: (Math.random() * 5000 + 100).toFixed(2),
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString()
    });
  }
  return trades;
}

const allTrades = generateTrades(3000);
let pulledTrades = [];
let isPulling = false;

// Mock BSE API endpoint
app.get('/getTrades', (req, res) => {
  res.json({
    trades: pulledTrades,
    isPulling
  });
});

// Simulate long-running pull (configurable delay in seconds via query param)
app.get('/startPull', async (req, res) => {
  if (isPulling) {
    return res.json({ message: 'Pull already in progress' });
  }

  const delaySeconds = parseInt(req.query.delay) || 900; // default 15 min = 900s
  isPulling = true;
  pulledTrades = [];

  res.json({ message: `Pull started with delay ${delaySeconds}s` });

  // Simulate分批 pulling trades over time
  const batchSize = Math.ceil(allTrades.length / 10); // 10 batches
  for (let i = 0; i < 10; i++) {
    await new Promise(resolve => setTimeout(resolve, (delaySeconds * 1000) / 10));
    const batch = allTrades.slice(i * batchSize, (i + 1) * batchSize);
    pulledTrades.push(...batch);
    io.emit('newTrades', batch); // real-time push
  }

  isPulling = false;
  io.emit('pullComplete', { total: pulledTrades.length });
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.emit('initialTrades', { trades: pulledTrades, isPulling });
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});