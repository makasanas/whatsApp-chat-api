/*
FileName : common.js
Date : 2nd Aug 2018
Description : This file consist of functions that can be used through the application
*/

const ErrMessages = {
  ISE: 'Internal server error',
  InvalidParams: 'Invalid body parameters',
  NotAuthorized: 'You are not authorized to perform this operation',
  EmailExists: 'This email is already registered in the system, please try different email.',
  InvalidPassword: 'Shop Url or password is incorrect',
  InvalidToken: 'Access token is invalid',
  InvalidAdminKey: 'Invalid Admin key',
  NoImage: 'Please select a valid image file',
  ShopExists: 'A Shop already exists please try to login into your shop',
  ShopNotExists: 'Shop does not exists',
  userNotFound: 'Email does not exists',
  wrongHappened: 'Something wrong happened please try again',
  ProductExists:'Product alreday enable with discount',
  PasswordNotSet:'Your register with us but password is not set so follow installation process again',
  PlanLimit:'you exceed to your plan limit please upgrade plan to add more product',
  RequestNotFromShopify:'Request not from shopify',
  tokenInvalid:'Password reset token is invalid or has expired.'
};

/**
 * a function to handle responses as then one we use in middleware is not flexible enough
 * @param {object} respObj
 * @param {Int} code
 * @param {String} message
 * @param {Boolean} success
 * @param {Object} data
 */
const SetResponse = (respObj, code = 1, message = 'OK', success = true, data = {}) => {
  respObj.code = code;
  respObj.success = success;
  respObj.message = message;
  respObj.data = data;
  return respObj;
};

/**
 * RequestErrorMsg
 * constructs a meaningful Error Message
 * @param {string} errKey
 * @param {object} requestObj
 * @param {object} errorObj
 * @returns {string} a string prompt describing the error and it's place in api
 */
const RequestErrorMsg = (errKey, requestObj = null, errorObj = null) => {
  return `${(errorObj !== null) ? errorObj.message+' ': ''}${(errKey !== null) ? ErrMessages[errKey] : ''}`;
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


plans = [
  {
    name:'Free',
    product: 5
  },
  {
    name:'Silver',
    product: 50
  },
  {
    name:'Gold',
    product: 100
  },
  {
    name:'Platinum',
    product: 250
  }
]


/**
 * ApiResponse
 * constructs response object
 * @returns {object} response object
 */
function ApiResponse() {
  this.success = true;
  this.message = "OK";
  this.code = 0;
  this.data = {};
};

const signedCookies = {
  maxAge: 1000 * 60 * 10, // would expire after 15 minutes
  httpOnly: true, // The cookie only accessible by the web server
  signed: true // Indicates if the cookie should be signed
}

const normalCookes = {
  maxAge: 1000 * 60 * 10, // would expire after 15 minutes
  httpOnly: false, // The cookie only accessible by the web server
  signed: false // Indicates if the cookie should be signed
}

function generateRandom(length) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+=";

  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

module.exports = {
  SetResponse,
  ErrMessages,
  RequestErrorMsg,
  UserRoles,
  ApiResponse,
  signedCookies,
  normalCookes,
  generateRandom,
  plans
};