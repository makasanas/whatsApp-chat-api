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
  storeId: { type: Number },
  email: { type: String, unique: true, required: true },
  password: { type: String },
  passwordSet: { type: Boolean, default: false },
  phone: { type: String },
  accessToken: { type: String, unique: true, required: true },
  role: { type: Number, default: 2 },
  created: { type: Date, default: Date.now() },
  deleted: { type: Boolean, default: false },
  updated: { type: Date, default: Date.now() }
});

module.exports = mongoose.model('Users', userSchema);