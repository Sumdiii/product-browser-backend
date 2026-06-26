const fetch = require('node-fetch');

const base = 'http://localhost:5000';

async function test(path) {
  const res = await fetch(base + path);
  const body = await res.text();
  if (!res.ok) {
    throw new Error(`${path} failed ${res.status}: ${body}`);
  }
  console.log(`${path} OK`);
}

(async () => {
  try {
    await test('/categories');
    await test('/stats');
    await test('/products?limit=1');
    console.log('All tests passed');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
})();
