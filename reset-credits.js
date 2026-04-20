const data = JSON.stringify({ adminKey: 'reset-all-credits-2024' });

const response = await fetch('http://localhost:3001/api/admin/reset-credits', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: data
});

const result = await response.json();
console.log('Status:', response.status);
console.log('Response:', JSON.stringify(result, null, 2));