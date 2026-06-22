/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { dbService } from '../../../src/dbService.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const memoryId = Array.isArray(id) ? id[0] : id;

  try {
    const { isApproved } = req.body || {};
    const success = await dbService.moderateMemory(memoryId, isApproved);
    return res.json({ success });
  } catch (e: any) {
    console.error(`POST /api/memories/${memoryId}/moderate failed:`, e);
    return res.status(500).json({ error: e.message });
  }
}
