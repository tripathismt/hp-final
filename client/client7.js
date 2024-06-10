const http2 = require('http2');
const { setTimeout } = require('timers/promises');
const networkHeader = require('../network/n7.json'); // Adjust the path as necessary

const sessionOptions = {
  settings: {
    maxHeaderListSize: 2 * 1024 * 1024 // 2MB header size limit
  }
};

const session = http2.connect('http://localhost:8000', sessionOptions); // Update the server URL if needed

session.on('error', (err) => {
  console.error('Session error:', err);
});

session.on('close', () => {
  console.log('Session closed');
});

let interval;
let requestsMade = 0;
const maxRequests = 20;

const exponentialBackoff = (attempt) => {
  return Math.min(1000 * Math.pow(2, attempt), 30000); 
};

const servercall = async (attempt = 0) => {
  if (requestsMade >= maxRequests) return;

  const num = Math.floor(Math.random() * networkHeader.length);
  console.log(`Selected header index: ${num}`);

  const header = networkHeader[num];
  const options = {
    ':path': header[':path'].replace('{apiRoot}', '/api'), // Replace {apiRoot} with actual root path
    ':method': header[':method'],
    'Content-Type': header['Content-Type'],
    'network-info': JSON.stringify(header['network-info']),
  };

  const req = session.request(options);

  req.setEncoding('utf8');

  req.on('response', (headers) => {
    console.log('Response headers:', headers);
  });

  let data = '';
  req.on('data', (chunk) => {
    data += chunk;
  });

  req.on('end', () => {
    console.log('Response data:', data);
    console.log('Request ended');
    requestsMade++;
    if (requestsMade >= maxRequests) {
      clearInterval(interval);
      session.close((err) => {
        if (err) {
          console.error('Error closing session:', err);
        }
      });
    }
  });

  req.on('error', async (err) => {
    console.error('Request error:', err);
    if (attempt < 5) {
      const delay = exponentialBackoff(attempt);
      console.log(`Retrying request in ${delay}ms (attempt ${attempt + 1})`);
      await setTimeout(delay);
      servercall(attempt + 1); 
    } else {
      console.error('Maximum retries reached. Unable to complete request.');
    }
  });

  req.on('close', () => {
    console.log('Stream closed');
  });

  // Send the JSON payload
  req.end(JSON.stringify(header['network-info']));
};

(async () => {
  interval = setInterval(async () => {
    await servercall();
  }, 1000);
})();
