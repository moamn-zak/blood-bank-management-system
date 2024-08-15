const mongoose = require('mongoose');


const autoIncrement = require('mongoose-plugin-autoinc');

const requestSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Blood Donation', 'Taking Blood', 'Taking Blood Derivative'],
        required: true
    },
    itemType: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Plasma', 'Serum', 'Platelets', 'Clotting Factor', 'various proteins'],
        required: function ()
        {
            return this.type === 'Taking Blood' || this.type === 'Taking Blood Derivative';
        }
    },
    arrivalDate: {
        type: String,
        default: 'not set yet'
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected', 'Received'],
        default: 'Pending'
    },
    quantity: {
        type: Number,
        required: function ()
        {
            return this.type === 'Taking Blood' || this.type === 'Taking Blood Derivative';
        }
    },
    image: {
        type: String,
        required: function ()
        {
            return (this.type === 'Taking Blood' || this.type === 'Taking Blood Derivative') && this.onModel === 'User';
        }
    },

    requestNumber: {
        type: Number
    }
}, { timestamps: true });

// تطبيق التسلسل الآلي هنا

requestSchema.plugin(autoIncrement.plugin, {
    model: 'Request',
    field: 'requestNumber',
    startAt: 1,
    incrementBy: 1
});

module.exports = mongoose.model('Request', requestSchema);
