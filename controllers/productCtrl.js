/*
FileName : restaurantCtr.js
Date : 2nd Aug 2018
Description : This file consist of functions related to restaurants
*/



/* DEPENDENCIES */
const { SetResponse, RequestErrorMsg, ErrMessages, ApiResponse } = require('./../helpers/common');
const productSchema = require('./../schema/product');
const orderSchema = require('./../schema/order');
const discountSchema = require('./../schema/discount');
const analyticOrderSchema = require('./../schema/analyticOrder');

const mongoose = require('mongoose');
const getRawBody = require('raw-body')
const crypto = require('crypto')
const secretKey = '91836d2e840312d9267dca48dec93fe7'

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

/* Create new restaurant */
module.exports.createNewProduct = async (req, res) => {
  let rcResponse = new ApiResponse();
  let httpStatus = 200;
  let productObj = {};
  const { decoded } = req;
  if (!req.body.title || !req.body.productId || !req.body.discountType) {
    SetResponse(rcResponse, 400, RequestErrorMsg('InvalidParams', req, null), false);
    httpStatus = 400;
  }
  try {
    productObj = {
      title: req.body.title,
      shopUrl: req.decoded.shopUrl,
      userId: req.decoded.id,
      productId: req.body.productId,
      description: req.body.description,
      image: req.body.image,
      discountType: req.body.discountType,
      discountValue: req.body.discountValue
    };
    productObj = JSON.parse(JSON.stringify(productObj));

    const product = new productSchema(productObj);
    const productSave = await product.save();
    rcResponse.data = productSave;
  } catch (err) {
    if (err.code === 11000) {
      productObj['deleted'] = false;
      const updateProduct = await productSchema.findOneAndUpdate({ productId: productObj.productId }, { $set: productObj }, { new: true }).lean().exec();
      rcResponse.data = updateProduct;
    } else {
      SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
      httpStatus = 500;
    }
  }
  return res.status(httpStatus).send(rcResponse);
};

/* Get list of restaurants for the owner */
module.exports.getListOfProductsOwned = async (req, res) => {
  /* Contruct response object */
  let rcResponse = new ApiResponse();
  let httpStatus = 200;
  const { query, decoded } = req;

  let page = query.page ? parseInt(query.page) : 1;
  let limit = query.limit ? parseInt(query.limit) : 10;
  let skip = (page - 1) * limit;

  try {
    let productList = await productSchema.find({ shopUrl: decoded.shopUrl, deleted: false }).sort({ created: -1 }).skip(skip).limit(limit);
    let count = await productSchema.count({ shopUrl: decoded.shopUrl, deleted: false });
    rcResponse.data = {
      products: productList,
      count: count
    }
  } catch (err) {
    SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
    httpStatus = 500;
  }
  return res.status(httpStatus).send(rcResponse);
};


/* Get list of restaurants for the owner */
module.exports.getCount = async (req, res) => {
  /* Contruct response object */
  let rcResponse = new ApiResponse();
  let httpStatus = 200;
  const { query, decoded } = req;

  try {
    let count = await productSchema.count({ shopUrl: decoded.shopUrl, deleted: false });
    rcResponse.data = {
      count: count
    }
  } catch (err) {
    SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
    httpStatus = 500;
  }
  return res.status(httpStatus).send(rcResponse);
};

/* Get details of the restaurant */
module.exports.getProductDetails = async (req, res) => {
  /* Contruct response object */
  let rcResponse = new ApiResponse();
  let httpStatus = 200;
  const { decoded } = req;

  try {
    let productInfo = await productSchema.findOne({ productId: req.params.productId, deleted: false }).lean().exec();
    productInfo = productInfo;
    rcResponse.data = productInfo;
  } catch (err) {
    SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
    httpStatus = 500;
  }
  return res.status(httpStatus).send(rcResponse);
};

/* Update restaurant details */
module.exports.updateProductDetails = async (req, res) => {
  /* Contruct response object */
  let rcResponse = new ApiResponse();
  let httpStatus = 200;
  const { decoded } = req;

  try {
    let productObj = {
      title: req.body.title,
      description: req.body.description,
      image: req.body.image,
      discountType: req.body.discountType,
      discountValue: req.body.discountValue
    };
    productObj = JSON.parse(JSON.stringify(productObj));
    const updateProduct = await productSchema.findOneAndUpdate({ _id: req.params.productId }, { $set: productObj }, { new: true }).lean().exec();
    rcResponse.data = updateProduct;
    rcResponse.message = 'Product details has been updated successfully';
  } catch (err) {
    SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
    httpStatus = 500;
  }
  return res.status(httpStatus).send(rcResponse);
};

/* Delete a restaurant */
module.exports.deleteProduct = async (req, res) => {
  /* Contruct response object */
  let rcResponse = new ApiResponse();
  let httpStatus = 200;
  const { decoded } = req;

  try {
    const deleteProdcut = await productSchema.update({ _id: req.params.productId }, { $set: { deleted: true } }).lean().exec();
    if (deleteProdcut.nModified) {
      rcResponse.message = 'Product has been deleted successfully';
    } else {
      httpStatus = 400;
      rcResponse.message = 'No Product found with this id';
    }
  } catch (err) {
    SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
    httpStatus = 500;
  }
  return res.status(httpStatus).send(rcResponse);
};


