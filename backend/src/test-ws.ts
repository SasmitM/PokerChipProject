// test-ws.ts
import http from 'http';

// First, place a bet using HTTP
const postData = JSON.stringify({
  playerId: "0f3bf5b2-6a1a-41c5-bbda-98ecac788965",
  amount: 50
});

const options: http.RequestOptions = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/tables/4280c20c-c69d-4270-ac7d-1141c50e1d9c/bet',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('RESPONSE:', data);
  });
});

req.on('error', (e) => {
  console.error(`Problem: ${e.message}`);
});

req.write(postData);
req.end();