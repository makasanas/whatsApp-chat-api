/*
FileName : AnalyticOrders.js
Date : 31st July 2019
Description : This file consist of AnalyticOrders model fields
*/
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const analyticOrderSchema = new Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'orders'
    },
    discountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'discounts'
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Products'
    },
    orderNo: { type: String },
    productName: { type: String },
    discountCode: { type: String },
    price: { type: Number },
    qty: { type: Number },
    originaldiscount: { type: String },
    botDicount: { type: String },
    botProfit: { type: String },
    shopUrl: { type: String },
    created: { type: Date, default: Date.now() },
    updated: { type: Date, default: Date.now() },
    deleted: { type: Boolean, default: false },
});

module.exports = mongoose.model('analyticOrders', analyticOrderSchema);