import express from 'express';
import { getLeads, createLead, updateLead } from '../controllers/leadsController.js';
import { getClients, createClient } from '../controllers/clientsController.js';
import { getHistory, addHistory } from '../controllers/historyController.js';
import { createSupportTicket, getSupportTickets } from '../controllers/supportController.js';

const router = express.Router();

// Leads
router.get('/leads', getLeads);
router.post('/leads', createLead);
router.put('/leads/:id', updateLead);

// Clients
router.get('/clients', getClients);
router.post('/clients', createClient);

// History
router.get('/history', getHistory);
router.post('/history', addHistory);
// router.get('/clients/history', getHistory); // Should filter by client, but keeping simple for now

// Support
router.get('/support-tickets', getSupportTickets);
router.post('/support-tickets', createSupportTicket);

// AI
// We need to bring the AI controller in. For now, let's keeping it in app.js or moving it here.
// Let's keep it simple and just export this router.

export default router;
