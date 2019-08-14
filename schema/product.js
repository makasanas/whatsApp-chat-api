/*
FileName : productSchema.js
Date : 12th March 2019
Description : This file consist of Product's model fields
*/
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    title: { type: String, required: true },
    shopUrl: { type: String, required: true },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    productId: { type: Number, unique: true, required: true },
    description: { type: String },
    productPrice: { type: Number },
    image: { type: String },
    discountType: { type: String, required: true },
    discountValue: { type: Number },
    created: { type: Date, default: Date.now() },
    updated: { type: Date, default: Date.now() },
    deleted: { type: Boolean, default: false }
});

module.exports = mongoose.model('Products', productSchema);