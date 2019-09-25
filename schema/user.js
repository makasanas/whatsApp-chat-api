/*
FileName : userModel.js
Date : 11th March 2019
Description : This file consist of User's model fields
*/
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  storeName: { type: String },
  shopUrl: { type: String, unique: true, required: true },
  hasDiscounts: { type: Boolean },
  storeId: { type: Number, unique: true, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  recurringPlanName: { type: String },
  recurringPlanId: { type: String },
  recurringPlanExpiryDate: { type: Date },
  accessToken: { type: String, unique: true, required: true },
  role: { type: Number, default: 2 },
  created: { type: Date, default: Date.now() },
  updated: { type: Date, default: Date.now() },
});

module.exports = mongoose.model('Users', userSchema);