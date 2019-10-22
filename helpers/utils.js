/*
FileName : utils.js
Date : 2nd Aug 2018
Description : This file consist of utility functions
*/
const hmacValidator = require('hmac-validator');
const bcrypt = require('bcryptjs');
const { SetResponse, RequestErrorMsg, ErrMessages, ApiResponse, signedCookies, normalCookes, generateRandom } = require('./common');
var nodemailer = require("nodemailer");
const request = require('request-promise');


/* Generate hash for password */
module.exports.generatePasswordHash = async (password) => {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) {
        reject(err);
      } else {
        bcrypt.hash(password, salt, (err, hash) => {
          if (err) {
            reject(err);
          } else {
            resolve(hash);
          }
        });
      }
    });
  });
};

/* Compare password hash */
module.exports.comparePassword = async (originalPass, passToMatch) => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(originalPass, passToMatch, (err, isMatch) => {
      if (err) {
        reject(err);
      } else {
        resolve(isMatch);
      }
    });
  });
};

module.exports.handleError = async (err, req, rcResponse) => {
  try {
    if (err instanceof ReferenceError) {
      SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
    } else if (err.options && err.options.headers && err.options.headers["X-Shopify-Access-Token"]) {
      SetResponse(rcResponse, err.statusCode, err.message, false);
    } else if (err.name === 'MongoError') {
      SetResponse(rcResponse, 500, "error from monodb", false);
    } else {
      SetResponse(rcResponse, 500, RequestErrorMsg(null, null, err), false);
    }
  } catch (err) {
    SetResponse(rcResponse, 500, RequestErrorMsg(null, null, err), false);
  }
}

module.exports.sendMail = async (email, mailBody, subject) => {
  try {
    var smtpTransport = nodemailer.createTransport({
      host: "smtp.zoho.com",
      port: 465,
      secure: true, //ssl
      auth: {
        user: "hello@webrexstudio.com",
        pass: "Sanjay.143"
      }
    });
    var mailOptions = {
      to: email,
      subject: subject,
      text: mailBody,
      from: process.env.appName + ' <hello@webrexstudio.com>'
    }

    await smtpTransport.sendMail(mailOptions, function (error, response) {
      if (err) {
        throw err;
      }
    });
  } catch (err) {
    throw err;
  }
  return true;
}


module.exports.verify = function (query) {
  var validate = hmacValidator({
    replacements: {
      both: {
        '&': '%26',
        '%': '%25'
      },
      keys: {
        '=': '%3D'
      }
    },
    excludedKeys: ['signature', 'hmac'],
    algorithm: 'sha256',
    format: 'hex',
    digestKey: 'hmac'
  });

  // 3. Verify signature
  return validate(process.env.appSecret, null, query);
};


module.exports.handlePromiseRequest = async (options) => {
  try {
    return request(options);
  } catch (err) {
    throw err;
  }
}


