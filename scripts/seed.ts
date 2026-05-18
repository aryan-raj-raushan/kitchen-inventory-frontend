import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!MONGODB_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Missing required env vars: MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD');
  process.exit(1);
}

// ── Inline schemas ─────────────────────────────────────────────────────────────

const AdminCredentialSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const InvoiceTemplateSchema = new mongoose.Schema(
  {
    restaurantName: { type: String, required: true },
    address: String,
    logoUrl: String,
    footerText: String,
    terms: String,
    currencySymbol: { type: String, default: '₹' },
  },
  { timestamps: true }
);

const CategorySchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  description: String,
  createdAt: { type: Date, default: Date.now },
});

const InventoryItemSchema = new mongoose.Schema(
  {
    name: { type: String, unique: true, required: true, trim: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    unit: { type: String, required: true },
    price: { type: Number, required: true, min: 0, default: 0 },
    currentQuantity: { type: Number, required: true, min: 0 },
    dailyReset: { type: Boolean, default: false },
    imageUrl: { type: String },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

const AdminCredential =
  mongoose.models.AdminCredential ||
  mongoose.model('AdminCredential', AdminCredentialSchema);
const InvoiceTemplate =
  mongoose.models.InvoiceTemplate ||
  mongoose.model('InvoiceTemplate', InvoiceTemplateSchema);
const Category =
  mongoose.models.Category || mongoose.model('Category', CategorySchema);
const InventoryItem =
  mongoose.models.InventoryItem || mongoose.model('InventoryItem', InventoryItemSchema);

// ── Mock data ──────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { name: 'Burgers', description: 'Burger patties, buns and toppings' },
  { name: 'Pizzas', description: 'Pizza bases, toppings and sauces' },
  { name: 'Beverages', description: 'Cold drinks, juices and hot beverages' },
  { name: 'Sides & Snacks', description: 'Fries, nuggets, wraps and sides' },
  { name: 'Dairy & Sauces', description: 'Cheese, butter, dips and condiments' },
  { name: 'Bakery', description: 'Breads, buns and pastries' },
];

const ITEMS: Array<{
  name: string;
  category: string;
  unit: string;
  price: number;
  currentQuantity: number;
  dailyReset: boolean;
}> = [
  // Burgers
  { name: 'Chicken Patty',        category: 'Burgers',       unit: 'pcs',    price: 80,  currentQuantity: 50,  dailyReset: true  },
  { name: 'Beef Patty',           category: 'Burgers',       unit: 'pcs',    price: 120, currentQuantity: 40,  dailyReset: true  },
  { name: 'Veggie Patty',         category: 'Burgers',       unit: 'pcs',    price: 60,  currentQuantity: 35,  dailyReset: true  },
  { name: 'Burger Bun',           category: 'Burgers',       unit: 'pcs',    price: 15,  currentQuantity: 100, dailyReset: true  },
  { name: 'Lettuce Leaf',         category: 'Burgers',       unit: 'kg',     price: 40,  currentQuantity: 5,   dailyReset: true  },
  { name: 'Tomato Slice',         category: 'Burgers',       unit: 'kg',     price: 30,  currentQuantity: 4,   dailyReset: true  },
  // Pizzas
  { name: 'Pizza Base (8 inch)',  category: 'Pizzas',        unit: 'pcs',    price: 45,  currentQuantity: 60,  dailyReset: false },
  { name: 'Pizza Base (12 inch)', category: 'Pizzas',        unit: 'pcs',    price: 70,  currentQuantity: 40,  dailyReset: false },
  { name: 'Tomato Pizza Sauce',   category: 'Pizzas',        unit: 'litre',  price: 90,  currentQuantity: 10,  dailyReset: false },
  { name: 'Mozzarella Cheese',    category: 'Pizzas',        unit: 'kg',     price: 350, currentQuantity: 8,   dailyReset: false },
  { name: 'Bell Peppers',         category: 'Pizzas',        unit: 'kg',     price: 60,  currentQuantity: 3,   dailyReset: true  },
  { name: 'Mushrooms',            category: 'Pizzas',        unit: 'kg',     price: 80,  currentQuantity: 3,   dailyReset: true  },
  // Beverages
  { name: 'Coca-Cola 250ml',      category: 'Beverages',     unit: 'bottle', price: 40,  currentQuantity: 120, dailyReset: false },
  { name: 'Sprite 250ml',         category: 'Beverages',     unit: 'bottle', price: 40,  currentQuantity: 80,  dailyReset: false },
  { name: 'Mango Juice 200ml',    category: 'Beverages',     unit: 'bottle', price: 35,  currentQuantity: 60,  dailyReset: false },
  { name: 'Mineral Water 500ml',  category: 'Beverages',     unit: 'bottle', price: 20,  currentQuantity: 150, dailyReset: false },
  { name: 'Cold Coffee',          category: 'Beverages',     unit: 'glass',  price: 89,  currentQuantity: 30,  dailyReset: true  },
  // Sides & Snacks
  { name: 'French Fries (Regular)', category: 'Sides & Snacks', unit: 'portion', price: 79, currentQuantity: 50, dailyReset: true  },
  { name: 'Chicken Nuggets (6pcs)', category: 'Sides & Snacks', unit: 'portion', price: 149, currentQuantity: 40, dailyReset: true  },
  { name: 'Onion Rings',          category: 'Sides & Snacks', unit: 'portion', price: 69, currentQuantity: 35, dailyReset: true  },
  { name: 'Coleslaw Cup',         category: 'Sides & Snacks', unit: 'cup',    price: 39,  currentQuantity: 30,  dailyReset: true  },
  // Dairy & Sauces
  { name: 'Cheddar Cheese Slice', category: 'Dairy & Sauces', unit: 'pcs',   price: 20,  currentQuantity: 200, dailyReset: false },
  { name: 'Mayonnaise',           category: 'Dairy & Sauces', unit: 'kg',    price: 180, currentQuantity: 5,   dailyReset: false },
  { name: 'Ketchup Sachet',       category: 'Dairy & Sauces', unit: 'pcs',   price: 3,   currentQuantity: 500, dailyReset: false },
  { name: 'Mustard Sauce',        category: 'Dairy & Sauces', unit: 'kg',    price: 160, currentQuantity: 3,   dailyReset: false },
  // Bakery
  { name: 'Hot Dog Bun',          category: 'Bakery',        unit: 'pcs',    price: 12,  currentQuantity: 80,  dailyReset: true  },
  { name: 'Garlic Bread Slice',   category: 'Bakery',        unit: 'pcs',    price: 25,  currentQuantity: 60,  dailyReset: true  },
];

async function seed() {
  console.log('Connecting to MongoDB…');
  await mongoose.connect(MONGODB_URI!);
  console.log('Connected.');

  // Admin credential
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD!, 12);
  await AdminCredential.findOneAndUpdate(
    { email: ADMIN_EMAIL },
    { email: ADMIN_EMAIL, passwordHash },
    { upsert: true, new: true }
  );
  console.log(`✓ Admin: ${ADMIN_EMAIL}`);

  // Invoice template
  await InvoiceTemplate.findOneAndUpdate(
    {},
    {
      restaurantName: 'The Kitchen Hub',
      currencySymbol: '₹',
      address: '42 Food Street, Mumbai 400001',
      footerText: 'Thank you for dining with us! Visit again.',
      terms: 'All prices are inclusive of taxes.',
    },
    { upsert: true, new: true, sort: { _id: 1 } }
  );
  console.log('✓ Invoice template');

  // Categories
  const categoryMap: Record<string, mongoose.Types.ObjectId> = {};
  for (const cat of CATEGORIES) {
    const doc = await Category.findOneAndUpdate(
      { name: cat.name },
      { name: cat.name, description: cat.description },
      { upsert: true, new: true }
    );
    categoryMap[cat.name] = doc._id;
  }
  console.log(`✓ ${CATEGORIES.length} categories`);

  // Inventory items
  let created = 0;
  let skipped = 0;
  for (const item of ITEMS) {
    const exists = await InventoryItem.findOne({ name: item.name });
    if (exists) { skipped++; continue; }
    await InventoryItem.create({
      name: item.name,
      categoryId: categoryMap[item.category],
      unit: item.unit,
      price: item.price,
      currentQuantity: item.currentQuantity,
      dailyReset: item.dailyReset,
      status: 'ACTIVE',
    });
    created++;
  }
  console.log(`✓ Inventory: ${created} created, ${skipped} already existed`);

  await mongoose.disconnect();
  console.log('Seed complete.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
