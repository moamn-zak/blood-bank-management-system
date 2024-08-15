const mongoose = require('mongoose');


const bloodCenterSchema = new mongoose.Schema({
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
    city: {
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
    location: {
        type: [Number],
        required: true
    },
    workingHours: {
        type: String,
        required: true
    },
    additionalInfo: {
        type: String
    },
    fcmToken: {
        type: String,
        default: ''
    }
},
    { timestamps: true });


// تعيين فهرس لحقل الموقع لتمكين البحث الجغرافي
bloodCenterSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('BloodCenter', bloodCenterSchema);
