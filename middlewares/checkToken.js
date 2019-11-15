/*
FileName : checkToken.js
Date : 2nd Aug 2018
Description : This file consist of middleware functions to use while requesting data
*/

const jwt = require('jsonwebtoken');
const { ApiResponse, UserRoles, plans, SetError } = require('./../helpers/common');
const crypto = require('crypto')
const { handleError } = require('./../helpers/utils');

// validates access token for user
exports.validateToken = function (req, res, next) {
  try {
    /* Contruct response object */
    let rcResponse = new ApiResponse();

    // check header or url parameters or post parameters for token
    const token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers['authorization'];

    if (token) {
      // verifies secret
      jwt.verify(token, process.env['SECRET'], function (err, decoded) {
        if (err) {
          handleError(SetError(403, 'InvalidToken'), rcResponse);
          return res.status(rcResponse.code).send(rcResponse);
        } else {
          req.decoded = decoded;
          next();
        }
      });
    } else {
      handleError(SetError(403, 'InvalidToken'), rcResponse);
      return res.status(rcResponse.code).send(rcResponse);
    }
  } catch (err) {
    handleError(err, rcResponse);
    return res.status(rcResponse.code).send(rcResponse);
  }
};

exports.validateAcessToken = function (req, res, next) {
  /* Contruct response object */
  let rcResponse = new ApiResponse();
  // check header or url parameters or post parameters for token
  const token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers['authorization'];

  try {
    if (token) {
      // verifies secret
      jwt.verify(token, process.env['ADMIN_KEY'], function (err, decoded) {
        if (err) {
          handleError(SetError({}, 403, 'InvalidToken'), rcResponse);
          return res.status(rcResponse.code).send(rcResponse);
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
  /* Contruct response object */
  let rcResponse = new ApiResponse();
  try {
    const roles = new UserRoles();
    if (req.decoded.role !== roles.admin) {
      handleError(SetError({}, 403, 'InvalidToken'), rcResponse);
      return res.status(rcResponse.code).send(rcResponse);
    } else {
      next();
    }
  } catch (err) {
    handleError(err, rcResponse);
    return res.status(rcResponse.code).send(rcResponse);
  }
};

// check if the requesting user is restaurant owner
module.exports.isOwner = async (req, res, next) => {
  /* Contruct response object */
  let rcResponse = new ApiResponse();
  try {
    const roles = new UserRoles();
    if (req.decoded.role !== roles.owner) {
      handleError(SetError({}, 403, 'InvalidToken'), rcResponse);
      return res.status(rcResponse.code).send(rcResponse);
    } else {
      next();
    }
  } catch (err) {
    handleError(err, rcResponse);
    return res.status(rcResponse.code).send(rcResponse);
  }
};

/* Check if requesting user is owner or admin user */
module.exports.isOwnerOrAdmin = async (req, res, next) => {
  /* Contruct response object */
  let rcResponse = new ApiResponse();
  try {
    const roles = new UserRoles();
    if (req.decoded.role === roles.user) {
      handleError(SetError({}, 403, 'InvalidToken'), rcResponse);
      return res.status(rcResponse.code).send(rcResponse);
    } else {
      next();
    }
  } catch (err) {
    handleError(err, rcResponse);
    return res.status(rcResponse.code).send(rcResponse);
  }
};


module.exports.planCheck = async (req, res, next) => {
  /* Contruct response object */
  let rcResponse = new ApiResponse();
  try {
    const currentPlan = await activePlanSchema.findOne({ userId: req.decoded.id }).lean().exec();
    const count = await productSchema.count({ userId: req.decoded.id, deleted: false });
    var activePaln = plans.find(plan => plan.name == currentPlan.planName)

    if (activePaln.product <= count) {
      handleError(SetError({}, 403, 'InvalidToken'), rcResponse);
      return res.status(rcResponse.code).send(rcResponse);
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
      handleError(SetError({}, 403, 'RequestNotFromShopify'), rcResponse);
      return res.status(rcResponse.code).send(rcResponse);
    }
  } catch (err) {
    handleError(err, rcResponse);
    return res.status(rcResponse.code).send(rcResponse);
  }

}
