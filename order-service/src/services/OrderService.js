class OrderService {
    constructor(Order, kafka) {
        this.Order = Order;
        this.kafka = kafka;
    }

    async createOrder(orderData) {
        try {
            const order = new this.Order(orderData);
            await order.save();

            await this.kafka.producer.send({
                topic: 'orders.created',
                messages: [{ value: JSON.stringify(order) }]
            });

            return order;
        } catch (error) {
            throw new Error('Error creating order: ' + error.message);
        }
    }

    async getOrders(filter = {}) {
        if (filter.status && filter.status.includes(',')) {
            filter.status = { $in: filter.status.split(',') };
        }
        return await this.Order.find(filter).sort({ createdAt: -1 });
    }

    async getOrderById(orderId) {
        const order = await this.Order.findById(orderId);
        if(!order) {
            throw new Error('Order not found');
        }
        return order;
    }

    async updateOrderStatus(orderId, status) {
        const validStatuses = ['new', 'preparing', 'ready', 'served', 'cancelled'];
        if (!validStatuses.includes(status)) {
            throw new Error('Invalid status');
        }

        const order = await this.Order.findById(orderId);
        if (!order) {
            throw new Error('Order not found');
        }

        order.status = status;
        await order.save();

        await this.kafka.producer.send({
            topic: 'orders.updated',
            messages: [{ value: JSON.stringify(order) }]
        });

        return order;
    }
}

module.exports = OrderService;