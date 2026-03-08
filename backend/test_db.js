const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URI;

async function test() {
    console.log('Testing connection to:', uri);
    try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log('SUCCESS: Connected to MongoDB');
        const User = require('./models/User');
        const count = await User.countDocuments();
        console.log('User count:', count);
        process.exit(0);
    } catch (err) {
        console.error('FAILURE:', err.message);
        process.exit(1);
    }
}

test();
