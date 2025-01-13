const mongoose = require('mongoose');
require('dotenv').config();

const mongoOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
    minPoolSize: 5,
};

// Create and export a pooled connection
const connectToMongoDB = async () => {
    try {
        const connection = await mongoose.createConnection(process.env.MONGO_URI, mongoOptions).asPromise();
        console.log('Connected to MongoDB with a connection pool');
        return connection;
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1); // Exit if connection fails
    }
};

module.exports = connectToMongoDB;
