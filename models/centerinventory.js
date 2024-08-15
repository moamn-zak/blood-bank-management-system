const mongoose = require('mongoose');

const centerinventorySchema = new mongoose.Schema({
    centerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BloodCenter',
        required: true
    },
    inventoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Inventory',
        required: true
    },

}, { timestamps: true });

module.exports = mongoose.model('Centerinventory', centerinventorySchema);


