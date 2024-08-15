const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
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
    dateOfBirth: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female'],
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    bloodType: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        required: true
    },
    weight: {
        type: Number,
        required: true
    },
    lastDonationDate: {
        type: Date,
        default: null
    },
    medicalInfo: {
        type: String,
        default: ''
    },
    fcmToken: {
        type: String,
        default: ''
    }
},
    { timestamps: true });

module.exports = mongoose.model('User', userSchema);
