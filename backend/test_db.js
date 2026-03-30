const mongoose = require('mongoose');
const User = require('./models/User');
const Opportunity = require('./models/Opportunity');
const Message = require('./models/Message');
const AuditLog = require('./models/AuditLog');
require('dotenv').config();

const runTests = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const admin = await User.findOne({ role: 'admin' });
        const volunteer = await User.findOne({ role: 'volunteer' });
        const ngo = await User.findOne({ role: 'ngo' });
        const countUsers = await User.countDocuments();
        const countOps = await Opportunity.countDocuments();
        const countMsgs = await Message.countDocuments();

        console.log(JSON.stringify({
            adminId: admin?._id,
            adminEmail: admin?.email,
            volunteerId: volunteer?._id,
            volunteerEmail: volunteer?.email,
            ngoId: ngo?._id,
            counts: { users: countUsers, ops: countOps, msgs: countMsgs }
        }, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

runTests();
