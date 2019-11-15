const { SetResponse, RequestErrorMsg, SetError, ApiResponse } = require('./../helpers/common');
const { handleError, verify, handleshopifyRequest } = require('./../helpers/utils');
const activePlanModel = require('./../model/activePlan');
var url = require('url');
const jwt = require('jsonwebtoken');
const userModel = require('./../model/user')
const productModel = require('./../model/product');
const deletedUserModel = require('./../model/deletedUser');

function securityCheck(req) {
    let securityPass = false;
    const regex = /^[a-z\d_.-]+[.]myshopify[.]com$/;

    try {
        let shopUrl = req.query.shop;

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
        if (verify(query)) {
            //get token
            securityPass = true;
        } else {
            //exit
            securityPass = false;
        }
    } catch (err) {
        throw err;
    }
    return securityPass && regex;
};

generatorAcessToekn = async (req) => {
    let accessToken;
    let scope;
    let appId = process.env.appId;
    let appSecret = process.env.appSecret;
    let shopUrl = req.query.shop;
    let code = req.query.code;

    try {
        if (securityCheck(req)) {
            let accessTokenRequestUrl = 'https://' + shopUrl + '/admin/oauth/access_token';
            let accessTokenPayload = {
                client_id: appId,
                client_secret: appSecret,
                code,
            };

            const response = await handleshopifyRequest('post', accessTokenRequestUrl, '', accessTokenPayload);
            accessToken = response.body.access_token;
            scope = response.body.scope;
        } else {
            throw SetError({}, 403, 'RequestNotFromShopify');
        }
    } catch (err) {
        throw err;
    }

    return {
        accessToken: accessToken,
        shopUrl: shopUrl,
        scope: scope
    }
}

createShop = async (shop, productCount, shopData) => {
    let response = {};
    try {
        let user = {
            storeName: shop.name,
            shopUrl: shop.myshopify_domain,
            domain: shop.domain,
            hasDiscounts: shop.has_discounts,
            storeId: shop.id,
            email: shop.email,
            currency: shop.currency,
            language: shop.primary_locale,
            country_code: shop.country_code,
            country_name: shop.country_name,
            plan_display_name: shop.plan_display_name,
            plan_name: shop.plan_name,
            phone: shop.phone,
            customer_email: shop.customer_email,
            accessToken: shopData.accessToken,
            scope: shopData.scope,
            productCount: productCount,
            recurringPlanName: 'Free',
            recurringPlanType: 'Free',
        };

        user = await userModel.create(user);

        var utc = new Date().toJSON().slice(0, 10);

        let plan = {
            shopUrl: shop.myshopify_domain,
            userId: user._id,
            planName: "Free",
            planPrice: 0,
            status: "active",
            type: "monthly",
            currentMonthStartDate: new Date(utc),
            nextMonthStartDate: new Date(new Date(utc).getTime() + (30 * 24 * 60 * 60 * 1000)),
            chargeInfo: {
                startDate: new Date(utc),
                planName: "Free",
                planPrice: 0,
            }
        }

        plan = await activePlanModel.create(plan);

        response = {
            plan: plan,
            user: user
        }

    } catch (err) {
        throw err;
    }
    return response;
}

createOrUpdateShop = async (shopData) => {
    var response = {};
    try {

        let user = await userModel.findOne({ shopUrl: shopData.shopUrl });
        let shop = {};
        let productCount = {};
        let plan = {};

        if (!user) {
            let promise = [];

            promise.push(handleshopifyRequest('get', 'https://' + shopData.shopUrl + process.env.apiVersion + 'shop.json', shopData.accessToken));

            if (process.env.productCount === 'true') {
                promise.push(handleshopifyRequest('get', 'https://' + shopData.shopUrl + process.env.apiVersion + 'products/count.json', shopData.accessToken));
            }

            if (process.env.webhook === 'true') {
                promise.push(createWebHook(shopData));
            }

            await Promise.all(promise).then(async (res) => {
                shop = res[0].body.shop;
                if (process.env.productCount !== 'false') {
                    productCount = res[1].body.count;
                }

                let data = await createShop(shop, productCount, shopData);
                user = data.user;
                plan = data.plan;
            }).catch(function (err) {
                throw err;
            });
        } else {
            plan = await activePlanModel.findOne({ userId: user._id });
        }

        const encodedData = {
            id: user._id,
            shopUrl: user.shopUrl,
            role: user.role,
            accessToken: user.accessToken
        };

        // generate accessToken using JWT
        const jwtToken = jwt.sign(encodedData, process.env['SECRET']);

        let userObj = { shopUrl: user.shopUrl, storeName: user.storeName, email: user.email, phone: user.phone, recurringPlanType: user.recurringPlanType };
        let planObj = { planName: plan.planName, status: plan.status }

        response = { ...userObj, ...planObj, token: jwtToken };
    } catch (err) {
        throw err;
    }
    return response;
}

checkAdmin = async (decoded) => {
    let data = {}
    try {
        if (decoded.role === 1) {
            data = {
                shopUrl: decoded.shopUrl,
                adminId: decoded.adminId,
                role: decoded.role,
            }
        } else {
            throw SetError({}, 403, 'RequestNotFromShopify');
        }
    } catch (err) {
        throw err;
    }
    return data;
}

module.exports.auth = async (req, res, next) => {
    let rcResponse = new ApiResponse();
    let shopData = {};
    let { decoded } = req;
    try {
        if (decoded && decoded.shopUrl) {
            //check user is admin or not
            shopData = await checkAdmin(decoded);
        } else {
            //gengenerate shop data for new user
            shopData = await generatorAcessToekn(req);
        }

        rcResponse.data = await createOrUpdateShop(shopData);
    } catch (err) {
        handleError(err, rcResponse);
    }
    return res.status(rcResponse.code).send(rcResponse);
};

module.exports.deleteApp = async (req, res) => {
    let rcResponse = new ApiResponse();
    try {
        let user = await userModel.getUserByStoreId(req.body.id);
        if (user) {
            user.userId = user._id;
            user.updated = Date.now();
            delete user._id;

            let userSave = await deletedUserModel.findOneAndUpdate(user);

            let [deleteUser, deleteActivePlan, deleteProduct, deleteQueue] = await Promise.all([
                await userModel.deleteManyByShopUrl(user.shopUrl),
                await activePlanModel.deleteManyByShopUrl(user.shopUrl),
                await productModel.deleteManyByShopUrl(user.shopUrl),
                await queueModel.deleteManyByShopUrl(user.shopUrl),
            ]);

            rcResponse.data = {
                user: deleteUser,
                activePlan: deleteActivePlan,
                product: deleteProduct,
                queue: deleteQueue
            };
        } 
    } catch (err) {
        handleError(err, rcResponse);
    }
    return res.status(rcResponse.code).send(rcResponse);
};


createWebHook = async (shopData) => {
    try {
        var hostname = process.env.apiUrl;
        let webhooks = [
            {
                "webhook": {
                    "topic": "app/uninstalled",
                    "address": hostname + "/webhooks/app/delete",
                    "format": "json"
                }
            }
        ]

        let promise = [];
        webhooks.forEach((webhook) => {
            promise.push(handleshopifyRequest('post', 'https://' + shopData.shopUrl + process.env.apiVersion + 'webhooks.json', shopData.accessToken, webhook));
        });

        await Promise.all(promise).then((res) => {
            return true;
        }).catch(function (err) {
            if (err.statusCode == 422 && err.message == '422 - {"errors":{"address":["for this topic has already been taken"]}}') {
                return true
            } else {
                throw err;
            }
        });
    } catch (err) {
        throw err;
    }

    return true;
}
