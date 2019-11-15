const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productTypeSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        unique: true
    },
    shopUrl: { type: String, required: true, unique: true },
    product_type: [{ type: String }],
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
});

productTypeSchema.index({ shopifyData: { title: 'text' } })


module.exports = mongoose.model('ProductTypes', productTypeSchema);