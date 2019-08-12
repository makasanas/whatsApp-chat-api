const request = require('request-promise');
const { SetResponse, RequestErrorMsg, ErrMessages, ApiResponse, signedCookies, normalCookes, generateRandom } = require('./../helpers/common');
const mongoose = require('mongoose');
const utils = require('./../helpers/utils');
const shopifyReuest = require('./../helpers/shopifyReuest.js');
const usersModel = require('./../models/usersModel');
const productModel = require('./../models/productModel');
var url = require('url');
const jwt = require('jsonwebtoken');
const activePlan = require('./../models/activePlan');



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

generatorAcessToekn = async(req, res) => {
    let url;
    let accessToken;
    let appId = process.env.appId;
    let appSecret = process.env.appSecret;
    let shopUrl = req.query.shop;
    let code = req.query.code;

    try {
        if (securityCheck(req)) {
            //Exchange temporary code for a permanent access token
            let accessTokenRequestUrl = 'https://' + shopUrl + '/admin/oauth/access_token';
            let accessTokenPayload = {
                client_id: appId,
                client_secret: appSecret,
                code,
            };
            
            await request.post(accessTokenRequestUrl, { json: accessTokenPayload }).then(async (response) => {
                url = 'https://' + shopUrl + '/admin/shop.json';
                accessToken = response.access_token;
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
    }catch (err) {
        if (err.code === 11000) {
            SetResponse(rcResponse, 400, RequestErrorMsg('ShopExists', req, null), false);
            httpStatus = 400;
        } else {
            SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
            httpStatus = 500;
        }
    }

    return {
        url: url,
        accessToken:accessToken,
        shopUrl: shopUrl
    }
}

createShop = async (req, res, shopData, rcResponse, httpStatus) => {
    try{
        await shopifyReuest.get(shopData.url, shopData.accessToken).then(async (response) => {
            let UserObj = {
                storeName: response.body.shop.name,
                shopUrl: response.body.shop.domain,
                hasDiscounts: response.body.shop.has_discounts,
                storeId: response.body.shop.id,
                email: response.body.shop.email,
                phone: response.body.shop.phone,
                accessToken: shopData.accessToken,
                recurringPlanName: 'Free'
            };
    
            const user = new usersModel(UserObj);
            const userSave = await user.save();
    
            let currentPlan = {
                shopUrl: response.body.shop.domain,
                userId: userSave._id,
                planName: "Free",
                planPrice: 0,
                status: "active",
                type: "Lifetime",
                started: Date.now(),
                products: process.env.Free
            }
    
            const plan = new activePlan(currentPlan);
            const planSave = await plan.save();
    
            const encodedData = {
                id: userSave._id,
                accessToken: userSave.accessToken,
                shopUrl: userSave.shopUrl,
                email: userSave.email,
                role: userSave.role,
                plan: currentPlan.planName,
                type: currentPlan.type,
                started: currentPlan.started
            };
            // generate accessToken using JWT
            const jwtToken = jwt.sign(encodedData, process.env['SECRET']);
    
            let resObj = { _id: userSave._id, shopUrl: userSave.shopUrl, storeName: userSave.storeName, email: userSave.email, phone: userSave.phone, storeId: userSave.storeId, passwordSet: userSave.passwordSet };
            let planObj = { planName: currentPlan.planName, status: currentPlan.status, type: currentPlan.type, started: currentPlan.started }
    
            rcResponse.data = { ...resObj, token: jwtToken, plan: planObj };
    
        }).catch(function (error) {
            if (error.statusCode) {
                SetResponse(rcResponse, error.statusCode, error.error, false);
                httpStatus = error.statusCode;
            } else {
                SetResponse(rcResponse, 500, RequestErrorMsg(null, req, error), false);
                httpStatus = 500;
            }
        })
    }catch (err) {
        SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
        httpStatus = 500;
    }

    return {
        httpStatus: httpStatus,
        rcResponse: rcResponse
    };
}

createOrUpdateShop = async (req, res, shopData, rcResponse, httpStatus) => {

    const findUser = await usersModel.findOne({ shopUrl: shopData.shopUrl, deleted:false }).lean().exec();
    try {
        if (!findUser) {
            let webhookArry = await createWebHook(req, res, shopData.accessToken, shopData.shopUrl, rcResponse);


            let response = await createShop(req, res, shopData, rcResponse, httpStatus);
            httpStatus = response.httpStatus;
            rcResponse = response.rcResponse;
            
        }else{
            const userSave = await usersModel.findOneAndUpdate({ _id: findUser._id }, { $set: { accessToken: shopData.accessToken, deleted: false } }, { new: true }).lean().exec();
            const currentPlan = await activePlan.findOne({ userId: findUser._id }).lean().exec();
            const encodedData = {
                id: findUser._id,
                accessToken: findUser.accessToken,
                shopUrl: findUser.shopUrl,
                email: findUser.email,
                role: findUser.role,
                plan: currentPlan.planName,
                type: currentPlan.type,
                started: currentPlan.started
            };
    
            const jwtToken = jwt.sign(encodedData, process.env['SECRET']);
    
            let resObj = { _id: userSave._id, shopUrl: userSave.shopUrl, storeName: userSave.storeName, email: userSave.email, phone: userSave.phone, storeId: userSave.storeId, passwordSet: userSave.passwordSet };
            let planObj = { planName: currentPlan.planName, status: currentPlan.status, type: currentPlan.type, started: currentPlan.started }
    
            rcResponse.data = { ...resObj, token: jwtToken, plan: planObj };
        }
    } catch (err) {
        SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
        httpStatus = 500;
    }

    return {
        httpStatus: httpStatus,
        rcResponse:rcResponse
    };
}

module.exports.auth = async (req, res, next) => {
    let rcResponse = new ApiResponse();
    let httpStatus = 200;

    let shopData = await generatorAcessToekn(req, res);

    let response = await createOrUpdateShop(req, res, shopData, rcResponse, httpStatus);

    return res.status(response.httpStatus).send(response.rcResponse);
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
            const updateUser = await usersModel.findOneAndUpdate({ _id: findUser._id }, { $set: { password: passHash, passwordSet: true } }, { new: true }).lean().exec();

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

        await Promise.all(promiseArray).then(async responses => {
            let result = await responses[0].products.map(product => product.id);
            await productModel.find({ productId: { $in: result }, deleted: false }, async function (err, products) {
                await products.forEach(async (product) => {
                    var index = await result.indexOf(product.productId)
                    responses[0].products[index]['added'] = true;
                });
                rcResponse.data = { ...responses[0], ...responses[1] }
                return res.status(httpStatus).send(rcResponse);
            });
        })
    } catch (err) {
        SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
        httpStatus = 500;
        return res.status(httpStatus).send(rcResponse);

    }

    // return res.status(httpStatus).send(rcResponse);
};

module.exports.insertProducts = async (req, res) => {
    /* Contruct response object */
    let rcResponse = new ApiResponse();
    let httpStatus = 200;

    /* Check body params */
    if (!req.body.shopUrl || !req.body.userId || !req.body.title || !req.body.price) {
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

module.exports.deleteApp = async (req, res) => {
    let rcResponse = new ApiResponse();
    let httpStatus = 200;

    try {
        const updateUser = await usersModel.updateMany({ storeId: req.body.id }, { $set: { deleted: true } }, { new: true }).lean().exec();
        rcResponse.data = updateUser

    } catch (err) {
        SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
        httpStatus = 500;
    }
    return res.status(httpStatus).send(rcResponse);
};


 createWebHook = async (req, res, accessToken, shopUrl, rcResponse) => {

    var hostname = "https://bargaining-bot-api.webrexstudio.com"

    var requests = [
        {
            method: 'POST',
            uri: 'https://' + shopUrl + '/admin/api/2019-07/webhooks.json',
            body: {
                "webhook": {
                    "topic": "app/uninstalled",
                    "address": hostname+"/webhooks/app/delete",
                    "format": "json"
                }
            },
            json: true,
            headers: {
                'X-Shopify-Access-Token': accessToken
            }
        },
        {
            method: 'POST',
            uri: 'https://' + shopUrl + '/admin/api/2019-07/webhooks.json',
            body: {
                "webhook": {
                    "topic": "orders/create",
                    "address": hostname+"/webhooks/orders/create",
                    "format": "json"
                }
            },
            json: true,
            headers: {
                'X-Shopify-Access-Token': accessToken
            }
        },
        {
            method: 'POST',
            uri: 'https://' + shopUrl + '/admin/api/2019-07/script_tags.json',
            body: {
                "script_tag": {
                    "event": "onload",
                    "src": 'https://bargaining-bot.webrexstudio.com/js/bargaining-bot.js',
                    "display_scope": "online_store"
                }
            },
            json: true,
            headers: {
                'X-Shopify-Access-Token': accessToken
            }
        },
    ]

    let promiseArray = [];

    requests.forEach(singleRequest =>{
        promiseArray.push(request(singleRequest))
    });

    await Promise.all(promiseArray).then(async responses => {
        return responses;
    }).catch(function(error) {
        if (error.statusCode) {
            SetResponse(rcResponse, error.statusCode, error.error, false);
            httpStatus = error.statusCode;
        } else {
            SetResponse(rcResponse, 500, RequestErrorMsg(null, req, error), false);
            httpStatus = 500;
        }
    });

    return true;
}
