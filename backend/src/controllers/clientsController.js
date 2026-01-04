import prisma from '../prisma.js';

export const getClients = async (req, res) => {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { name: 'asc' },
      include: { history: true, quotes: true }
    });
    res.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
};

export const createClient = async (req, res) => {
  try {
    const { name, email, phone, address, website, tags, clase, agent, status } = req.body;
    const newClient = await prisma.client.create({
      data: {
        name,
        email,
        phone,
        address,
        website,
        tags,
        clase,
        agent: agent || 'Unassigned',
        status: status || 'active'
      }
    });
    res.json(newClient);
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ error: 'Failed to create client' });
  }
};
