/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import { dbService } from './dbService.js';

export function createApiApp() {
  const app = express();

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  app.get('/api/health', async (req, res) => {
    try {
      const connected = await dbService.ping();
      res.json({
        ok: true,
        mongodb: connected ? 'connected' : 'not_connected',
        dbName: dbService.dbName,
      });
    } catch (e: any) {
      console.error('Health check failed:', e);
      res.status(500).json({ ok: false, error: e.message });
    }
  });

  app.get('/api/menu', async (req, res) => {
    try {
      const items = await dbService.getMenuItems();
      res.json(items);
    } catch (e: any) {
      console.error('GET /api/menu failed:', e);
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/menu', async (req, res) => {
    try {
      const item = await dbService.saveMenuItem(req.body);
      res.json({ success: true, item });
    } catch (e: any) {
      console.error('POST /api/menu failed:', e);
      res.status(500).json({ error: e.message });
    }
  });

  app.delete('/api/menu/:id', async (req, res) => {
    try {
      const success = await dbService.deleteMenuItem(req.params.id);
      res.json({ success });
    } catch (e: any) {
      console.error('DELETE /api/menu/:id failed:', e);
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/categories', async (req, res) => {
    try {
      const cats = await dbService.getCategories();
      res.json(cats);
    } catch (e: any) {
      console.error('GET /api/categories failed:', e);
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/categories', async (req, res) => {
    try {
      const cat = await dbService.saveCategory(req.body);
      res.json({ success: true, category: cat });
    } catch (e: any) {
      console.error('POST /api/categories failed:', e);
      res.status(500).json({ error: e.message });
    }
  });

  app.delete('/api/categories/:id', async (req, res) => {
    try {
      const success = await dbService.deleteCategory(req.params.id);
      res.json({ success });
    } catch (e: any) {
      console.error('DELETE /api/categories/:id failed:', e);
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/orders', async (req, res) => {
    try {
      const orders = await dbService.getOrders();
      orders.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      res.json(orders);
    } catch (e: any) {
      console.error('GET /api/orders failed:', e);
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/orders', async (req, res) => {
    try {
      const {
        tableNumber,
        customerName,
        phone,
        items,
        totalAmount,
        fcmToken,
        isManual,
        guestCount,
        specialInstructions,
        discountPercent,
        paymentMode
      } = req.body;

      if (!customerName || !phone || !items || !items.length) {
        return res.status(400).json({ error: 'Missing required customer order fields' });
      }

      const order = await dbService.createOrder({
        tableNumber: tableNumber || 'Guest Table',
        customerName,
        phone,
        items,
        totalAmount,
        fcmToken,
        isManual: !!isManual,
        guestCount: guestCount || 1,
        specialInstructions: specialInstructions || '',
        discountPercent: discountPercent || 0,
        paymentMode: paymentMode || 'cash'
      });
      res.json({ success: true, order });
    } catch (e: any) {
      console.error('POST /api/orders failed:', e);
      res.status(500).json({ error: e.message });
    }
  });

  app.put('/api/orders/:id', async (req, res) => {
    try {
      const { items, totalAmount, specialInstructions, isManual, guestCount, discountPercent, paymentMode } = req.body;
      const order = await dbService.updateOrder(req.params.id, {
        items,
        totalAmount,
        specialInstructions,
        isManual,
        guestCount,
        discountPercent,
        paymentMode
      });
      if (order) {
        res.json({ success: true, order });
      } else {
        res.status(404).json({ error: 'Order not found' });
      }
    } catch (e: any) {
      console.error('PUT /api/orders/:id failed:', e);
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/orders/:id/status', async (req, res) => {
    try {
      const { status, paymentMode, paymentRemark, isPaid } = req.body;
      if (!status) {
        return res.status(400).json({ error: 'Missing action status value' });
      }
      const updated = await dbService.updateOrderStatus(
        req.params.id,
        status,
        paymentMode,
        paymentRemark,
        isPaid
      );
      if (updated) {
        res.json({ success: true, order: updated });
      } else {
        res.status(404).json({ error: 'Order not found' });
      }
    } catch (e: any) {
      console.error('POST /api/orders/:id/status failed:', e);
      res.status(500).json({ error: e.message });
    }
  });

  app.delete('/api/orders/:id', async (req, res) => {
    try {
      const success = await dbService.deleteOrder(req.params.id);
      res.json({ success });
    } catch (e: any) {
      console.error('DELETE /api/orders/:id failed:', e);
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/offers', async (req, res) => {
    try {
      const offers = await dbService.getOffers();
      res.json(offers);
    } catch (e: any) {
      console.error('GET /api/offers failed:', e);
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/offers', async (req, res) => {
    try {
      const offer = await dbService.updateOffer(req.body);
      res.json({ success: true, offer });
    } catch (e: any) {
      console.error('POST /api/offers failed:', e);
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/memories', async (req, res) => {
    try {
      const memories = (await dbService.getMemories()).filter(m => m.isApproved);
      memories.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
      res.json(memories);
    } catch (e: any) {
      console.error('GET /api/memories failed:', e);
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/admin/memories', async (req, res) => {
    try {
      const memories = await dbService.getMemories();
      memories.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
      res.json(memories);
    } catch (e: any) {
      console.error('GET /api/admin/memories failed:', e);
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/admin/memories/auto-approve', async (req, res) => {
    try {
      const enabled = await dbService.getAutoApproveMemories();
      res.json({ enabled });
    } catch (e: any) {
      console.error('GET /api/admin/memories/auto-approve failed:', e);
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/admin/memories/auto-approve', async (req, res) => {
    try {
      const { enabled } = req.body;
      const updated = await dbService.setAutoApproveMemories(!!enabled);
      res.json({ success: true, enabled: updated });
    } catch (e: any) {
      console.error('POST /api/admin/memories/auto-approve failed:', e);
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/memories', async (req, res) => {
    try {
      const { userId, userEmail, userName, photoUrl } = req.body;
      if (!userId || !userEmail || !userName || !photoUrl) {
        return res.status(400).json({ error: 'Missing required photo details' });
      }
      const newMemory = await dbService.createMemory({
        userId,
        userEmail,
        userName,
        photoUrl
      });
      res.json({ success: true, memory: newMemory });
    } catch (e: any) {
      console.error('POST /api/memories failed:', e);
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/memories/:id/moderate', async (req, res) => {
    try {
      const { isApproved } = req.body;
      const success = await dbService.moderateMemory(req.params.id, isApproved);
      res.json({ success });
    } catch (e: any) {
      console.error('POST /api/memories/:id/moderate failed:', e);
      res.status(500).json({ error: e.message });
    }
  });

  app.delete('/api/memories/:id', async (req, res) => {
    try {
      const success = await dbService.deleteMemory(req.params.id);
      res.json({ success });
    } catch (e: any) {
      console.error('DELETE /api/memories/:id failed:', e);
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/admin/login', (req, res) => {
    try {
      const { password } = req.body;
      if (password === 'admin' || password === 'admin123') {
        res.json({ success: true, token: 'mock-jwt-admin-token-123456' });
      } else {
        res.status(401).json({ error: 'Invalid admin password' });
      }
    } catch (e: any) {
      console.error('POST /api/admin/login failed:', e);
      res.status(500).json({ error: e.message });
    }
  });

  return app;
}
