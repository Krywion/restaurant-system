const express = require('express');
const router = express.Router();

function createOrderRoutes(orderController) {
    router.get('/', orderController.getOrders.bind(orderController));

    router.get('/:id', orderController.getOrder.bind(orderController));

    router.post('/', orderController.createOrder.bind(orderController));

    router.patch('/:id/status', orderController.updateOrderStatus.bind(orderController));

    return router;
}

module.exports = createOrderRoutes;