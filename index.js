/**
 * Hemix Bot V1.0 — Root Entry Point (CommonJS)
 *
 * Single entry point for all hosting panels (Katabump, Docker, Railway, etc).
 * Loads the compiled TypeScript bootstrap from dist/src/app.js
 */

const fs = require('fs');
const path = require('path');

const compiledEntry = path.join(__dirname, 'dist', 'src', 'app.js');

if (!fs.existsSync(compiledEntry)) {
  console.error(
    '[Hemix Bot] Build not found. Run "npm install" (triggers build) or "npm run build" manually.'
  );
  process.exit(1);
}

require(compiledEntry);
