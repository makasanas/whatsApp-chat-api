/*
FileName : common.js
Date : 2nd Aug 2018
Description : This file consist of functions that can be used through the application
*/

const ErrMessages = {
  ISE: 'Internal server error',
  InvalidToken: 'Token is not valid',
  RequestNotFromShopify: 'Request not from shopify',
  ShopNotExists: 'Shop not found',
  InvalidParams: 'Invalid Params'
};

/**
 * a function to handle responses as then one we use in middleware is not flexible enough
 * @param {object} respObj
 * @param {Int} code
 * @param {String} message
 * @param {Boolean} success
 * @param {Object} data
 */
const SetResponse = (respObj, code = 200, message = 'OK', success = true, data = {}) => {
  respObj.code = code;
  respObj.success = success;
  respObj.message = message;
  respObj.data = data;
  return respObj;
};


const SetError = (errObj, code = 500, message = 'ISE', type = 'custom') => {
  errObj.code = code;
  errObj.message = message;
  errObj.type = type;
  return errObj;
};


/**
 * UserRoles
 * returns the assigned numbers according to user's roles
 * @returns {number} number assigned to user role
 */
function UserRoles() {
  this.admin = 1;
  this.owner = 2;
};


const Plans = {
  Basic: {
    minProduct: 0,
    maxProduct: 500
  },
  Silver: {
    minProduct: 500,
    maxProduct: 1000
  },
  Silver: {
    minProduct: 1000,
    maxProduct: 5000
  },
  Platinum: {
    minProduct: 5000
  }
}


/**
 * ApiResponse
 * constructs response object
 * @returns {object} response object
 */
function ApiResponse() {
  this.success = true;
  this.message = "OK";
  this.code = 200;
  this.data = {};
};

module.exports = {
  SetResponse,
  ErrMessages,
  UserRoles,
  ApiResponse,
  SetError,
  Plans
};