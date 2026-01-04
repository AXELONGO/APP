import prisma from '../prisma.js';


export const getSchema = async (req, res) => {
    // This was used for Notion properties, might not be needed or returns empty for now
    res.json({}); 
};

export const getSupportTickets = async (req, res) => {
    try {
        const tickets = await prisma.history.findMany({
            where: {
                OR: [
                    { type: 'Support' },
                    { title: { contains: 'Support Ticket' } }
                ]
            },
            orderBy: { createdAt: 'desc' },

        });
        res.json(tickets);
    } catch (error) {
        console.error('Error fetching support tickets:', error);
        res.status(500).json({ error: 'Failed to fetch support tickets' });
    }
};

export const createSupportTicket = async (req, res) => {
    // Placeholder for support tickets if we add a model later
    // For now, maybe just log it or save to history
    const { title, description, priority, clientId } = req.body;
    console.log('Support Ticket created:', { title, description, priority, clientId });
    
    // Ideally we would have a Ticket model, but user didn't explicitly ask for it in the DB schema prompt
    // They asked for Client, Lead, History, Quote.
    // I will add a History item to represent this ticket for now.
    
    try {
        if (clientId) {
            await prisma.history.create({
                data: {
                    title: `Support Ticket: ${title}`,
                    type: 'Support',
                    comment: `Priority: ${priority}\n${description}`,
                    clientId: parseInt(clientId),
                    date: new Date()
                }
            });
        }
        res.json({ message: 'Support ticket logged as history' });
    } catch (error) {
         console.error('Error creating support ticket:', error);
         res.status(500).json({ error: 'Failed to create ticket' });
    }
};

