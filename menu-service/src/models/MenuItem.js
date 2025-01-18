const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
   name: {
       type: String,
       required: true,
       trim: true
    },
   price: {
       type: Number,
       required: true,
       min: 0
   },
   category: {
       type: String,
       required: true,
       enum: ['appetizer', 'main', 'dessert', 'drink']
   },
   available: {
       type: Boolean,
       default: true
   },
   description: {
       type: String,
       trim: true
   }
}, {
    timestamps: true
});

module.exports = mongoose.model('MenuItem', menuItemSchema);
