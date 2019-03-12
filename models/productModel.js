/*
FileName : productModel.js
Date : 12th March 2019
Description : This file consist of Product's model fields
*/
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    title: { type: String, required: true },
    shopeUrl: { type: String, required: true },
    userId: { type: String, required: true },
    type: { type: String },
    vendor: { type: String },
    price: { type: Number },
    description: { type: String },
    image: { type: String },
    isBargain: { type: Boolean },
    discountType: { type: String },
    discountValue: { type: Number },
    createdAt: { type: Date, default: Date.now() },
    deleted: { type: Boolean, default: false }
});

module.exports = mongoose.model('Products', productSchema);