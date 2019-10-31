/*
FileName : syncProductSchema.js
Date : 11th March 2019
Description : This file consist of Product's model fields
*/
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const syncProductSchema = new Schema({
    shopUrl: { type: String, required: true },
    productId: { type: Number, required: true },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
    },
    title:{ type: String},
    description:{ type: String},
    vendor:{ type: String},
    product_type:{ type: String},
    handle:{ type: String},
    published_at:{ type: String},
    template_suffix:{ type: String},
    tags:{ type: String},
    published_scope:{ type: String},
    admin_graphql_api_id:{ type: String},
    variants:{ type: Array},
    options:{ type: Array},
    images:{ type: Array},
    image:{ type: Object},
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
});

module.exports = mongoose.model('syncproducts', syncProductSchema);