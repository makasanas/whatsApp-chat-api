/*
FileName : productModel.js
Date : 12th March 2019
Description : This file consist of Product's model fields
*/
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    orderId: { type: Number, required: true },
    shopUrl: { type: String, required: true },
    discount_applications: { type: Array },
    product: { type: Array },
    discount_codes: { type: Array },
    created: { type: Date, default: Date.now() },
    updated: { type: Date, default: Date.now() },
    deleted: { type: Boolean, default: false },
});

module.exports = mongoose.model('orders', orderSchema);