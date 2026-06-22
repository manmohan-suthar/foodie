/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { dbService } from '../../src/dbService.js';

export default async function handler(req: any, res: any) {
  const { id } = req.query;
  const orderId = Array.isArray(id) ? id[0] : id;

  try {
    if (req.method === 'PUT') {
      const { items, totalAmount, specialInstructions, isManual, guestCount, discountPercent, paymentMode } = req.body || {};
      const order = await dbService.updateOrder(orderId, {
        items,
        totalAmount,
        specialInstructions,
        isManual,
        guestCount,
        discountPercent,
        paymentMode
      });
      return order
        ? res.json({ success: true, order })
        : res.status(404).json({ error: 'Order not found' });
    }

    if (req.method === 'DELETE') {
      const success = await dbService.deleteOrder(orderId);
      return res.json({ success });
    }

    res.setHeader('Allow', 'PUT, DELETE');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e: any) {
    console.error(`${req.method} /api/orders/${orderId} failed:`, e);
    return res.status(500).json({ error: e.message });
  }
}
