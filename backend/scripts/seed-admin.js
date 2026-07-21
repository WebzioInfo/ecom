const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

const mongodbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123!';
const adminName = process.env.ADMIN_NAME || 'System Admin';

async function seedAdmin() {
  console.log(`Connecting to MongoDB at: ${mongodbUri}`);
  try {
    await mongoose.connect(mongodbUri);
    console.log('Connected to MongoDB.');

    // Define User Schema inline matching the schema definition
    const userSchema = new mongoose.Schema({
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      roles: { type: [String], default: ['user'] },
      isVerified: { type: Boolean, default: false }
    }, { timestamps: true });

    const User = mongoose.model('User', userSchema, 'users');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log(`User with email "${adminEmail}" already exists.`);
      let updated = false;
      if (!existingAdmin.roles.includes('admin')) {
        existingAdmin.roles.push('admin');
        updated = true;
      }
      if (!existingAdmin.isVerified) {
        existingAdmin.isVerified = true;
        updated = true;
      }
      if (updated) {
        await existingAdmin.save();
        console.log('Existing user updated to verified admin.');
      } else {
        console.log('Existing user is already a verified admin.');
      }
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create admin user
    const admin = new User({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      roles: ['admin', 'user'],
      isVerified: true
    });

    await admin.save();
    console.log('-------------------------------------------');
    console.log('Admin user successfully seeded!');
    console.log(`Email:    ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('-------------------------------------------');

  } catch (error) {
    console.error('Error seeding admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

seedAdmin();
