class OrderController {
    constructor(orderService) {
        this.orderService = orderService;
    }

    async createOrder(req, res) {
        try {
            if (!req.body.tableNumber || !req.body.items || !Array.isArray(req.body.items)) {
                return res.status(400).json({
                    message: 'Invalid order data. Required: tableNumber and items array'
                });
            }

            for (const item of req.body.items) {
                if (!item.menuItemId || !item.quantity || !item.price) {
                    return res.status(400).json({
                        message: 'Each item must have menuItemId, quantity, and price'
                    });
                }
            }

            const order = await this.orderService.createOrder(req.body);
            res.status(201).json(order);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getOrders(req, res) {
        try {
            const filter = {};
            if (req.query.status) {
                filter.status = req.query.status;
            }
            const orders = await this.orderService.getOrders(filter);
            res.json(orders);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getOrder(req, res) {
        try {
            const order = await this.orderService.getOrderById(req.params.id);
            res.json(order);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }

    async updateOrderStatus(req, res) {
        try {
            if (!req.body.status) {
                return res.status(400).json({ message: 'Status is required' });
            }

            const order = await this.orderService.updateOrderStatus(
                req.params.id,
                req.body.status
            );
            res.json(order);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports = OrderController;