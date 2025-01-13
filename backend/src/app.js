const express = require('express');
const bodyParser = require('body-parser');
const ticketRoutes = require('./routes/tickets');
const connectToMongoDB = require('./db/mongo');
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./swagger');

require('dotenv').config();

// Initialize Express app
const app = express();

// Middleware
app.use(bodyParser.json());

// Initialize MongoDB connection pool
connectToMongoDB().then(connection => {
    app.locals.dbConnection = connection; // Attach connection to app.locals
}).catch(err => {
    console.error('Failed to initialize MongoDB connection:', err);
    process.exit(1);
});

// Swagger documentation route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use('/api/tickets', ticketRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
