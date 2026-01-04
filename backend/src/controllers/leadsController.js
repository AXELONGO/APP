import prisma from '../prisma.js';

export const getLeads = async (req, res) => {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      include: { history: true }
    });
    res.json(leads);
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
};


export const createLead = async (req, res) => {
  try {
    const { name, phone = '', address = '', website = '', clase = 'C', agent = 'AI' } = req.body;
    const newLead = await prisma.lead.create({
      data: {
        name,
        phone,
        address,
        website,
        clase,
        agent,
        status: 'new'
      }
    });
    res.json(newLead);
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({ error: 'Failed to create lead' });
  }
};

export const updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const { clase, status, name, phone, address, website, agent } = req.body;
    
    // Construct update data dynamically
    const updateData = {};
    if (clase !== undefined) updateData.clase = clase;
    if (status !== undefined) updateData.status = status;
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (website !== undefined) updateData.website = website;
    if (agent !== undefined) updateData.agent = agent;

    const updatedLead = await prisma.lead.update({
      where: { id: parseInt(id) },
      data: updateData
    });
    res.json(updatedLead);
  } catch (error) {
    console.error('Error updating lead:', error);
    res.status(500).json({ error: 'Failed to update lead' });
  }
};

