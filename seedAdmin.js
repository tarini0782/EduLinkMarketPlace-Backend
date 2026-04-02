const mongoose = require('mongoose');
const User = require('./models/User');

const seedAdminUser = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb+srv://dinujanethmal119_db_user:n8ZHGoWOtXU6e1wx@edulink-cluster.qb8qsmb.mongodb.net/?appName=EduLink-Cluster';

    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log('MongoDB Connected!');

    // Check if admin already exists
    let admin = await User.findOne({ email: 'admin@gmail.com' });

    if (admin) {
      console.log('✅ Admin user already exists');
    } else {
      // Create admin user
      admin = await User.create({
        name: 'Admin User',
        email: 'admin@gmail.com',
        password: 'admin12345',
        role: 'admin',
        campus: 'Malabe',
      });
      console.log('✅ Admin user created successfully');
    }

    console.log('\n📌 Admin Credentials:');
    console.log('Email: admin@gmail.com');
    console.log('Password: admin12345');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

seedAdminUser();
