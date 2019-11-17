/*
FileName : productModel.js
Date : 11th March 2019
Description : This file consist of Product's model fields
*/
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    shopUrl: { type: String, required: true },
    productId: { type: Number, unique: true, required: true },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
    },
    shopifyData: { type: Object },
    status: { type: String, default: "N/A" },
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Products', productSchema);