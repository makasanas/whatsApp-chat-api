const request = require('request-promise');
const { SetResponse, RequestErrorMsg, ErrMessages, ApiResponse, signedCookies, normalCookes, generateRandom } = require('./../helpers/common');
const mongoose = require('mongoose');
const utils = require('./../helpers/utils');
const shopifyReuest = require('./../helpers/shopifyReuest.js');
const usersModel = require('./../models/usersModel');
const productModel = require('./../models/productModel');
var url = require('url');
const jwt = require('jsonwebtoken');



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
                httpStatus = error.statusCode;
                rcResponse.data = error.error.error_description
            });
    } catch (err) {
        SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
        httpStatus = 500;
    }
    return res.status(httpStatus).send(rcResponse);
};


/* module.exports.install = async (req, res, next) => {
    try {
        if (!req.query.shop) {
            res.render('install', {});
        } else {
            var shop = req.query.shop;
            var appId = process.env.appId;
            var appScope = process.env.appScope;
            var appshopUrl = process.env.appshopUrl;

            //build the url
            var installUrl = `https://${shop}/admin/oauth/authorize?client_id=${appId}&scope=${appScope}&redirect_uri=http://${appshopUrl}/shopify/auth`;

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
}; */

function securityCheck(req) {
    let securityPass = false;
    let shopUrl = req.query.shop;

    const regex = /^[a-z\d_.-]+[.]myshopify[.]com$/;

    if (shopUrl.match(regex)) {
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
        securityPass = true;
    } else {
        //exit
        securityPass = false;
    }
    return securityPass && regex;
};

module.exports.auth = async (req, res, next) => {
    let rcResponse = new ApiResponse();
    let httpStatus = 200;
    try {
        let appId = process.env.appId;
        let appSecret = process.env.appSecret;
        let shopUrl = req.query.shop;
        let code = req.query.code;

        if (securityCheck(req)) {

            //Exchange temporary code for a permanent access token
            let accessTokenRequestUrl = 'https://' + shopUrl + '/admin/oauth/access_token';
            let accessTokenPayload = {
                client_id: appId,
                client_secret: appSecret,
                code,
            };

            await request.post(accessTokenRequestUrl, { json: accessTokenPayload }).then(async (response) => {
                let url = 'https://' + shopUrl + '/admin/shop.json';
                let accessToken = response.access_token;
                await shopifyReuest.get(url, accessToken).then(async (response) => {
                    let UserObj = {
                        storeName: response.body.shop.name,
                        shopUrl: response.body.shop.domain,
                        hasDiscounts: response.body.shop.has_discounts,
                        storeId: response.body.shop.id,
                        email: response.body.shop.email,
                        phone: response.body.shop.phone,
                        accessToken: accessToken
                    };
                    const user = new usersModel(UserObj);
                    const userSave = await user.save();

                    const encodedData = {
                        id: userSave._id,
                        accessToken: userSave.accessToken,
                        shopUrl: userSave.shopUrl,
                        email: userSave.email
                    };
                    // generate accessToken using JWT
                    const jwtToken = jwt.sign(encodedData, process.env['SECRET']);


                    let resObj = { _id: userSave._id, shopUrl: userSave.shopUrl, storeName: userSave.storeName, email: userSave.email, phone: userSave.phone, storeId: userSave.storeId };

                    rcResponse.data = { ...resObj, token: jwtToken };
                }).catch(function (error) {
                    if (error.statusCode) {
                        SetResponse(rcResponse, error.statusCode, error.error, false);
                        httpStatus = error.statusCode;
                    } else {
                        SetResponse(rcResponse, 500, RequestErrorMsg(null, req, error), false);
                        httpStatus = 500;
                    }
                });
            }).catch((error) => {
                if (error.statusCode) {
                    SetResponse(rcResponse, error.statusCode, error.error, false);
                    httpStatus = error.statusCode;
                } else {
                    SetResponse(rcResponse, 500, RequestErrorMsg(null, req, error), false);
                    httpStatus = 500;
                }
            });
        }
        else {
            SetResponse(rcResponse, 400, "Invalid Shop Domain or Url Verification failed", false);
            httpStatus = 400;
        }
    } catch (err) {
        if (err.code === 11000) {
            SetResponse(rcResponse, 400, RequestErrorMsg('ShopExists', req, null), false);
            httpStatus = 400;
        } else {
            SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
            httpStatus = 500;
        }
    }
    return res.status(httpStatus).send(rcResponse);
};


module.exports.app = async (req, res, next) => {
    try {
        // let url = 'https://' + req.cookies.shop + '/admin/products.json?ids=9169617540,9169694276';
        let url = 'https://' + req.cookies.shop + '/admin/products.json?title=Charcoal';

        shopifyReuest.get(url, req.signedCookies.access_token).then(function (response) {
            res.render('app', {});
        })
            .catch(function (err) {
                console.log(err.error);
                console.log(err.statusCode);
                next(new Error('Not Found'))
            });;
        ;
    } catch (err) {
        console.log(err);
        next(new Error('Not Found'))
    }

};

module.exports.setPassword = async (req, res) => {
    /* Contruct response object */
    let rcResponse = new ApiResponse();
    let httpStatus = 200;

    try {
        /* Check if email exists */
        const findUser = await usersModel.findOne({ _id: req.decoded.id }).lean().exec();
        if (findUser) {
            const passHash = await utils.generatePasswordHash(req.body.password);
            const updateUser = await usersModel.findOneAndUpdate({ _id: findUser._id }, { $set: { password: passHash } }, { new: true }).lean().exec();

            delete updateUser['password'];
            delete updateUser['accessToken'];

            rcResponse.data = updateUser;
        } else {
            SetResponse(rcResponse, 403, RequestErrorMsg('userNotFound', req, null), false);
            httpStatus = 403;
            return res.status(httpStatus).send(rcResponse);
        }
    } catch (err) {

        SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
        httpStatus = 500;

    }
    return res.status(httpStatus).send(rcResponse);

};

module.exports.getProducts = async (req, res) => {
    /* Contruct response object */
    let rcResponse = new ApiResponse();
    let httpStatus = 200;

    try {
        let promiseArray = [];
        var countQuery = '?';
        countQuery += req.query.title ? 'title=' + req.query.title : '';

        var query = '?';
        query += req.query.title ? 'title=' + req.query.title : '';
        query += req.query.limit ? '&limit=' + req.query.limit : '';
        query += req.query.page ? '&page=' + req.query.page : '';

        let productUrl = 'https://' + req.decoded.shopUrl + '/admin/products.json' + query;
        let countUrl = 'https://' + req.decoded.shopUrl + '/admin/products/count.json' + countQuery;

        let options = {
            method: 'GET',
            uri: productUrl,
            json: true,
            headers: {
                'X-Shopify-Access-Token': req.decoded.accessToken,
                'content-type': 'application/json'
            }
        };

        let options1 = {
            method: 'GET',
            uri: countUrl,
            json: true,
            headers: {
                'X-Shopify-Access-Token': req.decoded.accessToken,
                'content-type': 'application/json'
            }
        };

        promiseArray.push(request(options))
        promiseArray.push(request(options1))

        await Promise.all(promiseArray).then(responses => {
            rcResponse.data = { ...responses[0], ...responses[1] }
        })
    } catch (err) {
        SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
        httpStatus = 500;
    }
    return res.status(httpStatus).send(rcResponse);
};

module.exports.insertProducts = async (req, res) => {
    /* Contruct response object */
    let rcResponse = new ApiResponse();
    let httpStatus = 200;

    /* Check body params */
    if (!req.body.shopeUrl || !req.body.userId || !req.body.title || !req.body.price) {
        SetResponse(rcResponse, 400, RequestErrorMsg('InvalidParams', req, null), false);
        httpStatus = 400;
        return res.status(httpStatus).send(rcResponse);
    }
    try {
        const product = new productModel(req.body);
        const productSave = await product.save();
        rcResponse.data = productSave;
    } catch (err) {
        SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
        httpStatus = 500;

    }
    return res.status(httpStatus).send(rcResponse);
};



