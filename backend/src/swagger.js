const swaggerJsDoc = require('swagger-jsdoc');

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Ticketmaster API',
            version: '1.0.0',
            description: 'API documentation for the Ticketmaster app',
        },
        servers: [
            {
                url: 'http://localhost:3000', // Update with your server URL
            },
        ],
    },
    apis: ['./src/routes/*.js'], // Path to the route files
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = swaggerDocs;
