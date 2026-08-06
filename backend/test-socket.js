const { io } = require('socket.io-client');

const socket = io('http://localhost:3000/realtime');

socket.on('connect', () => {
  console.log('✅ Socket connected with ID:', socket.id);
  
  // Wait a moment for server console log, then exit
  setTimeout(() => {
    socket.disconnect();
    process.exit(0);
  }, 1000);
});

socket.on('connect_error', (err) => {
  console.error('❌ Socket connection error:', err.message);
  process.exit(1);
});
