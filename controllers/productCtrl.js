/*
FileName : restaurantCtr.js
Date : 2nd Aug 2018
Description : This file consist of functions related to restaurants
*/



/* DEPENDENCIES */
const { SetResponse, RequestErrorMsg, ErrMessages, ApiResponse } = require('./../helpers/common');
const productModel = require('./../models/productModel');
const mongoose = require('mongoose');

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

/* Create new restaurant */
module.exports.createNewProduct = async (req, res) => {

//   {
//     "title": "Fossil, leather, Watchs",
//     "productId": 9169753476,
//     "description": "Analogue watch with a round case, has a stainless steel back",
//     "image": "https://cdn.shopify.com/s/files/1/1509/6342/products/11474708652160-Fossil-Men-Watches-3911474708652013-1.jpg?v=1476099927",
//     "isBargain": true,
//     "discountType": "percentage",
//     "discountValue": 25
// }
  /* Contruct response object */
  let rcResponse = new ApiResponse();
  let httpStatus = 200;
  const { decoded } = req;

  if (!req.body.title || !req.body.productId || !req.body.discountType) {
    SetResponse(rcResponse, 400, RequestErrorMsg('InvalidParams', req, null), false);
    httpStatus = 400;
  }
  console.log(req.decoded);
  try {
    let productObj = {
      title: req.body.title,
      shopeUrl: req.decoded.shopUrl,
      userId:  req.decoded.id,
      productId: req.body.productId,
      description: req.body.description,
      image: req.body.image,
      isBargain:  req.body.isBargain,
      discountType: req.body.discountType,
      discountValue: req.body.discountValue
    };
    productObj = JSON.parse(JSON.stringify(productObj));

    const product = new productModel(productObj);
    const productSave = await product.save();
    rcResponse.data = productSave;
  } catch (err) {
    if (err.code === 11000) {
      SetResponse(rcResponse, 400, RequestErrorMsg('ProductExists', req, null), false);
      httpStatus = 400;
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

  let page = query.page ? parseInt(query.page) : 1 ;
  let limit = query.limit ?   parseInt(query.limit) : 10 ;
  let skip = (page - 1) * limit;
  console.log(skip,)
  try {
    let productList = await productModel.find({ shopeUrl: decoded.shopUrl, deleted:false }).sort({created:-1}).skip(skip).limit(limit);
    let count = await productModel.count({ shopeUrl: decoded.shopUrl, deleted:false });
    rcResponse.data = {
        products: productList,
        count:count
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
    let productInfo = await productModel.findOne({ productId:req.params.productId, deleted:false }).lean().exec();
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
      isBargain:  req.body.isBargain,
      discountType: req.body.discountType,
      discountValue: req.body.discountValue
    };
    productObj = JSON.parse(JSON.stringify(productObj));
    const updateProduct = await productModel.findOneAndUpdate({ _id: req.params.productId }, { $set: productObj }, { new: true }).lean().exec();
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
    const deleteProdcut = await productModel.update({ _id: req.params.productId}, { $set: { deleted: true } }).lean().exec();
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
