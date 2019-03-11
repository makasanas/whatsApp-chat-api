/*
FileName : utils.js
Date : 2nd Aug 2018
Description : This file consist of utility functions
*/
const hmacValidator = require('hmac-validator');
const bcrypt = require('bcryptjs');

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

const errors = {
  "url":"https://royal.pingdom.com/the-5-most-common-http-errors-according-to-google/",
  "400":"bad Request mostly paremet not match so show error accodily to user this peramet is missing",
  "401":"unatuhordized logout",
  "403":"not authotized to access api or page so show error relate to front",
  "404":"page not found so send acoridnly to 404 page",
  "500":"database something went wrong please try "
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

// module.exports.singingCookes = function (res, cookeName, cookeValue) {
//   let options = {
//     maxAge: 1000 * 60 * 15, // would expire after 15 minutes
//     httpOnly: true, // The cookie only accessible by the web server
//     signed: true // Indicates if the cookie should be signed
//   }
//    res.cookie('access_token', response.access_token, options)
// }

// module.exports.normalCookes = function (query) {
//   let options = {
//     maxAge: 1000 * 60 * 15, // would expire after 15 minutes
//     httpOnly: false, // The cookie only accessible by the web server
//     signed: false // Indicates if the cookie should be signed
//   }
//   return res.cookie('access_token', response.access_token, options)
// }
