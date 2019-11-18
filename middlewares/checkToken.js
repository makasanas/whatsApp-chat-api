const jwt = require('jsonwebtoken');
const { ApiResponse, UserRoles,  SetError } = require('./../helpers/common');
const crypto = require('crypto')
const { handleError } = require('./../helpers/utils');

// validates access token for user
exports.validateToken = function (req, res, next) {
  let rcResponse = new ApiResponse();

  try {
    // check header or url parameters or post parameters for token
    const token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers['authorization'];

    if (token) {
      // verifies secret
      jwt.verify(token, process.env['SECRET'], function (err, decoded) {
        if (err) {
          throw SetError({}, 403, 'InvalidToken');
        } else {
          req.decoded = decoded;
          next();
        }
      });
    } else {
      throw SetError({}, 403, 'InvalidToken');
    }
  } catch (err) {
    handleError(err, rcResponse);
    return res.status(rcResponse.code).send(rcResponse);
  }
};

module.exports.validateAcessToken = function (req, res, next) {
  /* Contruct response object */
  let rcResponse = new ApiResponse();
  // check header or url parameters or post parameters for token
  const token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers['authorization'];

  try {
    if (token) {
      // verifies secret
      jwt.verify(token, process.env['ADMIN_KEY'], function (err, decoded) {
        if (err) {
          throw SetError({}, 403, 'InvalidToken');
        } else {
          // if everything is good, save to request for use in other routes
          req.decoded = decoded;
          next();
        }
      });
    } else {
      next();
    }
  } catch (err) {
    handleError(err, rcResponse);
    return res.status(rcResponse.code).send(rcResponse);
  }
};

// check if the requesting user is Admin user
module.exports.isAdminUser = async (req, res, next) => {
  let rcResponse = new ApiResponse();
  try {
    const roles = new UserRoles();
    if (req.decoded.role !== roles.admin) {
      throw SetError({}, 403, 'NotAdmin');
    } else {
      next();
    }
  } catch (err) {
    handleError(err, rcResponse);
    return res.status(rcResponse.code).send(rcResponse);
  }
};




module.exports.validateWebhook = async (req, res, next) => {
  let rcResponse = new ApiResponse();
  try {
    const hash = await crypto.createHmac('sha256', process.env.appSecret).update(Buffer.from(req.rawbody)).digest('base64')
    if (hash == req.headers['x-shopify-hmac-sha256']) {
      next()
    } else {
      throw SetError({}, 403, 'RequestNotFromShopify');
    }
  } catch (err) {
    handleError(err, rcResponse);
    return res.status(rcResponse.code).send(rcResponse);
  }
}
