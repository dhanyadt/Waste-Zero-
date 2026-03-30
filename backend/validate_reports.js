const mongoose = require('mongoose');
const User = require('./models/User');
const Opportunity = require('./models/Opportunity');
const Message = require('./models/Message');
const AuditLog = require('./models/AuditLog');
const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = 'http://localhost:5000/api'; // Assuming the server is running

const validate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // Step 1: Login
        console.log('STEP 1: AUTHENTICATION');
        let adminToken, volunteerToken;
        try {
            const adminLogin = await axios.post(`${API_BASE_URL}/auth/login`, {
                email: 'admin@test.com',
                password: 'Password123!'
            });
            adminToken = adminLogin.data.token;
            console.log('Admin Login PASS');

            const volunteerLogin = await axios.post(`${API_BASE_URL}/auth/login`, {
                email: 'v1@test.com',
                password: 'Password123!'
            });
            volunteerToken = volunteerLogin.data.token;
            console.log('Volunteer Login PASS');
        } catch (e) {
            console.error('Login FAIL. Is server running at port 5000?', e.message);
            process.exit(1);
        }

        const headers = { Authorization: `Bearer ${adminToken}` };

        // Step 2: Reports API
        console.log('STEP 2: TEST REPORTS API');
        const reportsRes = await axios.get(`${API_BASE_URL}/admin/reports`, { headers });
        if (reportsRes.data.success && reportsRes.data.reports) {
            console.log('Reports API structure PASS');
        } else {
            console.log('Reports API structure FAIL');
        }

        // Step 3-5: Validation
        const reports = reportsRes.data.reports;
        console.log('STEP 3: TEST USER STATS');
        console.log('Users stats found:', JSON.stringify(reports.users));
        if (reports.users.totalUsers === 5) console.log('Total Users count PASS');
        else console.log('Total Users count FAIL');

        if (reports.users.activeUsers === 4) console.log('Active Users count PASS');
        else console.log('Active Users count FAIL');

        if (reports.users.suspendedUsers === 1) console.log('Suspended Users count PASS');
        else console.log('Suspended Users count FAIL');

        if (reports.users.roles.volunteers === 3 && reports.users.roles.ngo === 1 && reports.users.roles.admin === 1) console.log('Role counts PASS');
        else console.log('Role counts FAIL');

        console.log('STEP 4: TEST OPPORTUNITY STATS');
        console.log('Opportunity stats found:', JSON.stringify(reports.opportunities));
        if (reports.opportunities.totalOpportunities === 2) console.log('Total Opportunity count PASS');
        else console.log('Total Opportunity count FAIL');

        console.log('STEP 5: TEST MESSAGE METRICS');
        console.log('Message metrics found:', JSON.stringify(reports.messages));
        if (reports.messages.totalMessages === 3) console.log('Total Message count PASS');
        else console.log('Total Message count FAIL');

        // Step 6: Date range filter test
        console.log('STEP 6: DATE FILTER TEST');
        const nextYear = new Date().getFullYear() + 1;
        const filteredRes = await axios.get(`${API_BASE_URL}/admin/reports?startDate=${nextYear}-01-01`, { headers });
        if (filteredRes.data.reports.users.totalUsers === 0) console.log('Date filter (no results) PASS');
        else console.log('Date filter (no results) FAIL');

        // Step 7: Invalid date test
        console.log('STEP 7: INVALID DATE TEST');
        try {
            await axios.get(`${API_BASE_URL}/admin/reports?startDate=abc`, { headers });
            console.log('Invalid date PASS (didn\'t crash)');
        } catch (e) {
            console.log('Invalid date FAIL (crashed)');
        }

        // Step 8: Security test
        console.log('STEP 8: SECURITY TEST');
        try {
            await axios.get(`${API_BASE_URL}/admin/reports`, { headers: { Authorization: `Bearer ${volunteerToken}` } });
            console.log('Security test FAIL (Volunteer accessed reports)');
        } catch (e) {
            if (e.response && (e.response.status === 403 || e.response.status === 401)) console.log('Security test PASS (Volunteer rejected)');
            else console.log('Security test FAIL', e.message);
        }

        // Step 9: Admin Log Validation
        console.log('STEP 9: ADMIN LOG VALIDATION');
        const userToSuspend = await User.findOne({ email: 'v1@test.com' });
        await axios.patch(`${API_BASE_URL}/admin/users/${userToSuspend._id}/status`, { status: 'SUSPENDED' }, { headers });
        console.log('Performed user suspension for logging test');

        const lastLog = await AuditLog.findOne().sort({ createdAt: -1 });
        console.log('Last Log structure:', JSON.stringify(lastLog, null, 2));

        if (lastLog.action === 'USER_SUSPENDED' && lastLog.targetId.toString() === userToSuspend._id.toString()) {
            console.log('Audit Log target & action PASS');
            // Check for new fields
            if (lastLog.adminId && lastLog.timestamp) {
                console.log('Enhanced logs fields (adminId, timestamp) PASS');
            } else {
                console.log('Enhanced logs fields FAIL');
            }
        }

        process.exit(0);
    } catch (e) {
        console.error('Validation script error:', e);
        process.exit(1);
    }
};

validate();
