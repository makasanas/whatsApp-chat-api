/*
FileName : orderCtrl.js
Date : 7th Aug 2018
Description : This file consist of functions related to Orders
*/



/* DEPENDENCIES */
const { SetResponse, RequestErrorMsg, ErrMessages, ApiResponse } = require('./../helpers/common');
const analyticOrderModel = require('./../models/analyticOrderModel');

const mongoose = require('mongoose');
const getRawBody = require('raw-body')
const crypto = require('crypto');


/* Get list of Orders for the Analytics */
module.exports.getAnalyticOrders = async (req, res) => {
  /* Contruct response object */
  let rcResponse = new ApiResponse();
  let httpStatus = 200;
  const { query, decoded } = req;

  let page = query.page ? parseInt(query.page) : 1;
  let limit = query.limit ? parseInt(query.limit) : 10;
  let skip = (page - 1) * limit;

  try {
    let orderList = await analyticOrderModel.find({ shopUrl: decoded.shopUrl, deleted: false }).sort({ created: -1 }).skip(skip).limit(limit);
    let count = await analyticOrderModel.count({ shopUrl: decoded.shopUrl, deleted: false });
    rcResponse.data = {
      orders: orderList,
      count: count
    }
  } catch (err) {
    SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
    httpStatus = 500;
  }
  return res.status(httpStatus).send(rcResponse);
};

