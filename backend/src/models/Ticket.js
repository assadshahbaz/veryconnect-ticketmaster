const mongoose = require('mongoose');

// Define the Ticket schema
const ticketSchema = new mongoose.Schema({
    sorting_id: { type: Number, required: true, unique: true },
    name: { type: String, required: true }
});

// Create and export the model
module.exports = (connection) => connection.model('Ticket', ticketSchema);
