/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { dbService } from '../../src/dbService.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', 'DELETE');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const memoryId = Array.isArray(id) ? id[0] : id;

  try {
    const success = await dbService.deleteMemory(memoryId);
    return res.json({ success });
  } catch (e: any) {
    console.error(`DELETE /api/memories/${memoryId} failed:`, e);
    return res.status(500).json({ error: e.message });
  }
}
