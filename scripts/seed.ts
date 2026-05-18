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

// ── Inline schemas (avoid importing server models that need Next.js context) ──

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
    currencySymbol: { type: String, default: '$' },
  },
  { timestamps: true }
);

const CategorySchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  description: String,
  createdAt: { type: Date, default: Date.now },
});

const AdminCredential =
  mongoose.models.AdminCredential ||
  mongoose.model('AdminCredential', AdminCredentialSchema);
const InvoiceTemplate =
  mongoose.models.InvoiceTemplate ||
  mongoose.model('InvoiceTemplate', InvoiceTemplateSchema);
const Category =
  mongoose.models.Category || mongoose.model('Category', CategorySchema);

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI!);
  console.log('Connected.');

  // Admin credential
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD!, 12);
  await AdminCredential.findOneAndUpdate(
    { email: ADMIN_EMAIL },
    { email: ADMIN_EMAIL, passwordHash, createdAt: new Date() },
    { upsert: true, new: true }
  );
  console.log(`✓ Admin account: ${ADMIN_EMAIL}`);

  // Default invoice template
  await InvoiceTemplate.findOneAndUpdate(
    {},
    {
      restaurantName: 'My Restaurant',
      currencySymbol: '$',
      address: '',
      footerText: 'Thank you for your order!',
      terms: '',
    },
    { upsert: true, new: true, sort: { _id: 1 } }
  );
  console.log('✓ Default InvoiceTemplate');

  // Categories
  const categories = ['Proteins', 'Buns', 'Sauces', 'Packaging', 'Beverages'];
  for (const name of categories) {
    await Category.findOneAndUpdate(
      { name },
      { name, createdAt: new Date() },
      { upsert: true }
    );
  }
  console.log(`✓ Categories: ${categories.join(', ')}`);

  await mongoose.disconnect();
  console.log('Seed complete.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
