const request = require('request-promise');
const { SetResponse, RequestErrorMsg, ErrMessages, ApiResponse, signedCookies, normalCookes } = require('./../helpers/common');
const mongoose = require('mongoose');
const utils = require('./../helpers/utils');
const shopifyReuest = require('./../helpers/shopifyReuest.js');
var url = require('url');


module.exports.accessToken = async (req, res) => {
    /* Contruct response object */
    let rcResponse = new ApiResponse();
    let httpStatus = 200;
    req.body['client_secret'] = process.env.appSecret;

    try {
        let accessTokenRequestUrl = 'https://' + req.body.shop + '/admin/oauth/access_token';
        await request.post(accessTokenRequestUrl, { json: req.body })
            .then((response) => {
                delete req.body['client_secret'];
                delete req.body['code'];
                delete req.body['client_id'];
                rcResponse.data = { ...response, ...req.body }
            })
            .catch((error) => {
                console.log(error);
                httpStatus = error.statusCode;
                rcResponse.data = error.error.error_description
            });
    } catch (err) {
        SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
        httpStatus = 500;
    }
    return res.status(httpStatus).send(rcResponse);
};


module.exports.install = async (req, res, next) => {
    try {
        if (!req.query.shop) {
            res.render('install', {});
        } else {
            var shop = req.query.shop;
            var appId = process.env.appId;
            var appScope = process.env.appScope;
            var appDomain = process.env.appDomain;

            //build the url
            var installUrl = `https://${shop}/admin/oauth/authorize?client_id=${appId}&scope=${appScope}&redirect_uri=http://${appDomain}/shopify/auth`;

            if (false) {
                res.redirect('/shopify/app?shop=' + shop);
            } else {
                res.redirect(installUrl);
            }
        }

    } catch (err) {
        console.log(err);
        next(new Error('Not Found'))
    }
};


module.exports.auth = async (req, res, next) => {
    let securityPass = false;
    let appId = process.env.appId;
    let appSecret = process.env.appSecret;
    let shop = req.query.shop;
    let code = req.query.code;


    const regex = /^[a-z\d_.-]+[.]myshopify[.]com$/;

    if (shop.match(regex)) {
        console.log('regex is ok');
        securityPass = true;
    } else {
        //exit
        securityPass = false;
    }

    // 1. Parse the string URL to object
    let urlObj = url.parse(req.url);
    // 2. Get the 'query string' portion
    let query = urlObj.search.slice(1);
    if (utils.verify(query)) {
        //get token
        console.log('get token');
        securityPass = true;
    } else {
        //exit
        securityPass = false;
    }

    if (securityPass && regex) {

        //Exchange temporary code for a permanent access token
        let accessTokenRequestUrl = 'https://' + shop + '/admin/oauth/access_token';
        let accessTokenPayload = {
            client_id: appId,
            client_secret: appSecret,
            code,
        };

        request.post(accessTokenRequestUrl, { json: accessTokenPayload })
            .then(async (response) => {
                console.log(response)
                console.log('shop token ' + response.access_token);
                let options = {
                    maxAge: 1000 * 60 * 15, // would expire after 15 minutes
                    httpOnly: true, // The cookie only accessible by the web server
                    signed: true // Indicates if the cookie should be signed
                }
                res.cookie('access_token', response.access_token, signedCookies)
                res.cookie('shop', shop, normalCookes)
                res.redirect('/shopify/app?shop=' + shop);
            })
            .catch((error) => {
                res.status(error.statusCode).send(error.error);
            });
    }
    else {
        res.redirect('/installerror');
    }
};

module.exports.app = async (req, res, next) => {
    try {
       // let url = 'https://' + req.cookies.shop + '/admin/products.json?ids=9169617540,9169694276';
        let url = 'https://' + req.cookies.shop + '/admin/products.json?title=Charcoal';

        shopifyReuest.get(url, req.signedCookies.access_token).then(function (response) {
            console.log("============response===========");
            console.log(response.body);
            res.render('app', {});
        })
            .catch(function (err) {
                console.log("============errors===========");
                console.log(err.error);
                console.log(err.statusCode);

                next(new Error('Not Found'))
            });;
        ;
    } catch (err) {
        console.log(err);
        next(new Error('Not Found'))
    }

}




module.exports.getProduct = async (req, res) => {
    /* Contruct response object */
    let rcResponse = new ApiResponse();
    let httpStatus = 200;
    req.body['client_secret'] = process.env.appSecret;

    try {
        let url = 'https://' + req.body.shop + '/admin/products.json';
        let options = {
            method: 'GET',
            uri: url,
            json: true,
            headers: {
                'X-Shopify-Access-Token': req.body.accessToken,
                'content-type': 'application/json'
            }
        };

        await request(options)
            .then(function (response) {
                rcResponse.data = { ...response }
            })
            .catch(function (err) {
                console.log(error);
                httpStatus = error.statusCode;
                rcResponse.data = error.error.error_description
            });
    } catch (err) {
        SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
        httpStatus = 500;
    }
    return res.status(httpStatus).send(rcResponse);
};