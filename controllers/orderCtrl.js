/*
FileName : orderCtrl.js
Date : 7th Aug 2018
Description : This file consist of functions related to Orders
*/



/* DEPENDENCIES */
const { SetResponse, RequestErrorMsg, ErrMessages, ApiResponse } = require('./../helpers/common');
const analyticOrderSchema = require('./../schema/analyticOrder');
const discountSchema = require('./../schema/discount');
const productSchema = require('./../schema/product');
const orderSchema = require('./../schema/order');

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
    let orderList = await analyticOrderSchema.find({ shopUrl: decoded.shopUrl, deleted: false }).sort({ created: -1 }).skip(skip).limit(limit);
    let count = await analyticOrderSchema.count({ shopUrl: decoded.shopUrl, deleted: false });
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

/* Order Analytics Create */
module.exports.orders = async (req, res) => {
  let rcResponse = new ApiResponse();
  let httpStatus = 200;
  rcResponse.message = 'ok';

  try {
    //finding is coupon is used by BOT
    let data = {
      orderId: req.body.id,
      shopUrl: req.get('x-shopify-shop-domain'),
      discount_applications: req.body.discount_applications,
      product: req.body.line_items,
      discount_codes: req.body.discount_codes
    }


    //Saving current order
    const createOrder = await orderSchema.create(data);


    let result = await data.discount_codes.map(coupen => coupen.code);


    const discountList = await discountSchema.findOne({ discount_code: result[0], shopUrl: data.shopUrl }).exec((err, doc) => {

      let responseData = {}
      if (doc) {

        const getProduct = productSchema.findOne({ _id: doc.productId }).exec(async (err, product) => {


          var foundProduct = await req.body.line_items.find(element => {

            return element.product_id == product.productId;
          });

          let originalDiscount = ((foundProduct.price * foundProduct.quantity) * product.discountValue) / 100;
          let botDiscount = foundProduct.discount_allocations[0].amount;

          let analyticData = {
            orderId: createOrder._id,
            discountId: doc._id,
            productId: product._id,
            orderNo: req.body.order_number,
            price: foundProduct.price,
            productName:foundProduct.name,
            discountCode: result[0],
            qty: foundProduct.quantity,
            originaldiscount:originalDiscount,
            botDicount: botDiscount,
            botProfit: originalDiscount - botDiscount,
            shopUrl: req.get('x-shopify-shop-domain')
          }
          //Saving Analytics order
          const createAnalytic = analyticOrderSchema.create(analyticData);

          responseData = createAnalytic;
        });

      } else {
        responseData = createOrder;
      }
      rcResponse.data = responseData;

      return res.status(httpStatus).send(rcResponse);
    });
  } catch (err) {
    SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
    httpStatus = 500;
  }
};

