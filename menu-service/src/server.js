require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const menuRoutes = require('./routes/menuRoutes')

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.log("MongoDB connection error: ", err));

app.use('/api/menu', menuRoutes);

app.get('/api/health', (req, res) => {
    res.json({status: 'Menu Service is running'});
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Menu Service is running on port ${PORT}`);
});