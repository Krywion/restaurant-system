# Restaurant Management System

A modern, microservices-based restaurant management system built with Node.js, Express, MongoDB, and Kafka. The system allows restaurants to manage their menu, handle orders in real-time, and track order status through a user-friendly web interface.

## Features

- **Menu Management**: Create, update, and delete menu items
- **Real-time Order Processing**: Place and track orders in real-time
- **Order Status Updates**: Live updates of order status changes
- **Order History**: Track completed orders
- **WebSocket Integration**: Real-time updates for order status changes

## Architecture

Below is a high-level architecture diagram of the system:

```mermaid
flowchart TD
    Client[Web Browser]
    
    subgraph Frontend[Frontend Service :3000]
        WebUI[Web Interface]
        WS[WebSocket Server :8080]
    end
    
    subgraph MenuService[Menu Service :3001]
        MenuAPI[REST API]
        MenuDB[(MongoDB)]
    end
    
    subgraph OrderService[Order Service :3002]
        OrderAPI[REST API]
        OrderDB[(MongoDB)]
    end
    
    subgraph MessageBroker[Message Broker]
        Kafka[Apache Kafka]
        ZK[Zookeeper]
    end
    
    Client <--> WebUI
    Client <-.->|WebSocket| WS
    
    WebUI --> MenuAPI
    WebUI --> OrderAPI
    
    MenuAPI --> MenuDB
    OrderAPI --> OrderDB
    
    OrderAPI --> Kafka
    WS <-- Subscribe --> Kafka
    Kafka <--> ZK

    style Client fill:#f9f,stroke:#333,stroke-width:2px
    style Frontend fill:#bbf,stroke:#333,stroke-width:2px
    style MenuService fill:#bfb,stroke:#333,stroke-width:2px
    style OrderService fill:#fbf,stroke:#333,stroke-width:2px
    style MessageBroker fill:#ffb,stroke:#333,stroke-width:2px
```

The system consists of three main microservices:

1. **Frontend Service (Port 3000)**
   - Handles the web interface
   - Communicates with other services via REST APIs
   - Provides real-time updates using WebSocket
   - Built with Express.js and EJS templates

2. **Menu Service (Port 3001)**
   - Manages menu items
   - Provides CRUD operations for menu management
   - Uses MongoDB for data storage

3. **Order Service (Port 3002)**
   - Handles order processing
   - Manages order status updates
   - Uses Kafka for event messaging
   - Uses MongoDB for data storage

## Tech Stack

- **Backend**: Node.js, Express.js
- **Frontend**: EJS, Bootstrap 5
- **Database**: MongoDB
- **Message Broker**: Apache Kafka
- **Real-time Communication**: WebSocket
- **Container Platform**: Docker

## Prerequisites

- Node.js (v14 or higher)
- Docker and Docker Compose

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd restaurant-system
```

2. Set up environment variables:
Create `.env` files in each service directory with the following variables:

Root Folder (.env):
```
DB_USERNAME=username
DB_PASSWORD=password

```

Frontend Service (.env):
```
PORT=3000
MENU_SERVICE_URL=http://localhost:3001
ORDER_SERVICE_URL=http://localhost:3002
```

Menu Service (.env):
```
PORT=3001
MONGODB_URI=mongodb://username:password@localhost:27017/restaurant_menu
```

Order Service (.env):
```
PORT=3002
MONGODB_URI=mongodb://username:password@localhost:27017/restaurant_orders
```

3. Start the infrastructure services using Docker Compose:
```bash
docker-compose up -d
```

4. Install dependencies and start each service:

```bash
# Frontend Service
cd frontend
npm install
npm run start:all

# Menu Service
cd menu-service
npm install
node src/server.js

# Order Service
cd order-service
npm install
node src/server.js
```

## API Endpoints

### Menu Service
- `GET /api/menu` - Get all menu items
- `GET /api/menu/:id` - Get specific menu item
- `POST /api/menu` - Create new menu item
- `PUT /api/menu/:id` - Update menu item
- `DELETE /api/menu/:id` - Delete menu item

### Order Service
- `GET /api/orders` - Get all orders (query param: status)
- `GET /api/orders/:id` - Get specific order
- `POST /api/orders` - Create new order
- `PATCH /api/orders/:id/status` - Update order status

## WebSocket Events

The system uses WebSocket for real-time updates with the following events:
- `newOrder` - Triggered when a new order is created
- `updateOrder` - Triggered when an order status is updated

## Order Status Flow

Orders can have the following statuses:
1. `new` - Order just created
2. `preparing` - Kitchen is preparing the order
3. `ready` - Order is ready for serving
4. `served` - Order has been served to the customer
5. `cancelled` - Order has been cancelled

## Directory Structure

```
restaurant-system/
├── docker-compose.yaml
├── frontend/
│   ├── views/
│   ├── public/
│   ├── server.js
│   └── web-socket-server.js
├── menu-service/
│   └── src/
│       ├── controllers/
│       ├── models/
│       ├── routes/
│       └── server.js
└── order-service/
    └── src/
        ├── controllers/
        ├── models/
        ├── routes/
        ├── services/
        └── server.js
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
