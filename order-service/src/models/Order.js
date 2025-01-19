const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    menuItemId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'MenuItem'
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true,
        min: 0
    }
});

const orderSchema = new mongoose.Schema({
    tableNumber: {
        type: Number,
        required: true,
        min: 1
    },
    items: [orderItemSchema],
    status: {
        type: String,
        required: true,
        enum: ['new', 'preparing', 'ready', 'served', 'cancelled'],
        default: 'new'
    },
    totalAmount: {
        type: Number,
        min: 0
    },
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

orderSchema.pre('save', function(next) {
    if(this.items.length === 0) {
        next(new Error('Order must have at least one item'));
    }

    this.totalAmount = this.items.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);

    next();
});

module.exports = mongoose.model('Order', orderSchema);