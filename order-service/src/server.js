require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Kafka } = require('kafkajs');

const Order = require('./models/Order');
const OrderService = require('./services/OrderService');
const OrderController = require('./controllers/OrderController');
const createOrderRoutes = require('./routes/orderRoutes');

const app = express();

app.use(cors());
app.use(express.json());

console.log(process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

const kafka = new Kafka({
    clientId: 'order-service',
    brokers: ['localhost:9092']
});

const producer = kafka.producer();
producer.connect()
    .then(() => console.log('Connected to Kafka'))
    .catch((err) => console.error('Kafka connection error:', err));

const kafkaWrapper = {producer};
const orderService = new OrderService(Order, kafkaWrapper);
const orderController = new OrderController(orderService);

app.use('/api/orders', createOrderRoutes(orderController));

app.get('/api/health', (req, res) => {
    res.json({ status: 'Order service is running' });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Order service running on port ${PORT}`);
});