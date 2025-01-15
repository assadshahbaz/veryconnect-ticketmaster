const express = require('express');
const getTicketModel = require('../models/Ticket');
const elasticService = require('../services/elasticsearch');

const router = express.Router();

// Middleware to get MongoDB connection and Ticket model
const getMongoConnection = (req) => req.app.locals.dbConnection;

/**
 * @swagger
 * components:
 *   schemas:
 *     Ticket:
 *       type: object
 *       required:
 *         - sorting_id
 *         - name
 *       properties:
 *         sorting_id:
 *           type: number
 *           description: The auto-generated ID of the ticket
 *         name:
 *           type: string
 *           description: The name of the ticket
 *       example:
 *         sorting_id: 1
 *         name: "Sample Ticket"
 */

/**
 * @swagger
 * /api/tickets:
 *   post:
 *     summary: Create a new ticket
 *     tags: [Tickets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the ticket
 *             example:
 *               name: "Sample Ticket"
 *     responses:
 *       201:
 *         description: Ticket successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sorting_id:
 *                   type: integer
 *                   description: Auto-incremented ID of the ticket
 *                   example: 1
 *                 name:
 *                   type: string
 *                   description: Name of the ticket
 *                   example: "Sample Ticket"
 *                 _id:
 *                   type: string
 *                   description: MongoDB ObjectID
 *                   example: "63be60b0a5f12e34db7e94d8"
 *                 __v:
 *                   type: integer
 *                   description: MongoDB version key
 *                   example: 0
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: "Failed to create ticket"
 */

// Create a new ticket
router.post('/', async (req, res) => {
    try {
        const db = getMongoConnection(req);
        const Ticket = getTicketModel(db);

        const lastTicket = await Ticket.findOne().sort({ sorting_id: -1 }); 
        const nextId = lastTicket ? lastTicket.sorting_id + 1 : 1;
        
        const { name } = req.body;
        const post = { sorting_id: nextId, id: nextId, name: name }
        console.log(post);
        
        const ticket = new Ticket(post);
        await ticket.save();

        // Index ticket in Elasticsearch
        // await elasticService.indexDocument('tickets', ticket._id.toString(), { sorting_id: nextId, name });

        res.status(201).json(ticket);
    } catch (err) {
        console.error('Error creating ticket:', err);
        res.status(500).json({ error: 'Failed to create ticket' });
    }
});

/**
 * @swagger
 * /api/tickets:
 *   get:
 *     summary: Retrieve a list of tickets
 *     tags: [Tickets]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Page size
 *     responses:
 *       200:
 *         description: A list of tickets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ticket'
 *       500:
 *         description: Some server error
 */
// Retrieve tickets with optional search
router.get('/', async (req, res) => {
    try {
        const { search, page = 1, limit = 20 } = req.query;
        const db = getMongoConnection(req);
        const Ticket = getTicketModel(db);

        if (search && search.length >= 3) {
            const results = await elasticService.searchDocuments('tickets', {
                match: { name: { query: search, fuzziness: 'AUTO' } },
            });
            res.json(results);
        } else {
            const tickets = await Ticket.find()
                .sort({ sorting_id: 1 })
                .skip((page - 1) * limit)
                .limit(Number(limit));
            res.json(tickets);
        }
    } catch (err) {
        console.error('Error retrieving tickets:', err);
        res.status(500).json({ error: 'Failed to retrieve tickets' });
    }
});

/**
 * @swagger
 * /api/tickets/{id}:
 *   get:
 *     summary: Get details of a ticket
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB ObjectID of the ticket
 *         example: "63be60b0a5f12e34db7e94d8"
 *     responses:
 *       200:
 *         description: Details of the ticket
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: Auto-incremented ID of the ticket
 *                   example: 1
 *                 name:
 *                   type: string
 *                   description: Name of the ticket
 *                   example: "Sample Ticket"
 *                 _id:
 *                   type: string
 *                   description: MongoDB ObjectID
 *                   example: "63be60b0a5f12e34db7e94d8"
 *                 __v:
 *                   type: integer
 *                   description: MongoDB version key
 *                   example: 0
 *       404:
 *         description: Ticket not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: "Ticket not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: "Failed to fetch ticket details"
 */

// Get details of a single ticket
router.get('/:id', async (req, res) => {
    try {
        const _id = req.params.id; // MongoDB ObjectID
        const db = getMongoConnection(req);
        const Ticket = getTicketModel(db);

        const ticket = await Ticket.findOne({ _id });

        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        res.status(200).json(ticket);
    } catch (err) {
        console.error('Error fetching ticket details:', err);
        res.status(500).json({ error: 'Failed to fetch ticket details' });
    }
});

/**
 * @swagger
 * /api/tickets/{id}:
 *   put:
 *     summary: Update a ticket
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           description: The MongoDB ObjectID of the ticket
 *           example: "63be60b0a5f12e34db7e94d8"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: The updated name of the ticket
 *             example:
 *               name: "Updated Ticket Name"
 *     responses:
 *       200:
 *         description: Ticket successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sorting_id:
 *                   type: integer
 *                   description: Auto-incremented ID of the ticket
 *                   example: 1
 *                 name:
 *                   type: string
 *                   description: Updated name of the ticket
 *                   example: "Updated Ticket Name"
 *                 _id:
 *                   type: string
 *                   description: MongoDB ObjectID
 *                   example: "63be60b0a5f12e34db7e94d8"
 *                 __v:
 *                   type: integer
 *                   description: MongoDB version key
 *                   example: 0
 *       404:
 *         description: Ticket not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: "Ticket not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: "Failed to update ticket"
 */

// Update a ticket
router.put('/:id', async (req, res) => {
    try {
        const _id = req.params.id;
        const { name } = req.body;
        const db = getMongoConnection(req);
        const Ticket = getTicketModel(db);

        const ticket = await Ticket.findOneAndUpdate({ _id }, { name }, { new: true });

        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        // Update Elasticsearch document
        await elasticService.updateDocument('tickets', _id, { doc: { name } });

        res.json(ticket);
    } catch (err) {
        console.error('Error updating ticket:', err);
        res.status(500).json({ error: 'Failed to update ticket' });
    }
});

/**
 * @swagger
 * /api/tickets/{id}:
 *   delete:
 *     summary: Delete a ticket
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the ticket to delete
 *     responses:
 *       200:
 *         description: The ticket was successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   description: Confirmation message
 *                   example: Ticket deleted
 *       404:
 *         description: Ticket not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: Ticket not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: Failed to delete ticket
 */

// Delete a ticket
router.delete('/:id', async (req, res) => {
    try {
        const _id = req.params.id;
        const db = getMongoConnection(req);
        const Ticket = getTicketModel(db);

        const ticket = await Ticket.findOneAndDelete({ _id });

        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        // Remove Elasticsearch document
        await elasticService.deleteDocument('tickets', _id);

        res.status(200).send({ msg: 'Ticket deleted' });
    } catch (err) {
        console.error('Error deleting ticket:', err);
        res.status(500).json({ error: 'Failed to delete ticket' });
    }
});

module.exports = router;
