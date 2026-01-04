import express from 'express';
import cors from 'cors';
import { Client } from '@notionhq/client';
import dotenv from 'dotenv';
import { OAuth2Client } from 'google-auth-library';
import { readFile } from 'fs/promises';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Notion Client
const notion = new Client({ auth: process.env.NOTION_API_KEY });

// Google Auth
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Load allowed users
// Load allowed users
let allowedUsers = [];
(async () => {
  try {
    const data = await readFile(new URL('./allowed_users.json', import.meta.url));
    allowedUsers = JSON.parse(data);
  } catch (error) {
    console.warn("Could not load allowed_users.json, using empty list or fallback");
    allowedUsers = []; // Should be populated for auth to work properly
  }
})();

// Serve static files from the public directory (Frontend build)
app.use(express.static('public'));

// API Routes should be defined before the catch-all handler
// ... existing API routes ...

// Health Check (Optional - can be kept or removed if covered by index.html)
app.get('/health', (req, res) => {
    res.send('Backend is running');
});


// Routes

// POST /api/auth/google
app.post('/api/auth/google', async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const email = payload.email;

        // Simplify auth check for now if file missing
        if (allowedUsers.length === 0 || allowedUsers.includes(email)) {
             res.json({ success: true, user: { email, name: payload.name, picture: payload.picture } });
        } else {
            res.status(403).json({ error: 'Access Denied', message: 'Email not in allowed list.' });
        }
    } catch (error) {
        console.error("Auth Error:", error);
        res.status(401).json({ error: 'Invalid Token' });
    }
});

// POST /api/ai/generate-leads
app.post('/api/ai/generate-leads', async (req, res) => {
    const { location } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY not configured" });
    }

    const prompt = `
        Generate 3 fictional but realistic business leads located in ${location}.
        Ensure the phone numbers are formatted for the region.
        The category must be one of: 'Transporte', 'Software', 'Consultoría', 'Industrial', or 'Otros'.
        
        Return ONLY a raw JSON array. Do not include markdown formatting like \`\`\`json ... \`\`\`.
        The JSON objects must have this exact structure:
        {
            "name": "string",
            "address": "string",
            "phone": "string",
            "website": "string",
            "category": "string"
        }
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Cleanup markdown if present
        if (text.startsWith("```json")) {
            text = text.replace("```json", "").replace("```", "");
        } else if (text.startsWith("```")) {
            text = text.replace("```", "");
        }

        const leads = JSON.parse(text);
        res.json(leads);

    } catch (error) {
        console.error("Gemini Error:", error);
        res.status(500).json({ error: "Failed to generate leads" });
    }
});

// GET /api/leads
app.get('/api/leads', async (req, res) => {
    const databaseId = process.env.NOTION_DATABASE_ID;

    if (!databaseId) {
        return res.status(500).json({ error: 'Missing NOTION_DATABASE_ID' });
    }

    try {
        let allResults = [];
        let hasMore = true;
        let nextCursor = undefined;

        while (hasMore) {
            const response = await notion.databases.query({
                database_id: databaseId,
                page_size: 100,
                start_cursor: nextCursor,
            });

            allResults = [...allResults, ...response.results];
            hasMore = response.has_more;
            nextCursor = response.next_cursor;
        }

        const cleanLeads = allResults.map(page => {
            const props = page.properties;
            const keys = Object.keys(props);

            const titleKey = keys.find(key => props[key].type === 'title') || 'Name';
            const name = props[titleKey]?.title?.[0]?.plain_text || 'Sin Nombre';

            const addressKey = keys.find(k => /address|direcci|ubicaci/i.test(k));
            const address = addressKey && props[addressKey]?.rich_text?.[0]?.plain_text || 'Dirección no especificada';

            const phoneKey = keys.find(k => /phone|tel/i.test(k));
            const phone = props[phoneKey]?.phone_number || props[phoneKey]?.rich_text?.[0]?.plain_text || '';

            const webKey = keys.find(k => /web|url/i.test(k));
            const website = props[webKey]?.url || '';

            const classKey = keys.find(k => /clase|class/i.test(k));
            let clase = 'C';
            if (classKey) {
                const cProp = props[classKey];
                if (cProp.type === 'select') clase = cProp.select?.name || 'C';
                else if (cProp.type === 'rich_text') clase = cProp.rich_text?.[0]?.plain_text || 'C';
            }

            const agentKey = keys.find(k => /responsable|agent/i.test(k));
            const agent = props[agentKey]?.select?.name || 'Sin Asignar';

            const notionData = {
                claseColName: classKey || 'Clase',
                claseColType: props[classKey]?.type || 'select'
            };

            return {
                id: page.id,
                name,
                address,
                phone,
                website,
                category: 'Otros',
                clase,
                agent,
                isSelected: false,
                isSynced: true,
                notionData
            };
        });

        res.json(cleanLeads);

    } catch (error) {
        console.error("Error fetching leads:", error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/history
app.get('/api/history', async (req, res) => {
    const databaseId = process.env.NOTION_HISTORY_DB_ID;

    if (!databaseId) {
        return res.status(500).json({ error: 'Missing NOTION_HISTORY_DB_ID' });
    }

    try {
        const { startDate, endDate } = req.query;
        const filters = [];

        if (startDate) {
            filters.push({
                timestamp: 'created_time',
                created_time: {
                    on_or_after: startDate
                }
            });
        }

        if (endDate) {
            filters.push({
                timestamp: 'created_time',
                created_time: {
                    on_or_before: endDate
                }
            });
        }

        const query = {
            database_id: databaseId,
            sorts: [{ timestamp: 'created_time', direction: 'descending' }],
            page_size: 100
        };

        if (filters.length > 0) {
            if (filters.length === 1) {
                query.filter = filters[0];
            } else {
                query.filter = {
                    and: filters
                };
            }
        }

        const response = await notion.databases.query(query);

        const cleanHistory = response.results.map(page => {
            const props = page.properties;
            const keys = Object.keys(props);

            const titleKey = keys.find(k => props[k].type === 'title') || 'Asesor';
            const agentName = props[titleKey]?.title?.[0]?.plain_text || 'Sistema';

            const typeKey = keys.find(k => /contacto|prospeccion/i.test(k)) || 'Contacto';
            const typeProp = props[typeKey];
            let title = 'Nota';
            if (typeProp?.rich_text?.length > 0) title = typeProp.rich_text[0].plain_text;
            else if (typeProp?.select) title = typeProp.select.name;

            const descKey = keys.find(k => /comentario|detalle|descri/i.test(k)) || 'Comentario';
            const description = props[descKey]?.rich_text?.[0]?.plain_text || '';

            let clientId = undefined;

            // Strategy 1: Look for explicit 'relation' property
            const explicitClientKey = keys.find(k => /cliente|empresa|lead|relation/i.test(k) && props[k].type === 'relation');
            if (explicitClientKey && props[explicitClientKey].relation.length > 0) {
                clientId = props[explicitClientKey].relation[0].id;
            }

            // Strategy 2: Fallback to ANY relation property
            if (!clientId) {
                for (const key of keys) {
                    if (props[key].type === 'relation' && props[key].relation.length > 0) {
                        clientId = props[key].relation[0].id;
                        break;
                    }
                }
            }

            // Strategy 3: Client Name Fallback
            let clientNameFallback = undefined;
            if (!clientId) {
                const nameKey = keys.find(k => /cliente|empresa|lead/i.test(k));
                if (nameKey) {
                    const prop = props[nameKey];
                    if (prop.type === 'select') clientNameFallback = prop.select?.name;
                    else if (prop.type === 'rich_text') clientNameFallback = prop.rich_text?.[0]?.plain_text;
                    else if (prop.type === 'rollup') {
                        const rollup = prop.rollup;
                         if (rollup.type === 'array') {
                            const firstVal = rollup.array[0];
                            if (firstVal?.type === 'title') clientNameFallback = firstVal.title?.[0]?.plain_text;
                            else if (firstVal?.type === 'rich_text') clientNameFallback = firstVal.rich_text?.[0]?.plain_text;
                            else if (firstVal?.type === 'select') clientNameFallback = firstVal.select?.name;
                        }
                    }
                }
            }

            const dateKey = keys.find(k => /fecha|date/i.test(k));
            const dateStr = props[dateKey]?.date?.start || page.created_time;
            const timestamp = new Date(dateStr).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

            let type = 'note';
            const tLower = title.toLowerCase();
            if (tLower.includes('llamada') || tLower.includes('tel')) type = 'call';
            if (tLower.includes('mail') || tLower.includes('correo') || tLower.includes('what')) type = 'email';

            return {
                id: page.id,
                type,
                title,
                timestamp,
                isoDate: dateStr, 
                description,
                user: { name: agentName, avatarUrl: '' },
                clientId,
                clientName: clientNameFallback, 
                isSynced: true
            };
        });

        res.json(cleanHistory);

    } catch (error) {
        console.error("Error fetching history:", error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/leads
app.post('/api/leads', async (req, res) => {
    const databaseId = process.env.NOTION_DATABASE_ID;
    const lead = req.body;

    if (!databaseId) return res.status(500).json({ error: 'Missing NOTION_DATABASE_ID' });

    const properties = {
        "Name": { title: [{ text: { content: lead.name } }] },
        "Dirección": { rich_text: [{ text: { content: lead.address || "" } }] },
        "Teléfono": { phone_number: lead.phone || null },
        "Website": { url: lead.website || null },
        "Clase": { select: { name: lead.clase || "C" } },
        "Responsable": { select: { name: lead.agent || "Sin Asignar" } }
    };

    try {
        const response = await notion.pages.create({
            parent: { database_id: databaseId },
            properties: properties
        });
        res.json(response);
    } catch (error) {
        console.error("Error creating lead:", error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/history (Add Note)
app.post('/api/history', async (req, res) => {
    const databaseId = process.env.NOTION_HISTORY_DB_ID;
    const { leadId, text, agent, interactionType } = req.body;

    if (!databaseId) return res.status(500).json({ error: 'Missing NOTION_HISTORY_DB_ID' });

    try {
        const db = await notion.databases.retrieve({ database_id: databaseId });
        const props = db.properties;
        const keys = Object.keys(props);

        const titleKey = keys.find(k => props[k].type === 'title') || 'Asesor';
        const relationKey = keys.find(k => props[k].type === 'relation') || 'Cliente';
        const contactKey = keys.find(k => k.toLowerCase().includes('contacto') || k.toLowerCase().includes('prospeccion')) || 'Contacto';
        const commentKey = keys.find(k => /comentario|detalle|descri/i.test(k)) || 'Comentario';
        const dateKey = keys.find(k => /fecha|date/i.test(k)) || 'Fecha';

        const properties = {};
        properties[titleKey] = { title: [{ type: "text", text: { content: agent } }] };

        if (props[relationKey].type === 'relation') {
            properties[relationKey] = { relation: [{ id: leadId }] };
        } else if (props[relationKey].type === 'rich_text' || props[relationKey].type === 'title') {
            // Text Fallback
            try {
                const leadPage = await notion.pages.retrieve({ page_id: leadId });
                const leadProps = leadPage.properties;
                const leadTitleKey = Object.keys(leadProps).find(k => leadProps[k].type === 'title');
                const leadName = leadProps[leadTitleKey]?.title?.[0]?.plain_text || "Cliente Desconocido";

                properties[relationKey] = { rich_text: [{ type: "text", text: { content: leadName } }] };
            } catch (e) {
                console.error("Could not fetch lead name:", e);
                properties[relationKey] = { rich_text: [{ type: "text", text: { content: "ID: " + leadId } }] };
            }
        }

        properties[contactKey] = { rich_text: [{ type: "text", text: { content: interactionType } }] };
        properties[commentKey] = { rich_text: [{ type: "text", text: { content: text } }] };
        if (props[dateKey]) {
            properties[dateKey] = { date: { start: new Date().toISOString() } };
        }

        const response = await notion.pages.create({
            parent: { database_id: databaseId },
            properties: properties
        });

        res.json(response);

    } catch (error) {
        console.error("Error adding history:", error);
        res.status(500).json({ error: error.message });
    }
});

// --- CLIENTS ENDPOINTS ---

// GET /api/clients
app.get('/api/clients', async (req, res) => {
    const databaseId = process.env.NOTION_CLIENTS_DB_ID;

    if (!databaseId) {
        console.warn("NOTION_CLIENTS_DB_ID not set");
        return res.json([]);
    }

    try {
        let allResults = [];
        let hasMore = true;
        let nextCursor = undefined;

        while (hasMore) {
            const response = await notion.databases.query({
                database_id: databaseId,
                page_size: 100,
                start_cursor: nextCursor,
            });

            allResults = [...allResults, ...response.results];
            hasMore = response.has_more;
            nextCursor = response.next_cursor;
        }

        const cleanClients = allResults.map(page => {
            const props = page.properties;
            const keys = Object.keys(props);

            const titleKey = keys.find(key => props[key].type === 'title') || 'Name';
            const name = props[titleKey]?.title?.[0]?.plain_text || 'Sin Nombre';

            const addressKey = keys.find(k => /address|direcci|ubicaci/i.test(k));
            const address = addressKey && props[addressKey]?.rich_text?.[0]?.plain_text || 'Dirección no especificada';

            const phoneKey = keys.find(k => /phone|tel/i.test(k));
            const phone = props[phoneKey]?.phone_number || props[phoneKey]?.rich_text?.[0]?.plain_text || '';

            const webKey = keys.find(k => /web|url/i.test(k));
            const website = props[webKey]?.url || '';

            const classKey = keys.find(k => /clase|class/i.test(k));
            let clase = 'C';
            if (classKey) {
                const cProp = props[classKey];
                if (cProp.type === 'select') clase = cProp.select?.name || 'C';
                else if (cProp.type === 'rich_text') clase = cProp.rich_text?.[0]?.plain_text || 'C';
            }

            const agentKey = keys.find(k => /responsable|agent/i.test(k));
            const agent = props[agentKey]?.select?.name || 'Sin Asignar';

            return {
                id: page.id,
                name,
                address,
                phone,
                website,
                category: 'Cliente',
                clase,
                agent,
                isSelected: false,
                isSynced: true
            };
        });

        res.json(cleanClients);

    } catch (error) {
        console.error("Error fetching clients:", error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/clients
app.post('/api/clients', async (req, res) => {
    const databaseId = process.env.NOTION_CLIENTS_DB_ID;
    const client = req.body;

    if (!databaseId) return res.status(500).json({ error: 'Missing NOTION_CLIENTS_DB_ID' });

    const properties = {
        "Name": { title: [{ text: { content: client.name } }] },
        "Dirección": { rich_text: [{ text: { content: client.address || "" } }] },
        "Teléfono": { phone_number: client.phone || null },
        "Website": { url: client.website || null },
        "Clase": { select: { name: client.clase || "C" } },
        "Responsable": { select: { name: client.agent || "Sin Asignar" } }
    };

    try {
        const response = await notion.pages.create({
            parent: { database_id: databaseId },
            properties: properties
        });
        res.json(response);
    } catch (error) {
        console.error("Error creating client:", error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/clients/history
app.get('/api/clients/history', async (req, res) => {
    const databaseId = process.env.NOTION_CLIENTS_HISTORY_DB_ID;

    if (!databaseId) {
        console.warn("NOTION_CLIENTS_HISTORY_DB_ID not set");
        return res.json([]);
    }

    try {
        const { startDate, endDate } = req.query;
        const filters = [];

        if (startDate) {
            filters.push({
                timestamp: 'created_time',
                created_time: { on_or_after: startDate }
            });
        }
        if (endDate) {
            filters.push({
                timestamp: 'created_time',
                created_time: { on_or_before: endDate }
            });
        }

        const query = {
            database_id: databaseId,
            sorts: [{ timestamp: 'created_time', direction: 'descending' }],
            page_size: 100
        };

        if (filters.length > 0) {
            query.filter = filters.length === 1 ? filters[0] : { and: filters };
        }

        const response = await notion.databases.query(query);

        const cleanHistory = response.results.map(page => {
            const props = page.properties;
            const keys = Object.keys(props);

            const titleKey = keys.find(k => props[k].type === 'title') || 'Asesor';
            const agentName = props[titleKey]?.title?.[0]?.plain_text || 'Sistema';

            const typeKey = keys.find(k => /contacto|prospeccion/i.test(k)) || 'Contacto';
            const typeProp = props[typeKey];
            let title = 'Nota';
            if (typeProp?.rich_text?.length > 0) title = typeProp.rich_text[0].plain_text;
            else if (typeProp?.select) title = typeProp.select.name;

            const descKey = keys.find(k => /comentario|detalle|descri/i.test(k)) || 'Comentario';
            const description = props[descKey]?.rich_text?.[0]?.plain_text || '';

            let clientId = undefined;
            const explicitClientKey = keys.find(k => /cliente|empresa|lead|relation/i.test(k) && props[k].type === 'relation');
            if (explicitClientKey && props[explicitClientKey].relation.length > 0) {
                clientId = props[explicitClientKey].relation[0].id;
            } else {
                 for (const key of keys) {
                    if (props[key].type === 'relation' && props[key].relation.length > 0) {
                        clientId = props[key].relation[0].id;
                        break;
                    }
                }
            }
            
            // Client Name Fallback
            let clientNameFallback = undefined;
            if (!clientId) {
                const nameKey = keys.find(k => /cliente|empresa|lead/i.test(k));
                if (nameKey) {
                    const prop = props[nameKey];
                    if (prop.type === 'select') clientNameFallback = prop.select?.name;
                    else if (prop.type === 'rich_text') clientNameFallback = prop.rich_text?.[0]?.plain_text;
                    else if (prop.type === 'rollup') {
                        const rollup = prop.rollup;
                         if (rollup.type === 'array') {
                            const firstVal = rollup.array[0];
                            if (firstVal?.type === 'title') clientNameFallback = firstVal.title?.[0]?.plain_text;
                            else if (firstVal?.type === 'rich_text') clientNameFallback = firstVal.rich_text?.[0]?.plain_text;
                            else if (firstVal?.type === 'select') clientNameFallback = firstVal.select?.name;
                        }
                    }
                }
            }

            const dateKey = keys.find(k => /fecha|date/i.test(k));
            const dateStr = props[dateKey]?.date?.start || page.created_time;
            const timestamp = new Date(dateStr).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

            let type = 'note';
            const tLower = title.toLowerCase();
            if (tLower.includes('llamada') || tLower.includes('tel')) type = 'call';
            if (tLower.includes('mail') || tLower.includes('correo') || tLower.includes('what')) type = 'email';

            return {
                id: page.id,
                type,
                title,
                timestamp,
                isoDate: dateStr, 
                description,
                user: { name: agentName, avatarUrl: '' },
                clientId,
                clientName: clientNameFallback, 
                isSynced: true
            };
        });

        res.json(cleanHistory);
    } catch (error) {
        console.error("Error fetching clients history:", error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/clients/history
app.post('/api/clients/history', async (req, res) => {
    const databaseId = process.env.NOTION_CLIENTS_HISTORY_DB_ID;
    const { clientId, text, agent, interactionType } = req.body; // clientId here

    if (!databaseId) return res.status(500).json({ error: 'Missing NOTION_CLIENTS_HISTORY_DB_ID' });

    try {
        const db = await notion.databases.retrieve({ database_id: databaseId });
        const props = db.properties;
        const keys = Object.keys(props);

        const titleKey = keys.find(k => props[k].type === 'title') || 'Asesor';
        const relationKey = keys.find(k => props[k].type === 'relation') || 'Cliente';
        const contactKey = keys.find(k => k.toLowerCase().includes('contacto') || k.toLowerCase().includes('prospeccion')) || 'Contacto';
        const commentKey = keys.find(k => /comentario|detalle|descri/i.test(k)) || 'Comentario';
        const dateKey = keys.find(k => /fecha|date/i.test(k)) || 'Fecha';

        const properties = {};
        properties[titleKey] = { title: [{ type: "text", text: { content: agent } }] };

        if (props[relationKey].type === 'relation') {
            properties[relationKey] = { relation: [{ id: clientId }] };
        } else if (props[relationKey].type === 'rich_text' || props[relationKey].type === 'title') {
            try {
                const clientPage = await notion.pages.retrieve({ page_id: clientId });
                const lp = clientPage.properties;
                const ltKey = Object.keys(lp).find(k => lp[k].type === 'title');
                const clientName = lp[ltKey]?.title?.[0]?.plain_text || "Cliente Desconocido";
                properties[relationKey] = { rich_text: [{ type: "text", text: { content: clientName } }] };
            } catch (e) {
                 properties[relationKey] = { rich_text: [{ type: "text", text: { content: "ID: " + clientId } }] };
            }
        }

        properties[contactKey] = { rich_text: [{ type: "text", text: { content: interactionType } }] };
        properties[commentKey] = { rich_text: [{ type: "text", text: { content: text } }] };
        if (props[dateKey]) {
            properties[dateKey] = { date: { start: new Date().toISOString() } };
        }

        const response = await notion.pages.create({
            parent: { database_id: databaseId },
            properties: properties
        });

        res.json(response);
    } catch (error) {
        console.error("Error adding client history:", error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/support-tickets
app.get('/api/support-tickets', async (req, res) => {
    const databaseId = process.env.NOTION_SUPPORT_DB_ID;

    if (!databaseId) {
        console.warn("NOTION_SUPPORT_DB_ID not set");
        return res.json([]);
    }

    try {
        let allResults = [];
        let hasMore = true;
        let nextCursor = undefined;

        while (hasMore) {
            const response = await notion.databases.query({
                database_id: databaseId,
                page_size: 100,
                start_cursor: nextCursor,
                sorts: [{ timestamp: 'created_time', direction: 'descending' }]
            });

            allResults = [...allResults, ...response.results];
            hasMore = response.has_more;
            nextCursor = response.next_cursor;
        }

        const processedTickets = allResults.map(page => {
            const props = page.properties;
            const keys = Object.keys(props);

            let title = "Sin Título";
            if (props["Name"]?.title) title = props["Name"].title[0]?.plain_text || "Sin Título";
            else if (props["Ticket"]?.title) title = props["Ticket"].title[0]?.plain_text || "Sin Título";
            else {
                // Fallback attempt
                const titleKey = keys.find(k => props[k].type === 'title');
                if (titleKey) title = props[titleKey].title[0]?.plain_text || "Sin Título";
            }

            let status = "Abierto";
            if (props["Status"]?.select) status = props["Status"].select.name;
            else if (props["Estado"]?.select) status = props["Estado"].select.name;

            return {
                id: page.id,
                title,
                status,
                url: page.url,
                last_edited: page.last_edited_time
            };
        });

        res.json(processedTickets);

    } catch (error) {
         console.error("Error fetching support tickets:", error);
         // Return empty if failure
         res.json([]);
    }
});

// Fallback to index.html for SPA routing (must be last)
import path from 'path';
app.get('*', (req, res) => {
    // Only serve index.html for GET requests that accept HTML
    if (req.accepts('html')) {
        res.sendFile(path.resolve('public', 'index.html'));
    } else {
        res.status(404).json({ error: 'Not found' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
