const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSyncDetailSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    shopUrl: { type: String, required: true },
    totalProduct: { type: Number },
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
});


module.exports = mongoose.model('productSyncDetails', productSyncDetailSchema);