const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const findAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const roles = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);
        console.log('Roles found:', roles);
        const admin = await User.findOne({ role: 'admin' });
        console.log('Admin user:', admin?.email);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

findAdmin();
