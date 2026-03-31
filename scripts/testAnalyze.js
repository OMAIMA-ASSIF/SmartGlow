require('dotenv').config({path:'.env.local'});
const FormData = require('form-data');
// dynamic import for node-fetch to support ESM default
async function fetch(...args) {
  const { default: f } = await import('node-fetch');
  return f(...args);
}

(async () => {
  const img = 'data:image/jpeg;base64,' + Buffer.from('test').toString('base64');
  const form = new FormData();
  form.append('image', img);
  try {
    const res = await fetch('http://localhost:3000/api/analyze-skin', {
      method: 'POST',
      body: form,
      headers: form.getHeaders(),
    });
    console.log('status', res.status);
    const data = await res.json();
    console.log(data);
  } catch (e) {
    console.error('error', e.message || e);
  }
})();