require('dotenv').config();
const express = require('express');
const path = require('path');
const axios = require('axios');
const expressLayouts = require('express-ejs-layouts');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(expressLayouts)
app.set('view engine', 'ejs');
app.set('layout', 'layouts/main');

app.get('/', (req, res) => {
    console.log('Rendering index page');
    res.render('index', {
        title: 'Restaurant System',
        body: 'Welcome to the Restaurant System!',
    });
});

app.get('/menu', async (req, res) => {
    try {
        const response = await axios.get(`${process.env.MENU_SERVICE_URL}/api/menu`);
        res.render('menu', {
            title: 'Menu',
            menuItems: response.data
        });
    } catch (error) {
        console.error('Error fetching menu:', error);
        res.render('error', {
            title: 'Error',
            message: 'An error occurred while fetching the menu'
        });
    }
});

app.get('/orders/new', async (req, res) => {
    try {
        const response = await axios.get(`${process.env.MENU_SERVICE_URL}/api/menu`);
        res.render('new-order', {
            title: 'New Order',
            menuItems: response.data
        });
    } catch (error) {
        console.error('Error fetching menu:', error);
        res.render('error', {
            title: 'Error',
            message: 'An error occurred while fetching the menu'
        });
    }
});

app.get('/orders', async (req, res) => {
    try {
        const response = await axios.get(`${process.env.ORDER_SERVICE_URL}/api/orders?status=new,preparing,ready`);
        res.render('orders', {
            title: 'Active Orders',
            orders: response.data
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.render('error', {
            title: 'Error',
            message: 'An error occurred while fetching the orders'
        });
    }
});

app.get('/orders/history', async (req, res) => {
   try{
         const response = await axios.get(`${process.env.ORDER_SERVICE_URL}/api/orders?status=served`);
         res.render('order-history', {
              title: 'Order History',
              orders: response.data
         });
   } catch (error) {
       console.error('Error fetching orders:', error);
       res.render('error', {
           title: 'Error',
           message: 'An error occurred while fetching the orders'
       });
   }
});

app.post('/api/orders', async (req, res) => {
    try {
        const response = await axios.post(
            `${process.env.ORDER_SERVICE_URL}/api/orders`,
            req.body
        );
        res.json(response.data);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({
            message: 'An error occurred while creating the order'
        });
    }
});

app.patch('/api/orders/:id/status', async (req, res) => {
    try {
        const response = await axios.patch(
            `${process.env.ORDER_SERVICE_URL}/api/orders/${req.params.id}/status`,
            req.body
        );
        res.json(response.data);
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({
            message: 'An error occurred while updating the order status'
        });
    }
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        title: 'Server Error',
        message: 'Something went wrong!'
    });
});

app.use((req, res) => {
    res.status(404).render('error', {
        title: '404 Not Found',
        message: 'The page you are looking for does not exist.'
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Frontend server is running on port ${PORT}`);
    console.log(`Menu Service URL: ${process.env.MENU_SERVICE_URL}`);
    console.log(`Order Service URL: ${process.env.ORDER_SERVICE_URL}`);
});