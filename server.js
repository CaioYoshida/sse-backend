const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');


const PORT = process.env.PORT || 5001;

// Middleware to parse JSON requests
app.use(cors());
app.use(bodyParser.json());

// Store listeners (clients) to notify when a webhook is received
let clients = [];

// SSE endpoint for clients to connect and receive updates
app.get('/events', (req, res) => {
    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send an initial message to confirm the connection
    res.write('event: connect\ndata: connected\n\n');

    // Save client response stream
    const clientId = Date.now();
    const newClient = {
        id: clientId,
        res
    };
    clients.push(newClient);

    // Remove client when the connection is closed
    req.on('close', () => {
        console.log(`${clientId} Connection closed`);
        clients = clients.filter(client => client.id !== clientId);
    });
});

// Webhook endpoint to receive events
app.post('/webhook', (req, res) => {
    const data = req.body;
    console.log('Received webhook:', data);

    // Notify all connected clients
    setTimeout(() => {
        clients.forEach(client => client.res.write(`data: ${JSON.stringify(data)}\n\n`));
    }, 5000);

    res.sendStatus(200);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
