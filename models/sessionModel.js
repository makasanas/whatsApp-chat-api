const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sessionSchema = new Schema({
    productId: { type : Number },
    sessionData: [{
        type: { type: String },
        message: { type: String },
        created: { type: Date, default: Date.now() },
        productId:{ type : Number },
    }],
    created: { type: Date, default: Date.now() },
    shopUrl:{ type: String },
    maxBargainingCount : { type: Number },
    count: { type: Number, default: 0 },
    lastOffer: { type : Number }
});

module.exports = mongoose.model('Session', sessionSchema);