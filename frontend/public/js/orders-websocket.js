class OrdersWebSocket {
    constructor() {
        this.connect();
        this.menuItems = new Map();
        this.loadMenuItems();
    }

    async loadMenuItems() {
        try {
            const response = await fetch('http://localhost:3001/api/menu');
            const items = await response.json();
            items.forEach(item => {
                this.menuItems.set(item._id, item.name);
            });
        } catch (error) {
            console.error('Error loading menu items:', error);
        }
    }

    connect() {
        try {
            this.ws = new WebSocket('ws://localhost:8080');
            this.setupWebSocketListeners();
        } catch (error) {
            console.error('Error in connect():', error);
            setTimeout(() => this.connect(), 1000);
        }
    }

    setupWebSocketListeners() {
        this.ws.onopen = () => console.log('Connected to WebSocket server');
        this.ws.onerror = (error) => console.error('WebSocket error:', error);
        this.ws.onclose = () => {
            console.log('WebSocket connection closed. Attempting to reconnect...');
            setTimeout(() => this.connect(), 1000);
        };

        this.ws.onmessage = async (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'newOrder') {
                    await this.handleNewOrder(data.order);
                } else if (data.type === 'updateOrder') {
                    await this.handleOrderUpdate(data.order);
                }
            } catch (error) {
                console.error('Error processing WebSocket message:', error);
            }
        };
    }

    async handleNewOrder(order) {
        const ordersContainer = document.querySelector('.row');
        if (!ordersContainer) return;

        const orderHtml = this.createOrderHtml(order);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = orderHtml;
        const orderElement = tempDiv.firstElementChild;

        orderElement.style.opacity = '0';
        orderElement.style.transform = 'translateY(20px)';
        orderElement.style.transition = 'opacity 0.5s ease, transform 0.5s ease';

        ordersContainer.insertBefore(orderElement, ordersContainer.firstChild);

        setTimeout(() => {
            orderElement.style.opacity = '1';
            orderElement.style.transform = 'translateY(0)';
        }, 50);

        this.initializeOrderEventListeners(order._id);
    }

    async handleOrderUpdate(order) {
        const orderElement = document.querySelector(`[data-order-id="${order._id}"]`)?.closest('.col-md-6');
        if (!orderElement) return;

        if (order.status === 'served') {
            if (window.location.pathname === '/orders') {
                orderElement.style.opacity = '0';
                orderElement.style.transform = 'translateY(-20px)';

                setTimeout(() => {
                    orderElement.remove();
                    this.reorderRemainingOrders();
                }, 500);
            }
        } else {
            const statusButton = orderElement.querySelector('.dropdown-toggle');
            if (statusButton) {
                statusButton.textContent = order.status;
            }
        }
    }

    reorderRemainingOrders() {
        const orders = document.querySelectorAll('.col-md-6');
        orders.forEach((order, index) => {
            order.style.transition = 'transform 0.5s ease';
            order.style.transform = 'translateY(0)';
        });
    }

    createOrderHtml(order) {
        const orderItems = order.items.map(item => `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <span>${item.quantity}x ${this.menuItems.get(item.menuItemId) || 'Unknown Item'}</span>
                <span>${(item.price * item.quantity).toFixed(2)} zł</span>
            </li>
        `).join('');

        return `
            <div class="col-md-6 mb-4" data-order-id="${order._id}">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">Table #${order.tableNumber}</h5>
                        <div class="dropdown">
                            <button class="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                ${order.status}
                            </button>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item status-change" href="#" data-order-id="${order._id}" data-status="new">New</a></li>
                                <li><a class="dropdown-item status-change" href="#" data-order-id="${order._id}" data-status="preparing">Preparing</a></li>
                                <li><a class="dropdown-item status-change" href="#" data-order-id="${order._id}" data-status="ready">Ready</a></li>
                                <li><a class="dropdown-item status-change" href="#" data-order-id="${order._id}" data-status="served">Served</a></li>
                            </ul>
                        </div>
                    </div>
                    <div class="card-body">
                        <ul class="list-group list-group-flush">
                            ${orderItems}
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
                alert('An error occurred while updating the status');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while updating the status');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new OrdersWebSocket();
});