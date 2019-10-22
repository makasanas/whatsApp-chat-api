/*
FileName : productSchema.js
Date : 12th March 2019
Description : This file consist of Product's model fields
*/
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const planSchema = new Schema({
    shopUrl: { type: String, required: true, unique: true },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        unique: true
    },
    planName: { type: String, required: true },
    planId: { type: Number },
    planPrice: { type: Number, required: true },
    status: { type: String, required: true },
    type: { type: String, required: true },
    activated_on: { type: Date },
    currentMonthStartDate: { type: Date },
    nextMonthStartDate: { type: Date },
    chargeInfo: [{
        startDate: { type: Date },
        planName: { type: String },
        planPrice: { type: Number }
    }],
    products: { type: Number },
    cancelled_on: { type: Date, default: Date.now },
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
    deleted: { type: Boolean, default: false },
});

module.exports = mongoose.model('plans', planSchema);