const fetch = require('node-fetch');

async function test() {
  const res = await fetch('http://localhost:3000/api/inbox/3ebccd75-0c49-4246-8961-e7f662491c8e/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: 'Test message', isInternal: false })
  });
  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Body:', text.substring(0, 1000));
}
test();
