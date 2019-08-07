/*
FileName : orderCtrl.js
Date : 7th Aug 2018
Description : This file consist of functions related to Orders
*/



/* DEPENDENCIES */
const { SetResponse, RequestErrorMsg, ErrMessages, ApiResponse } = require('./../helpers/common');
const analyticOrderModel = require('./../models/analyticOrderModel');
const discountModel = require('./../models/discountModel');
const productModel = require('./../models/productModel');
const ordersModel = require('./../models/ordersModel');

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

/* Order Analytics Create */
module.exports.orders = async (req, res) => {
  console.log("webhook is workingggggggggggggggggggggggg");
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
    const createOrder = await ordersModel.create(data);

    console.log(createOrder, "first log after webhook workeddddddddddddddddddddddd");

    let result = await data.discount_codes.map(coupen => coupen.code);

    console.log("result ====== = ==  = = = = ", result);

    const discountList = await discountModel.findOne({ discount_code: result[0], shopUrl: data.shopUrl }).exec((err, doc) => {
      console.log("findeddddd");
      console.log(doc, "###############################");

      let responseData = {}
      if (doc) {

        const getProduct = productModel.findOne({ _id: doc.productId }).exec(async (err, product) => {

          console.log(product, "producttttttt");

          var foundProduct = await req.body.line_items.find(element => {
            console.log(element, "@@@@@@@@@@@@@@@@@@@@@@@@@@");

            return element.product_id == product.productId;
          });
          console.log(foundProduct,"foundedddd");

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
            originaldiscountAmount:originalDiscount,
            botDicountAmount: botDiscount,
            botProfit: originalDiscount - botDiscount,
            shopUrl: req.get('x-shopify-shop-domain')
          }
          //Saving Analytics order
          const createAnalytic = analyticOrderModel.create(analyticData);

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

