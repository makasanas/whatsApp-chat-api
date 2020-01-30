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
    shopifyData: {
        title: { type: String },
        body_html: { type: String },
        vendor: { type: String },
        product_type: { type: String },
        handle: { type: String },
        published_at: { type: String },
        template_suffix: { type: String },
        tags: { type: String },
        published_scope: { type: String },
        admin_graphql_api_id: { type: String },
        variants: { type: Array },
        options: { type: Array },
        images: { type: Array },
        image: { type: Object },
    },
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
});

const index = { "shopifyData.title": 'text', "shopifyData.description": 'text', "shopifyData.product_type": 'text', "shopUrl": 1 };
const weight = { name: 'sych text index', weights: { "shopifyData.title": 10, "shopifyData.description": 4, "shopifyData.product_type": 2 } }
productSchema.index(index, weight);

module.exports = mongoose.model('Products', productSchema);