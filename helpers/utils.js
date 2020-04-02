const hmacValidator = require('hmac-validator');
const bcrypt = require('bcryptjs');
const { SetResponse, ErrMessages } = require('./common');
var nodemailer = require("nodemailer");
const request = require('request-promise');
const pug = require('pug');
const mailgun = require("mailgun-js");
var moment = require('moment');
var tz = require('moment-timezone');



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
    } else {
      if (process.env.NODE_ENV === 'prod') {
        let mailBody = "ReferenceError Error in somewhere is project\n" + err.stack;
        this.sendmail("makasanas@yahoo.in", mailBody, "ReferenceError Error in somewhere is project");
      } else {
        console.log(err);
      }
      SetResponse(rcResponse, 500, ErrMessages['ISE'], false);
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
    await smtpTransport.sendMail(mailOptions);
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

module.exports.mailWithTemplate = async (user, subject, template) => {
  try {

    console.log("sending mail......");

    const DOMAIN = "mail.webrexstudio.com";
    const mg = mailgun({ apiKey: "key-af642c7a1c48a8849078995f1be4b8d9", domain: DOMAIN });

    user['appName'] = process.env.appName;
    user['appUrl'] = process.env.appUrl;

    const data = {
      from: process.env.appName + " <hello@webrexstudio.com>",
      replayTo: "<hello@webrexstudio.com>",
      // to: user.email,
      to: "ravi@webrexstudio.com",
      subject: subject,
      html: pug.renderFile(__dirname + '/../emails/' + template + '.pug', user),
    };

    mg.messages().send(data);
  } catch (err) {
    throw err;
  }
}

// this.mailWithTemplate({}, "Please Help us Improve", "uninstall")

module.exports.BulkMailWithTemplet = async (bulkData, mailData, template) => {
  console.log(mailData);
  console.log("sending Bulk mail...");

  try {
    const DOMAIN = "mail.webrexstudio.com";
    const mg = mailgun({ apiKey: "key-af642c7a1c48a8849078995f1be4b8d9", domain: DOMAIN });
    var data = {
      from: 'Excited User <hello@webrexstudio.com>',
      to: '' + mailData.join(',') + '',
      subject: 'Hey %recipient.storeName%',
      html: pug.renderFile(__dirname + '/../emails/' + template + '.pug'),
      'recipient-variables': bulkData
    };
    mg.messages().send(data, function (err, body) {
      if (err) {
        throw err;
      }
      console.log(body);
    });
  } catch (err) {
    console.log("dwd");
    throw err;
  }
}


module.exports.getNextWeekDate = async (user) => {

  try {

    //Get Current UTC Time
    var currentUtcTime = moment().utc().format();
    console.log("currentUtcTime");
    console.log(currentUtcTime);
    console.log("*---------*");

    //Get date after 7 day from now UTC
    var nextWeek = moment(currentUtcTime).add(7, 'days').utc().format();
    console.log("nextWeek")
    console.log(nextWeek);
    console.log("*---------*");


    //Add 11:00 time
    var nextWeekUserTimeWith11 = moment(nextWeek).set({ 'hour': 11, 'minute': 30, 'second': 00 });
    console.log("nextWeekUserTime after set 11:00");
    console.log(nextWeekUserTimeWith11);

    //Get User country time Zone
    let cnTimeZone = moment.tz.zonesForCountry(user.country_code)[0];
    console.log("cnZone---------");
    console.log(cnTimeZone);
    console.log("*---------*");

    // Convert it into user's timezone
    var nextWeekUserTime = moment.tz(nextWeekUserTimeWith11, cnTimeZone).format();
    console.log("nextWeekUserTime");
    console.log(nextWeekUserTime);

    var stringDate = moment(nextWeekUserTime).toISOString(false);
    console.log("stringDate");
    console.log(stringDate);

    var timeZoneDiff = moment(nextWeekUserTime).tz(cnTimeZone).format('Z');
    console.log("timeZoneDiff");
    console.log(timeZoneDiff);

    // var finalTime;
    // if(timeZoneDiff.includes("+")){
    //   finalTime = moment.add(timeZoneDiff.split(''))
    // }else{

    // }

    return stringDate;
  } catch (err) {
    console.log(err);
    throw err;
  }
}
