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
  storeId: { type: Number, unique: true, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  credit:{type: Number , default: 5},
  recurringPlanName: { type: String },
  recurringPlanId: { type: String },
  recurringPlanExpiryDate: { type: Date },
  accessToken: { type: String, unique: true, required: true },
  role: { type: Number, default: 2 },
  domain : { type: String },
  currency :  { type: String },
  country_name: { type: String },
  country_code: { type: String },
  language: { type: String },
  plan_display_name : { type: String },
  plan_name : { type: String },
  access_token: { type: String },
  refresh_token: { type: String },
  merchantId: { type: String },
  expires_in: { type: Date, default: Date.now },
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Users', userSchema);