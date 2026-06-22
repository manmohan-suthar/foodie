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
  const orderId = Array.isArray(id) ? id[0] : id;

  try {
    const { status, paymentMode, paymentRemark, isPaid } = req.body || {};
    if (!status) {
      return res.status(400).json({ error: 'Missing action status value' });
    }

    const updated = await dbService.updateOrderStatus(orderId, status, paymentMode, paymentRemark, isPaid);
    return updated
      ? res.json({ success: true, order: updated })
      : res.status(404).json({ error: 'Order not found' });
  } catch (e: any) {
    console.error(`POST /api/orders/${orderId}/status failed:`, e);
    return res.status(500).json({ error: e.message });
  }
}
