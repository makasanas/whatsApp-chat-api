const { SetError, ApiResponse } = require('./../helpers/common');
const { handleError, verify, handleshopifyRequest, mailWithTemplate, getNextWeekDate } = require('./../helpers/utils');
var url = require('url');
const jwt = require('jsonwebtoken');
const commonModel = require('./../model/common');
var moment = require('moment');


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
        let trial_days;
        let deletedUser = await commonModel.findOne('deletedUser', { shopUrl: shop.myshopify_domain });
        if (deletedUser) {
            trial_days = deletedUser.trial_days
        }

        let data = {
            $set: {
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
                trial_days: trial_days
            }
        };

        let user = await commonModel.findOneAndUpdate('user', { shopUrl: shop.myshopify_domain }, data);

        if (user) {
            mailWithTemplate(user, "Welcome To Starter Kit", "register");
        }

        var utc = new Date().toJSON().slice(0, 10);

        let plan = {
            shopUrl: shop.myshopify_domain,
            userId: user._id,
            planName: "Free",
            planPrice: 0,
            status: "active",
            type: "monthly",
            products: 5,
            currentMonthStartDate: new Date(utc),
            nextMonthStartDate: new Date(new Date(utc).getTime() + (30 * 24 * 60 * 60 * 1000)),
            chargeInfo: {
                startDate: new Date(utc),
                planName: "Free",
                planPrice: 0,
            }
        }

        plan = await commonModel.findOneAndUpdate('activePlan', { shopUrl: shop.myshopify_domain }, plan);

        let email = {
            $set: {
                shopUrl: shop.myshopify_domain,
                userId: user._id,
                days: new Date().getDay(),
                hour: new Date().getHours(),
            }
        }

        await commonModel.findOneAndUpdate('emailNotification', { shopUrl: shop.myshopify_domain }, email);

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

        let user = await commonModel.findOne('user', { shopUrl: shopData.shopUrl });
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
                if (process.env.productCount === 'true') {
                    productCount = res[1].body.count;
                }

                let data = await createShop(shop, productCount, shopData);
                user = data.user;
                plan = data.plan;

                //adding next review date after 7 days
                let nextReviewDate = moment(await getNextWeekDate(user)).add(7, 'days');
                await commonModel.findOneAndUpdate('user', { shopUrl: user.shopUrl }, { nextReviewDate: nextReviewDate, reviewMailCount: 0 })

            }).catch(function (err) {
                throw err;
            });

        } else {
            plan = await commonModel.findOne('activePlan', { userId: user._id });
        }
        // console.log(shopData);
        const encodedData = {
            id: user._id,
            shopUrl: user.shopUrl,
            role: shopData.role ? shopData.role : user.role,
            accessToken: user.accessToken
        };

        if (shopData.adminId) {
            encodedData['adminId'] = shopData.adminId;
        }

        // console.log(encodedData);

        // generate accessToken using JWT
        const jwtToken = jwt.sign(encodedData, process.env['SECRET']);

        let userObj = { shopUrl: user.shopUrl, storeName: user.storeName, email: user.email, phone: user.phone, recurringPlanType: user.recurringPlanType };
        let planObj = { planName: plan.planName, status: plan.status }

        response = { ...userObj, ...planObj, token: jwtToken };
    } catch (err) {
        console.log(err);
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
    let { body } = req;
    try {
        // console.log(sanjay);
        let user = await commonModel.findOne('user', { storeId: body.id });
        console.log(user);
        if (user) {
            user.userId = user._id;
            user.updated = Date.now();
            // console.log(date_diff_indays(user.trial_start, Date.now()));

            if (user.trial_days && user.trial_start) {
                user.trial_days = user.trial_days - date_diff_indays(user.trial_start, Date.now()) < 0 ? 0 : user.trial_days - date_diff_indays(user.trial_start, Date.now());
            }


            delete user._id;

            await commonModel.findOneAndUpdate('deletedUser', { shopUrl: user.shopUrl }, { $set: user });

            let promise = [
                commonModel.deleteMany('user', { shopUrl: user.shopUrl }),
                commonModel.deleteMany('activePlan', { shopUrl: user.shopUrl }),
                commonModel.deleteMany('emailNotification', { shopUrl: user.shopUrl }),
                commonModel.deleteMany('product', { shopUrl: user.shopUrl }),
                commonModel.deleteMany('productType', { shopUrl: user.shopUrl }),
                commonModel.deleteMany('syncDetail', { shopUrl: user.shopUrl })
            ]

            await Promise.all(promise).then(async () => {
                mailWithTemplate(user, "Please Help us Improve", "uninstall");
                rcResponse.data = true;
            }).catch((err) => {
                throw err;
            });
        }
    } catch (err) {
        handleError(err, rcResponse);
    }
    return res.status(rcResponse.code).send(rcResponse);
};

var date_diff_indays = function (date1, date2) {
    dt1 = new Date(date1);
    dt2 = new Date(date2);
    return Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate())) / (1000 * 60 * 60 * 24));
}


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


module.exports.getEnabledApp = async (req, res) => {
    let rcResponse = new ApiResponse();
    let httpStatus = 200;

    try {
        const AppStatus = await commonModel.findOne('user', { shopUrl: req.query.shopUrl });

        let app;
        if (AppStatus) {
            app = { appEnabled: AppStatus.appEnabled }
        } else {
            throw err;
        }
        rcResponse.data = { app };
    } catch (err) {
        handleError(err, rcResponse);
    }
    return res.status(httpStatus).send(rcResponse);
};

module.exports.changeAppStatus = async (req, res) => {
    let rcResponse = new ApiResponse();
    let { decoded, body } = req;

    try {
        let data = {
            $set: {
                appEnabled: body.appEnabled
            }
        }
        rcResponse.data = await commonModel.findOneAndUpdate('user', { _id: decoded.id }, data);
    } catch (err) {
        handleError(err, rcResponse);
    }
    return res.status(rcResponse.code).send(rcResponse);
};

addScript = async (decoded) => {
    try {
        let scripts = await handleshopifyRequest('get', 'https://' + decoded.shopUrl + process.env.apiVersion + 'script_tags.json', decoded.accessToken);
        scripts = scripts.body.script_tags.filter(function (script) {
            return script.src == process.env.appUrl + '/js/tab.js';
        });

        if (scripts.length === 0) {
            let body = {
                "script_tag": {
                    "event": "onload",
                    "src": process.env.appUrl + '/js/tab.js',//ADD HERE YOUR SCRIPT PATH
                    "display_scope": "online_store"
                }
            };

            await handleshopifyRequest('post', 'https://' + decoded.shopUrl + process.env.apiVersion + 'script_tags.json', decoded.accessToken, body);
        }
    } catch (err) {
        throw err;
    }
    return true;
};

removeScript = async (decoded) => {
    try {

        let scriptDeleteArray = [];

        let scripts = await handleshopifyRequest('get', 'https://' + decoded.shopUrl + process.env.apiVersion + 'script_tags.json', decoded.accessToken);

        scripts.body.script_tags.forEach(async (element, index) => {
            scriptDeleteArray.push(handleshopifyRequest('delete', 'https://' + decoded.shopUrl + process.env.apiVersion + 'script_tags/' + element.id + '.json', decoded.accessToken));
        });

        await Promise.all(scriptDeleteArray).then(async responses => {
            return true;
        }).catch(function (err) {
            throw err;
        });

    } catch (err) {
        throw err;
    }

};
