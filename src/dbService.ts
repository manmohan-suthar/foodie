/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MongoClient, type Collection, type Db } from 'mongodb';
import { MenuItem, Category, Order, Memory, User, Offer } from './types.js';

interface AppSettings {
  key: string;
  value: unknown;
}

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'foodie';

if (!MONGODB_URI) {
  throw new Error('Missing MONGODB_URI. Add it to your .env file before starting the server.');
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-healthy', name: 'Healthy', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=150&auto=format&fit=crop&q=60', type: 'both' },
  { id: 'cat-homestyle', name: 'Home Style', image: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a40?w=150&auto=format&fit=crop&q=60', type: 'both' },
  { id: 'cat-pizza', name: 'Pizza', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=150&auto=format&fit=crop&q=60', type: 'both' },
  { id: 'cat-chicken', name: 'Chicken', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=150&auto=format&fit=crop&q=60', type: 'nonveg' },
  { id: 'cat-momo', name: 'Momo', image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=150&auto=format&fit=crop&q=60', type: 'both' },
  { id: 'cat-burger', name: 'Burger', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=150&auto=format&fit=crop&q=60', type: 'both' },
];

const DEFAULT_MENU: MenuItem[] = [
  {
    id: 'item-paneer-pizza',
    name: 'Paneer Butter Masala Pizza',
    price: 140,
    category: 'Pizza',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60',
    isVeg: true,
    description: 'A fusion delicious pizza loaded with tender paneer cubes and rich butter masala base sauce.',
    isAvailable: true,
    rating: 4.5,
    prepTime: '15 Min'
  },
  {
    id: 'item-roasted-potato',
    name: 'Roasted Potato',
    price: 130,
    category: 'Healthy',
    image: 'https://images.unsplash.com/photo-1518013431117-eb1465fa5752?w=500&auto=format&fit=crop&q=60',
    isVeg: true,
    description: 'Crispy roasted baby potatoes lightly tossed in premium olive oil, fresh rosemary, and sea salt.',
    isAvailable: true,
    rating: 4.4,
    prepTime: '20 Min'
  },
  {
    id: 'item-paneer-masala',
    name: 'Paneer Butter Masala',
    price: 140,
    category: 'Home Style',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60',
    isVeg: true,
    description: 'Soft, creamy home style cottage cheese simmered in slowly cooked rich tomato-cashew curry gravy.',
    isAvailable: true,
    rating: 4.7,
    prepTime: '15 Min'
  },
  {
    id: 'item-ghee-prawns',
    name: 'Ghee Prawns',
    price: 140,
    category: 'Home Style',
    image: 'https://images.unsplash.com/photo-1551248429-40975aa4de74?w=500&auto=format&fit=crop&q=60',
    isVeg: false,
    description: 'Succulent prawns toasted with authentic home-made cow ghee and rich spicy coastal masalas.',
    isAvailable: true,
    rating: 4.9,
    prepTime: '20 Min'
  },
  {
    id: 'item-chicken-sandwich',
    name: 'Chicken Sandwich',
    price: 140,
    category: 'Chicken',
    image: 'https://images.unsplash.com/photo-1521390188846-e2a3a97453a0?w=500&auto=format&fit=crop&q=60',
    isVeg: false,
    description: 'Double stacked fresh sandwich with robust flame grilled chicken breast, fresh lettuce, and cheese.',
    isAvailable: true,
    rating: 4.5,
    prepTime: '15 Min'
  },
  {
    id: 'item-stuffed-dates',
    name: 'Stuffed dates dessert',
    price: 120,
    category: 'Healthy',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500&auto=format&fit=crop&q=60',
    isVeg: true,
    description: 'Soft, sweet Medjool dates stuffed with high-quality cream cheese and crunchy toasted walnuts.',
    isAvailable: true,
    rating: 4.3,
    prepTime: '20 Min'
  },
  {
    id: 'item-crab-lollipop',
    name: 'Crab Lollypop',
    price: 120,
    category: 'Chicken',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=60',
    isVeg: false,
    description: 'Savory breaded crab claw lollipops fried golden brown, accompanied by spicy sriracha sauce.',
    isAvailable: true,
    rating: 4.3,
    prepTime: '20 Min'
  },
  {
    id: 'item-beef-steak',
    name: 'Beef Steak',
    price: 120,
    category: 'Home Style',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60',
    isVeg: false,
    description: 'Thick, seasoned beef steak grilled exactly to your design preference, served with visual herbs.',
    isAvailable: true,
    rating: 4.3,
    prepTime: '20 Min'
  },
  {
    id: 'item-chicken-burger',
    name: 'Chicken Burger',
    price: 120,
    category: 'Burger',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60',
    isVeg: false,
    description: 'Classic toasted bun with golden-fried chicken patty, special sauces, red onions, and dill pickles.',
    isAvailable: true,
    rating: 4.6,
    prepTime: '10 Min'
  },
  {
    id: 'item-veg-momo',
    name: 'Veg Steamed Momo',
    price: 90,
    category: 'Momo',
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&auto=format&fit=crop&q=60',
    isVeg: true,
    description: 'Steaming hot handmade authentic Nepalese dumplings filled with finely chopped organic vegetables.',
    isAvailable: true,
    rating: 4.4,
    prepTime: '12 Min'
  }
];

const DEFAULT_OFFERS: Offer[] = [
  {
    id: 'offer-1',
    title: 'Up To',
    discountText: '70% OFF',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60',
    isActive: true
  }
];

class MongoDbService {
  private client: MongoClient;
  private connection?: Promise<Db>;

  constructor() {
    this.client = new MongoClient(MONGODB_URI);
  }

  async connect(): Promise<void> {
    await this.getDb();
  }

  private async getDb(): Promise<Db> {
    if (!this.connection) {
      this.connection = this.client.connect().then(async client => {
        const db = client.db(MONGODB_DB_NAME);
        await this.ensureIndexes(db);
        await this.seedDefaults(db);
        console.log(`MongoDB connected: ${MONGODB_DB_NAME}`);
        return db;
      });
    }
    return this.connection;
  }

  private async ensureIndexes(db: Db): Promise<void> {
    await Promise.all([
      db.collection<MenuItem>('menuItems').createIndex({ id: 1 }, { unique: true }),
      db.collection<Category>('categories').createIndex({ id: 1 }, { unique: true }),
      db.collection<Order>('orders').createIndex({ id: 1 }, { unique: true }),
      db.collection<Order>('orders').createIndex({ timestamp: -1 }),
      db.collection<Memory>('memories').createIndex({ id: 1 }, { unique: true }),
      db.collection<Memory>('memories').createIndex({ uploadedAt: -1 }),
      db.collection<Offer>('offers').createIndex({ id: 1 }, { unique: true }),
      db.collection<AppSettings>('settings').createIndex({ key: 1 }, { unique: true }),
    ]);
  }

  private async seedDefaults(db: Db): Promise<void> {
    const [menuCount, categoryCount, offerCount, autoApproveSetting] = await Promise.all([
      db.collection<MenuItem>('menuItems').countDocuments(),
      db.collection<Category>('categories').countDocuments(),
      db.collection<Offer>('offers').countDocuments(),
      db.collection<AppSettings>('settings').findOne({ key: 'autoApproveMemories' }),
    ]);

    const tasks: Promise<unknown>[] = [];
    if (menuCount === 0) {
      tasks.push(db.collection<MenuItem>('menuItems').insertMany(DEFAULT_MENU));
    }
    if (categoryCount === 0) {
      tasks.push(db.collection<Category>('categories').insertMany(DEFAULT_CATEGORIES));
    }
    if (offerCount === 0) {
      tasks.push(db.collection<Offer>('offers').insertMany(DEFAULT_OFFERS));
    }
    if (!autoApproveSetting) {
      tasks.push(db.collection<AppSettings>('settings').insertOne({ key: 'autoApproveMemories', value: false }));
    }

    await Promise.all(tasks);
  }

  private async collection<T extends object>(name: string): Promise<Collection<T>> {
    const db = await this.getDb();
    return db.collection<T>(name);
  }

  async getMenuItems(): Promise<MenuItem[]> {
    return (await this.collection<MenuItem>('menuItems')).find({}, { projection: { _id: 0 } }).toArray();
  }

  async saveMenuItem(item: MenuItem): Promise<MenuItem> {
    await (await this.collection<MenuItem>('menuItems')).replaceOne({ id: item.id }, item, { upsert: true });
    return item;
  }

  async deleteMenuItem(id: string): Promise<boolean> {
    const result = await (await this.collection<MenuItem>('menuItems')).deleteOne({ id });
    return result.deletedCount > 0;
  }

  async getCategories(): Promise<Category[]> {
    return (await this.collection<Category>('categories')).find({}, { projection: { _id: 0 } }).toArray();
  }

  async saveCategory(category: Category): Promise<Category> {
    await (await this.collection<Category>('categories')).replaceOne({ id: category.id }, category, { upsert: true });
    return category;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const result = await (await this.collection<Category>('categories')).deleteOne({ id });
    return result.deletedCount > 0;
  }

  async getOrders(): Promise<Order[]> {
    return (await this.collection<Order>('orders')).find({}, { projection: { _id: 0 } }).sort({ timestamp: -1 }).toArray();
  }

  async createOrder(order: Omit<Order, 'id' | 'timestamp' | 'status'>): Promise<Order> {
    const newOrder: Order = {
      ...order,
      id: `order-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      status: 'pending',
      timestamp: new Date().toISOString()
    };
    await (await this.collection<Order>('orders')).insertOne(newOrder);
    return newOrder;
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
    const result = await (await this.collection<Order>('orders')).findOneAndUpdate(
      { id },
      { $set: updates },
      { returnDocument: 'after', projection: { _id: 0 } }
    );
    return result;
  }

  async updateOrderStatus(
    id: string,
    status: Order['status'],
    paymentMode?: Order['paymentMode'],
    paymentRemark?: string,
    isPaid?: boolean
  ): Promise<Order | null> {
    const updates: Partial<Order> = { status };
    if (paymentMode !== undefined) {
      updates.paymentMode = paymentMode;
    }
    if (paymentRemark !== undefined) {
      updates.paymentRemark = paymentRemark;
    }
    if (isPaid !== undefined) {
      updates.isPaid = isPaid;
    }
    return this.updateOrder(id, updates);
  }

  async deleteOrder(id: string): Promise<boolean> {
    const result = await (await this.collection<Order>('orders')).deleteOne({ id });
    return result.deletedCount > 0;
  }

  async getMemories(): Promise<Memory[]> {
    return (await this.collection<Memory>('memories')).find({}, { projection: { _id: 0 } }).sort({ uploadedAt: -1 }).toArray();
  }

  async getAutoApproveMemories(): Promise<boolean> {
    const setting = await (await this.collection<AppSettings>('settings')).findOne({ key: 'autoApproveMemories' });
    return !!setting?.value;
  }

  async setAutoApproveMemories(value: boolean): Promise<boolean> {
    await (await this.collection<AppSettings>('settings')).updateOne(
      { key: 'autoApproveMemories' },
      { $set: { value } },
      { upsert: true }
    );
    return value;
  }

  async createMemory(memory: Omit<Memory, 'id' | 'isApproved' | 'uploadedAt'>): Promise<Memory> {
    const newMemory: Memory = {
      ...memory,
      id: `mem-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      isApproved: await this.getAutoApproveMemories(),
      uploadedAt: new Date().toISOString()
    };
    await (await this.collection<Memory>('memories')).insertOne(newMemory);
    return newMemory;
  }

  async moderateMemory(id: string, isApproved: boolean): Promise<boolean> {
    if (!isApproved) {
      return this.deleteMemory(id);
    }

    const result = await (await this.collection<Memory>('memories')).updateOne({ id }, { $set: { isApproved: true } });
    return result.matchedCount > 0;
  }

  async deleteMemory(id: string): Promise<boolean> {
    const result = await (await this.collection<Memory>('memories')).deleteOne({ id });
    return result.deletedCount > 0;
  }

  async getOffers(): Promise<Offer[]> {
    return (await this.collection<Offer>('offers')).find({}, { projection: { _id: 0 } }).toArray();
  }

  async updateOffer(offer: Offer): Promise<Offer> {
    await (await this.collection<Offer>('offers')).replaceOne({ id: offer.id }, offer, { upsert: true });
    return offer;
  }
}

export const dbService = new MongoDbService();
