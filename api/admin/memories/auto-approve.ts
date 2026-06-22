/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { dbService } from '../../../src/dbService.js';

export default async function handler(req: any, res: any) {
  try {
    if (req.method === 'GET') {
      const enabled = await dbService.getAutoApproveMemories();
      return res.json({ enabled });
    }

    if (req.method === 'POST') {
      const { enabled } = req.body || {};
      const updated = await dbService.setAutoApproveMemories(!!enabled);
      return res.json({ success: true, enabled: updated });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e: any) {
    console.error(`${req.method} /api/admin/memories/auto-approve failed:`, e);
    return res.status(500).json({ error: e.message });
  }
}
