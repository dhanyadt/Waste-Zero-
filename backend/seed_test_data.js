const mongoose = require('mongoose');
const User = require('./models/User');
const Opportunity = require('./models/Opportunity');
const Message = require('./models/Message');
const bcrypt = require('bcrypt');
require('dotenv').config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    // Clean up
    await User.deleteMany({});
    await Opportunity.deleteMany({});
    await Message.deleteMany({});

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('Password123!', salt);

    // Create Admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: password,
      role: 'admin',
      status: 'ACTIVE'
    });

    // Create Volunteers
    const v1 = await User.create({ name: 'Volunteer 1', email: 'v1@test.com', password: password, role: 'volunteer', status: 'ACTIVE' });
    const v2 = await User.create({ name: 'Volunteer 2', email: 'v2@test.com', password: password, role: 'volunteer', status: 'ACTIVE' });
    const v3 = await User.create({ name: 'Volunteer 3', email: 'v3@test.com', password: password, role: 'volunteer', status: 'SUSPENDED' });

    // Create NGO
    const ngo = await User.create({ name: 'NGO 1', email: 'ngo@test.com', password: password, role: 'ngo', status: 'ACTIVE' });

    // Create Opportunities
    const op1 = await Opportunity.create({
      title: 'Cleanup Park',
      description: 'Help clean the park',
      requiredSkills: ['Cleaning'],
      duration: '4 hours',
      location: 'New York',
      createdBy: ngo._id,
      createdByType: 'ngo',
      ngo: ngo._id
    });

    const op2 = await Opportunity.create({
      title: 'Beach Cleanup',
      description: 'Help clean the beach',
      requiredSkills: ['Cleaning'],
      duration: '5 hours',
      location: 'California',
      createdBy: ngo._id,
      createdByType: 'ngo',
      ngo: ngo._id
    });

    // Create Messages
    await Message.create({ sender_id: v1._id, receiver_id: ngo._id, content: 'Hello NGO' });
    await Message.create({ sender_id: v1._id, receiver_id: ngo._id, content: 'When can I start?' });
    await Message.create({ sender_id: v2._id, receiver_id: ngo._id, content: 'Interested in cleaning' });

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();
