const http2 = require('http2');

const server = http2.createServer();

server.on('error', (err) => {
  console.error('Server error:', err);
});

server.on('stream', (stream, headers) => {
  console.log('Received request:', headers);

  stream.respond({
    ':status': 200,
    'Content-Type': 'application/json',
    'network-info': JSON.stringify(headers["network-info"]),
  });

  stream.end(JSON.stringify({ message: 'processed request successfully' }));
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
