const hmacValidator = require('hmac-validator');
const bcrypt = require('bcryptjs');
const { SetResponse, ErrMessages } = require('./common');
var nodemailer = require("nodemailer");
const request = require('request-promise');

/* Generate hash for password */
module.exports.generatePasswordHash = async (password) => {
  try {
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
  } catch (err) {
    throw err;
  }
};

/* Compare password hash */
module.exports.comparePassword = async (originalPass, passToMatch) => {
  try {
    return new Promise((resolve, reject) => {
      bcrypt.compare(originalPass, passToMatch, (err, isMatch) => {
        if (err) {
          reject(err);
        } else {
          resolve(isMatch);
        }
      });
    });
  } catch (err) {
    throw err;
  }
};

module.exports.handleError = async (err, rcResponse) => {
  try {
    if (err.type && err.type == 'custom') {
      SetResponse(rcResponse, err.code, ErrMessages[err.message], false);
    } else if (err.response && err.response.headers && err.response.headers['x-shopify-stage']) {
      SetResponse(rcResponse, err.statusCode, err.message, false);
    } else if (err.name === 'MongoError') {
      SetResponse(rcResponse, 500, err.errmsg, false);
    } else if (err instanceof ReferenceError) {
      SetResponse(rcResponse, 500, err.message, false);
      if (process.env.appSecret === 'true') {
        let mailBody = "ReferenceError Error in somewhere is project\n" + err.stack;
        await this.sendMail("makasanas@yahoo.in", mailBody, "ReferenceError Error in somewhere is project");
      }else{
        console.log(err);
      }

    } else {
      SetResponse(rcResponse, 500, err.message, false);
    }
  } catch (err) {
    SetResponse(rcResponse, 500, err.message, false);
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
}


module.exports.verify = function (query) {
  try {
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
  } catch (err) {
    throw err;
  }
};


module.exports.handleshopifyRequest = async (type, url, token, body) => {
  try {
    let options = {
      method: type,
      url: url,
      json: true,
      body: body,
      resolveWithFullResponse: true,//added this to view status code
      headers: {
        'X-Shopify-Access-Token': token,
        'content-type': 'application/json'
      },
    };
    return request(options);
  } catch (err) {
    throw err;
  }
}


module.exports.handlePromiseRequest = async (options) => {
  try {
    return request(options);
  } catch (err) {
    throw err;
  }
}

module.exports.getPaginationLink = async (responses) => {
  var obj = {};
  try {
    if (responses.headers['link']) {
      links = responses.headers['link'].split(',');
      links.forEach((link) => {
        link = link.split(';');
        obj[link[1].trim().substr(5).slice(0, -1)] = link[0].trim().substr(1).slice(0, -1);
      })
    }
    return obj;
  } catch (err) {
    throw err;
  }
}


