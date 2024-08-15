const mongoose = require('mongoose');


const hospitalSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    fcmToken: {
        type: String,
        default: ''
    }
},
    { timestamps: true });

module.exports = mongoose.model('Hospital', hospitalSchema);
