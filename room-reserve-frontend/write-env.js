const fs = require('fs');
const apiBase = process.env.ROOM_RESERVE_API_BASE || 'http://localhost:8080';
const content = `window.ROOM_RESERVE_API_BASE = "${apiBase}";\n`;
fs.writeFileSync('public/env.js', content);
console.log(`[write-env.js] Wrote window.ROOM_RESERVE_API_BASE = "${apiBase}" to public/env.js`);
