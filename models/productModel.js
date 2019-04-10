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
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    productId: { type: Number, unique: true, required: true },
    description: { type: String },
    image: { type: String },
    isBargain: { type: Boolean },
    discountType: { type: String, required: true },
    discountValue: { type: Number },
    created: { type: Date, default: Date.now() },
    updated: { type: Date, default: Date.now() },
    deleted: { type: Boolean, default: false }
});

module.exports = mongoose.model('Products', productSchema);