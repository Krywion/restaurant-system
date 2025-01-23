const WebSocket = require('ws');
const { Kafka } = require('kafkajs');

const kafka = new Kafka({
    clientId: 'restaurant-frontend',
    brokers: ['localhost:9092']
});

const consumer = kafka.consumer({ groupId: 'restaurant-frontend-group' });
const wss = new WebSocket.Server({ port: 8080 });

const clients = new Map();

wss.on('connection', (ws) => {
    const clientId = Date.now();
    clients.set(clientId, ws);

    console.log(`New client connected: ${clientId}`);

    ws.on('close', () => {
        clients.delete(clientId);
        console.log(`Client disconnected: ${clientId}`);
    });
});

const broadcastMessage = (message) => {
    console.log('Broadcasting message:', message);
    clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
};

const runConsumer = async () => {
    console.log('Starting Kafka consumer...');
    await consumer.connect();

    await consumer.subscribe({
        topics: ['orders.created', 'orders.updated']
    });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            try {
                console.log('Received Kafka message:', {
                    topic,
                    value: message.value.toString()
                });

                const order = JSON.parse(message.value.toString());
                let eventType;

                switch (topic) {
                    case 'orders.created':
                        eventType = 'newOrder';
                        break;
                    case 'orders.updated':
                        eventType = 'updateOrder';
                        break;
                    default:
                        console.warn('Unknown topic:', topic);
                        return;
                }

                broadcastMessage({
                    type: eventType,
                    order: order
                });
            } catch (error) {
                console.error('Error processing message:', error);
            }
        },
    });
};

runConsumer().catch(error => {
    console.error('Fatal error in consumer:', error);
    process.exit(1);
});

console.log('WebSocket server is running on port 8080');