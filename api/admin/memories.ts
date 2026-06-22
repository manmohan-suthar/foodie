/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { dbService } from '../../src/dbService.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const memories = await dbService.getMemories();
    memories.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    return res.json(memories);
  } catch (e: any) {
    console.error('GET /api/admin/memories failed:', e);
    return res.status(500).json({ error: e.message });
  }
}
