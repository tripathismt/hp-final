const http2 = require('http2');
const { setTimeout } = require('timers/promises');
const networkHeader = require('../network/N14.json'); // Adjust the path as necessary
const { exit } = require('process');

const sessionOptions = {
  settings: {
    maxHeaderListSize: 2 * 1024 * 1024 // 1MB header size limit
  }
};

const session = http2.connect('http://localhost:8000', sessionOptions); // Update the server URL if needed

session.on('error', (err) => {
  console.error('Session error:', err);
});

session.on('close', () => {
  console.log('Session closed');
});

let requestsMade = 0;
const maxRequests = 20;
const maxRetries = 5;

const exponentialBackoff = (attempt) => {
  return Math.min(1000 * Math.pow(2, attempt), 5000);
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

  return new Promise((resolve, reject) => {
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
      // requestsMade++;
      if (requestsMade >= maxRequests) {
        session.close((err) => {
          if (err) {
            console.error('Error closing session:', err);
            reject(err);
          } else {
            console.log('Session closed after reaching the max requests limit');
            resolve();
          }
        });
      } else {
        resolve();
      }
    });

    req.on('error', async (err) => {
      console.error('Request error:', err);
      if (attempt < maxRetries) {
        const delay = exponentialBackoff(attempt);
        console.log(`Retrying request in ${delay}ms (attempt ${attempt + 1})`);
        await setTimeout(delay);
        servercall(attempt + 1).then(resolve).catch(reject);
      } else {
        console.error('Maximum retries reached. Unable to complete request.');
        reject(err);
      }
    });

    req.on('close', () => {
      requestsMade++;
      console.log('Stream closed');
    });

    // Send the JSON payload
    req.end(JSON.stringify(header['network-info']));
  });
};

const startServerCalls = async () => {
  for (let i = 0; i < maxRequests; i++) {
    await servercall();
    await setTimeout(1000); // Wait for 1 second between each request
  }
};

startServerCalls().then(() => {
  console.log('All requests have been closed.');
  exit(0);
}).catch((err) => {
  console.error('An error occurred:', err);
  exit(1);
});
