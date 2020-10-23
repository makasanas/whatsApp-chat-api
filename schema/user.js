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
  recurringPlanType: { type: String },
  recurringPlanName: { type: String },
  accessToken: { type: String, unique: true, required: true },
  role: { type: Number, default: 2 },
  domain: { type: String },
  currency: { type: String },
  country_name: { type: String },
  country_code: { type: String },
  language: { type: String },
  plan_display_name: { type: String },
  plan_name: { type: String },
  productCount: { type: Number },
  scope: { type: String },
  customer_email: { type: String },
  trial_days: { type: Number },
  trial_start: { type: Date },
  nextReviewDate: { type: Date },
  reviewMailCount: { type: Number },
  appEnabled: { type: Boolean, default: false },
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },
});


// userSchema.index(
//   { shopUrl: 1 },
//   { name: "cronJobshopUrl" }
// );

// userSchema.index(
//   { storeId: 1 },
//   { name: "storeId" }
// );
userSchema.index(
  { storeName: "text" },
  { name: "storeName" }
);
// userSchema.index(
//   { email: "text" },
//   { name: "email" }
// );
// userSchema.index(
//   { shopUrl: "text" },
//   { name: "shopUrl" }
// );

// userSchema.index({ storeName: "text" });


module.exports = mongoose.model('Users', userSchema);