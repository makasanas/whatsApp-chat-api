/*
FileName : productModel.js
Date : 11th March 2019
Description : This file consist of Contact's model fields
*/
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contactSchema = new Schema({
    shopUrl: { type: String, required: true },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
    },
    name: { type: String},
    email: { type: String},
    messageFrom: { type: String},
    messageType: { type: String},
    message: { type: String},
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
});

const index = {"shopUrl": 1 };
contactSchema.index(index);

module.exports = mongoose.model('Contacts', contactSchema);