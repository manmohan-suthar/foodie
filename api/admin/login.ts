/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export default function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body || {};
  if (password === 'admin' || password === 'admin123') {
    return res.json({ success: true, token: 'mock-jwt-admin-token-123456' });
  }

  return res.status(401).json({ error: 'Invalid admin password' });
}
