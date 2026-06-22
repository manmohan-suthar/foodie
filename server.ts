/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import path from 'path';
import dotenv from 'dotenv';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createApiApp } from './src/apiApp.js';
import { dbService } from './src/dbService.js';

dotenv.config();

async function startServer() {
  const app = createApiApp();
  const PORT = 3000;

  try {
    const connected = await dbService.ping();
    console.log(`MongoDB startup check: ${connected ? 'connected' : 'not connected'} (${dbService.dbName})`);
  } catch (e) {
    console.error('MongoDB startup check failed:', e);
  }

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT} with NODE_ENV=${process.env.NODE_ENV}`);
  });
}

startServer();
