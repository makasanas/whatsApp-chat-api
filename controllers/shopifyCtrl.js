const request = require('request-promise');
const { SetResponse, RequestErrorMsg, ErrMessages, ApiResponse, signedCookies, normalCookes, generateRandom } = require('./../helpers/common');
const mongoose = require('mongoose');
const utils = require('./../helpers/utils');
const shopifyReuest = require('./../helpers/shopifyReuest.js');
const activePlanModel = require('./../model/activePlan');
var url = require('url');
const jwt = require('jsonwebtoken');
const userModel = require('./../model/user');

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

generatorAcessToekn = async(req, res, httpStatus, rcResponse) => {
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
                console.log(response);
            }).catch((error) => {
                if (error.statusCode) {
                    SetResponse(rcResponse, error.statusCode, error.error, false);
                    httpStatus = error.statusCode;
                    return res.status(httpStatus).send(rcResponse);
                } else {
                    SetResponse(rcResponse, 500, RequestErrorMsg(null, req, error), false);
                    httpStatus = 500;
                    return res.status(httpStatus).send(rcResponse);
                }
            });
        }else{
            console.log("erorror data");
        }
    }catch (err) {
        if (err.code === 11000) {
            SetResponse(rcResponse, 400, RequestErrorMsg('ShopExists', req, null), false);
            httpStatus = 400;
            return res.status(httpStatus).send(rcResponse);
        } else {
            SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
            httpStatus = 500;
            return res.status(httpStatus).send(rcResponse);
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
            
            const userSave = await userModel.saveUser(UserObj);

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
    
            const planSave = activePlanModel.savePlan(currentPlan)

            const encodedData = {
                id: userSave._id,
                accessToken: userSave.accessToken,
                shopUrl: userSave.shopUrl,
                email: userSave.email,
                role: userSave.role,
            };
            // generate accessToken using JWT
            const jwtToken = jwt.sign(encodedData, process.env['SECRET']);
    
            let resObj = { _id: userSave._id, shopUrl: userSave.shopUrl, storeName: userSave.storeName, email: userSave.email, phone: userSave.phone, storeId: userSave.storeId, passwordSet: userSave.passwordSet };
            // let planObj = { planName: currentPlan.planName, status: currentPlan.status, type: currentPlan.type, started: currentPlan.started }
    
            rcResponse.data = { ...resObj, token: jwtToken};
    
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

    const findUser = await userModel.getUserByShopUrl(shopData.shopUrl);
    console.log(findUser);
    // const findUser = await userSchema.findOne({ shopUrl: shopData.shopUrl, deleted:false }).lean().exec();
    try {
        if (!findUser) {
            let response = await createShop(req, res, shopData, rcResponse, httpStatus);
            httpStatus = response.httpStatus;
            rcResponse = response.rcResponse;
            
        }else{
            const userSave = await userModel.updateUser(findUser._id, { accessToken: shopData.accessToken, deleted: false });
            console.log(userSave);
            // const userSave = await userSchema.findOneAndUpdate({ _id: findUser._id }, { $set: { accessToken: shopData.accessToken, deleted: false } }, { new: true }).lean().exec();
            const currentPlan = await activePlanModel.findActivePlanByUserId(findUser._id);

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

    let shopData = await generatorAcessToekn(req, res, httpStatus, rcResponse);
    console.log(shopData);

    let response = await createOrUpdateShop(req, res, shopData, rcResponse, httpStatus);
    console.log(response);


    return res.status(response.httpStatus).send(response.rcResponse);
};

module.exports.setPassword = async (req, res) => {
    /* Contruct response object */
    let rcResponse = new ApiResponse();
    let httpStatus = 200;

    try {
        /* Check if email exists */
        const findUser = await userModel.getUserById(req.decoded.id);
        // const findUser = await userSchema.findOne({ _id: req.decoded.id }).lean().exec();
        if (findUser) {
            const passHash = await utils.generatePasswordHash(req.body.password);
            const updateUser = await userModel.updateUser(findUser._id, { password: passHash, passwordSet: true });
            // const updateUser = await userSchema.findOneAndUpdate({ _id: findUser._id }, { $set: { password: passHash, passwordSet: true } }, { new: true }).lean().exec();

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


module.exports.deleteApp = async (req, res) => {
    let rcResponse = new ApiResponse();
    let httpStatus = 200;

    try {
        const user = await userModel.getUserByStoreId(req.body.id);
        if(user){
            let [deleteUser, deleteSession,deleteProduct, deleteOrder, deleteDiscount, deleteAnalyticOrder, deleteActivePlan ] = await Promise.all([
                await userModel.deleteManyByShopUrl(user.shopUrl),
                await sessionModel.deleteManyByShopUrl(user.shopUrl),
                await productModel.deleteManyByShopUrl(user.shopUrl),
                await orderModel.deleteManyByShopUrl(user.shopUrl),
                await discountModel.deleteManyByShopUrl(user.shopUrl),
                await analyticOrderModel.deleteManyByShopUrl(user.shopUrl),
                await activePlanModel.deleteManyByShopUrl(user.shopUrl)
            ]);

            rcResponse.data = {
                user:deleteUser,
                session:deleteSession,
                product:deleteProduct,
                order:deleteOrder,
                discount:deleteDiscount,
                analyticOrder:deleteAnalyticOrder,
                activePlan:deleteActivePlan,
            };
        }else{
			SetResponse(rcResponse, httpStatus, RequestErrorMsg('ShopNotExists', req, null), false);
        }
    } catch (err) {
        SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
        httpStatus = 500;
    }
    return res.status(httpStatus).send(rcResponse);
};

