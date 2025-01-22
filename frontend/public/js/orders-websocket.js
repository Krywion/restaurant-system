console.log('Orders WebSocket Script loaded!');

class OrdersWebSocket {
    constructor() {
        console.log('OrdersWebSocket class initialized');
        this.connect();
        this.setupDebugListeners();
    }

    connect() {
        console.log('Attempting to connect to WebSocket...');
        try {
            this.ws = new WebSocket('ws://localhost:8080');
            this.setupWebSocketListeners();
        } catch (error) {
            console.error('Error in connect():', error);
            setTimeout(() => this.connect(), 1000);
        }
    }

    setupWebSocketListeners() {
        this.ws.onopen = () => {
            console.log('Successfully connected to WebSocket server');
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        this.ws.onmessage = (event) => {
            console.log('Raw WebSocket message received:', event.data);
            try {
                const data = JSON.parse(event.data);
                console.log('Parsed WebSocket message:', data);

                if (data.type === 'newOrder') {
                    console.log('Handling new order:', data.order);
                    this.handleNewOrder(data.order);
                } else if (data.type === 'updateOrder') {
                    console.log('Handling order update:', data.order);
                    this.handleOrderUpdate(data.order);
                }
            } catch (error) {
                console.error('Error processing WebSocket message:', error);
            }
        };

        this.ws.onclose = () => {
            console.log('WebSocket connection closed. Attempting to reconnect...');
            setTimeout(() => this.connect(), 1000);
        };
    }

    setupDebugListeners() {
        const ordersContainer = document.querySelector('.row');
        if (ordersContainer) {
            const observer = new MutationObserver((mutations) => {
                console.log('DOM changes detected:', mutations);
            });

            observer.observe(ordersContainer, {
                childList: true,
                subtree: true
            });
        }
    }

    handleNewOrder(order) {
        console.log('Starting handleNewOrder for:', order);
        const ordersContainer = document.querySelector('.row');

        if (!ordersContainer) {
            console.error('Orders container not found!');
            return;
        }

        console.log('Creating new order HTML');
        const orderHtml = this.createOrderHtml(order);

        console.log('Inserting new order into DOM');
        ordersContainer.insertAdjacentHTML('afterbegin', orderHtml);

        console.log('Initializing event listeners for new order');
        this.initializeOrderEventListeners(order._id);
    }

    handleOrderUpdate(order) {
        console.log('Starting handleOrderUpdate for:', order);
        const orderElement = document.querySelector(`[data-order-id="${order._id}"]`)
            ?.closest('.card');

        if (orderElement) {
            const statusButton = orderElement.querySelector('.dropdown-toggle');
            if (statusButton) {
                statusButton.textContent = order.status;
            }

            const totalAmount = orderElement.querySelector('.total-amount');
            if (totalAmount) {
                totalAmount.textContent = `${order.totalAmount.toFixed(2)} zł`;
            }
        } else {
            console.log('Order element not found for update, ID:', order._id);
        }
    }

    createOrderHtml(order) {
        return `
            <div class="col-md-6 mb-4">
                <div class="card" data-order-id="${order._id}">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">Table #${order.tableNumber}</h5>
                        <div class="dropdown">
                            <button class="btn btn-outline-secondary dropdown-toggle"
                                    type="button"
                                    data-bs-toggle="dropdown">
                                ${order.status}
                            </button>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item status-change"
                                       href="#"
                                       data-order-id="${order._id}"
                                       data-status="new">New</a></li>
                                <li><a class="dropdown-item status-change"
                                       href="#"
                                       data-order-id="${order._id}"
                                       data-status="preparing">Preparing</a></li>
                                <li><a class="dropdown-item status-change"
                                       href="#"
                                       data-order-id="${order._id}"
                                       data-status="ready">Ready</a></li>
                                <li><a class="dropdown-item status-change"
                                       href="#"
                                       data-order-id="${order._id}"
                                       data-status="served">Served</a></li>
                            </ul>
                        </div>
                    </div>
                    <div class="card-body">
                        <ul class="list-group list-group-flush">
                            ${order.items.map(item => `
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    <span>${item.quantity}x ${item.menuItemId}</span>
                                    <span>${(item.price * item.quantity).toFixed(2)} zł</span>
                                </li>
                            `).join('')}
                        </ul>
                        ${order.notes ? `
                            <div class="mt-3">
                                <strong>Notes:</strong>
                                <p class="mb-0">${order.notes}</p>
                            </div>
                        ` : ''}
                        <div class="mt-3">
                            <strong>Total:</strong> <span class="total-amount">${order.totalAmount.toFixed(2)} zł</span>
                        </div>
                    </div>
                    <div class="card-footer text-muted">
                        Submitted: ${new Date(order.createdAt).toLocaleString()}
                    </div>
                </div>
            </div>
        `;
    }

    initializeOrderEventListeners(orderId) {
        console.log('Initializing listeners for order:', orderId);
        const orderCard = document.querySelector(`[data-order-id="${orderId}"]`);
        if (orderCard) {
            orderCard.querySelectorAll('.status-change').forEach(link => {
                link.addEventListener('click', this.handleStatusChange);
            });
        }
    }

    handleStatusChange = async function(e) {
        e.preventDefault();
        const orderId = this.dataset.orderId;
        const newStatus = this.dataset.status;

        try {
            const response = await fetch(`http://localhost:3002/api/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                console.error('Error updating status:', response);
                alert('An error occurred while updating the status');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while updating the status');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded - initializing OrdersWebSocket');
    new OrdersWebSocket();
});