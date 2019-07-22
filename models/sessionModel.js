const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sessionSchema = new Schema({
    sessionData: [{
        type: { type: String },
        message: { type: String },
        count: { type: Number, default: 0 },
        productId: { type: Number, default: null}
    }]
});

module.exports = mongoose.model('Session', sessionSchema);