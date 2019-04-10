/*
FileName : userModel.js
Date : 11th March 2019
Description : This file consist of User's model fields
*/
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const discountSchema = new Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Products'
    },
    discountValue: { type: Number, required: true },
    discountType: { type: String, required: true },
    price_rule_id: { type: Number, required: true },
    discount_code: { type: String, required: true },
    discount_code_id: { type: Number, required: true },
    shopeUrl: { type: String, required: true },
    used: { type: Boolean, default: false },
    orderId: { type: Number },
    created: { type: Date, default: Date.now() },
    deleted: { type: Boolean, default: false },
    updated: { type: Date, default: Date.now() }
});

module.exports = mongoose.model('discounts', discountSchema);