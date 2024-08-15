const mongoose = require('mongoose');


const Schema = mongoose.Schema;

const bloodrequestsSchema = new Schema({

    request: {
        type: Schema.Types.ObjectId,
        ref: 'Request'
    },
    centerId: {
        type: Schema.Types.ObjectId,
        ref: 'BloodCenter'
    },
    requesterId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'onModel'
    },
    onModel: {
        type: String,
        required: true,
        enum: ['User', 'Hospital']
    }
},
    { timestamps: true });


module.exports = mongoose.model('BloodRequests', bloodrequestsSchema);
