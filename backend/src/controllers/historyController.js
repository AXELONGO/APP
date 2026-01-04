import prisma from '../prisma.js';

export const getHistory = async (req, res) => {
  try {
    const history = await prisma.history.findMany({
      orderBy: { createdAt: 'desc' },
      include: { client: true, lead: true }
    });
    res.json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};

export const addHistory = async (req, res) => {
  try {
    const { title, type, comment, clientId, leadId, agent } = req.body;

    const data = {
      title,
      type,
      comment,
      agent: agent || 'Unknown', // Ideally from auth context
      date: new Date()
    };

    if (clientId) data.clientId = parseInt(clientId);
    if (leadId) data.leadId = parseInt(leadId);

    const newHistory = await prisma.history.create({ data });
    res.json(newHistory);
  } catch (error) {
    console.error('Error adding history:', error);
    res.status(500).json({ error: 'Failed to add history element' });
  }
};
