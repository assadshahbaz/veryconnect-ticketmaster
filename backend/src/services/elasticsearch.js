const fs = require('fs');
const { Client } = require('@elastic/elasticsearch');

// Initialize Elasticsearch client
// const esClient = new Client({ node: process.env.ELASTICSEARCH_URL });
const esClient = new Client({
    node: process.env.ELASTICSEARCH_URL || 'https://localhost:9200',
    auth: {
        username: process.env.ELASTIC_USERNAME || 'elastic',
        password: process.env.ELASTIC_PASSWORD || 'elastic',
    },
    tls: {
        ca: fs.readFileSync(process.env.ELASTIC_CA_PATH || 'C:/Users/Assad/Downloads/elasticsearch-8.17.0/config/certs/http_ca.crt'),
        rejectUnauthorized: false, // Only for development, disable in production
    },
});

// Elasticsearch service methods
const elasticService = {
    async indexDocument(index, id, body) {
        try {
            return await esClient.index({ index, id, body });
        } catch (err) {
            throw err;
        }
    },
    async searchDocuments(index, query, from = 0, size = 20) {
        try {
            const { hits } = await esClient.search({
                index,
                from,
                size,
                body: { query },
            });
            return hits.hits.map(hit => hit._source); // Extract the `_source` from hits
        } catch (err) {
            console.error('Error searching documents:', err);
            throw err;
        }
    },

    async updateDocument(index, id, body) {
        try {
            return await esClient.update({ index, id, body });
        } catch (err) {
            throw err;
        }
    },

    async deleteDocument(index, id) {
        try {
            return await esClient.delete({ index, id });
        } catch (err) {
            throw err;
        }
    },
};

module.exports = elasticService;
