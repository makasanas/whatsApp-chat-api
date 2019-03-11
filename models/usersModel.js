/*
FileName : userModel.js
Date : 11th March 2019
Description : This file consist of User's model fields
*/
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  domain: { type: String },
  hasDiscounts: { type: Boolean },
  storeId: { type: Number },
  email: { type: String, unique: true, required: true },
  password: { type: String },
  phone: { type: String, required: true },
  token: { type: String, unique: true, },
  createdAt: { type: Date, default: Date.now() },
  deleted: { type: Boolean, default: false }
});

module.exports = mongoose.model('Users', userSchema);