/*
FileName : checkToken.js
Date : 2nd Aug 2018
Description : This file consist of middleware functions to use while requesting data
*/

const jwt = require('jsonwebtoken');
const { SetResponse, RequestErrorMsg, ErrMessages, ApiResponse, UserRoles, plans, RequestNotFromShopify, PlanLimit } = require('./../helpers/common');
const activePlan = require('./../models/activePlan');
const productModel = require('./../models/productModel');
const crypto = require('crypto')
const secretKey = '91836d2e840312d9267dca48dec93fe7'

// validates access token for user
exports.validateToken = function (req, res, next) {

  /* Contruct response object */
  let rcResponse = new ApiResponse();

  // check header or url parameters or post parameters for token
  const token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers['authorization'];

  // decode token
  if (token) {
    // verifies secret
    jwt.verify(token, process.env['SECRET'], function (err, decoded) {
      if (err) {
        SetResponse(rcResponse, 403, RequestErrorMsg('InvalidToken', req, null), false);
        let httpStatus = 403;
        return res.status(httpStatus).send(rcResponse);
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
    });
  } else {
    // if there is no token
    SetResponse(rcResponse, 401, RequestErrorMsg('InvalidToken', req, null), false);
    let httpStatus = 401;
    return res.status(httpStatus).send(rcResponse);
  }
};

// check if the requesting user is Admin user
module.exports.isAdminUser = async (req, res, next) => {
  /* Contruct response object */
  let rcResponse = new ApiResponse();

  const roles = new UserRoles();
  if (req.decoded.role !== roles.admin) {
    SetResponse(rcResponse, 403, RequestErrorMsg('NotAuthorized', req, null), false);
    httpStatus = 403;
    return res.status(httpStatus).send(rcResponse);
  } else {
    next();
  }
};

// check if the requesting user is restaurant owner
module.exports.isOwner = async (req, res, next) => {
  /* Contruct response object */
  let rcResponse = new ApiResponse();

  const roles = new UserRoles();
  if (req.decoded.role !== roles.owner) {
    SetResponse(rcResponse, 403, RequestErrorMsg('NotAuthorized', req, null), false);
    httpStatus = 403;
    return res.status(httpStatus).send(rcResponse);
  } else {
    next();
  }
};

/* Check if requesting user is owner or admin user */
module.exports.isOwnerOrAdmin = async (req, res, next) => {
  /* Contruct response object */
  let rcResponse = new ApiResponse();

  const roles = new UserRoles();
  if (req.decoded.role === roles.user) {
    SetResponse(rcResponse, 403, RequestErrorMsg('NotAuthorized', req, null), false);
    httpStatus = 403;
    return res.status(httpStatus).send(rcResponse);
  } else {
    next();
  }
};


module.exports.planCheck = async (req, res, next) => {
  /* Contruct response object */
  let rcResponse = new ApiResponse();
  
  const currentPlan = await activePlan.findOne({ userId: req.decoded.id }).lean().exec();
  const count = await productModel.count({ userId: req.decoded.id, deleted:false });
  var activePaln = plans.find(plan => plan.name == currentPlan.planName)


  if (activePaln.product <= count) {
    SetResponse(rcResponse, 403, RequestErrorMsg('PlanLimit', req, null), false);
    httpStatus = 403;
    return res.status(httpStatus).send(rcResponse);
  } else {
    next();
  }
};


module.exports.validateWebhook = async (req,res,next) => {
  let rcResponse = new ApiResponse();
      const hash = await crypto
      .createHmac('sha256', secretKey)
      .update(Buffer.from(req.rawbody))   
      .digest('base64')

  if (hash == req.headers['x-shopify-hmac-sha256']) {
      next()
  } else {
    SetResponse(rcResponse, 403, RequestErrorMsg('RequestNotFromShopify', req, null), false);
    httpStatus = 403;
    return res.status(httpStatus).send(rcResponse);
  }
}