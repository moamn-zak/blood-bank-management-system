const mongoose = require('mongoose');

const bloodInventorySchema = new mongoose.Schema({
    items: [
        {
            type: {
                type: String,
                enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Plasma', 'Serum', 'Platelets', 'Clotting Factor', 'various proteins'],
                required: true
            },
            quantity: {
                type: Number,
                required: true
            }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('Inventory', bloodInventorySchema);
