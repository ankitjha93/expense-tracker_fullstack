const mongoose = require('mongoose');
const dns = require('dns');

// Fix for Node.js querySrv ECONNREFUSED on Windows with MongoDB Atlas
try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
    // ignore if not supported
}

const db = async () => {
    try {
        mongoose.set('strictQuery', false);
        await mongoose.connect(process.env.MONGO_URL);
        console.log('DB Connected');
    } catch (error) {
        console.log('DB Connection Error:', error.message);
    }
};

module.exports = { db };