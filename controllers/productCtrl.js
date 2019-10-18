const request = require('request-promise');
const { SetResponse, RequestErrorMsg, ErrMessages, ApiResponse, signedCookies, normalCookes, generateRandom } = require('./../helpers/common');
var Algorithmia = require("algorithmia");
const productModel = require('./../model/product');
const shopifyReuest = require('./../helpers/shopifyReuest.js');
const { handleError, handlePromiseRequest, accessToken } = require('./../helpers/utils');
const { OAuth2Client } = require('google-auth-library');
const userModel = require('./../model/user')
var rp = require('request-promise');

const client = new OAuth2Client(process.env.client_id);

module.exports.get = async (req, res) => {
    let rcResponse = new ApiResponse();
    let { decoded, query } = req;
    let countQuery = '?';
    let productQuery = '?';

    try {

        productQuery += query.title ? 'title=' + query.title : '';
        productQuery += query.collection_id ? '&collection_id=' + query.collection_id : '';
        productQuery += query.created_at_min ? '&created_at_min=' + query.created_at_min : '';
        productQuery += query.created_at_max ? '&created_at_max=' + query.created_at_max : '';
        productQuery += query.published_status ? '&published_status=' + query.published_status : '';

        countQuery = productQuery;
        productQuery += query.limit ? '&limit=' + query.limit : '';
        productQuery += query.since_id ? '&since_id=' + query.since_id : '';
        productQuery += query.page ? '&page=' + query.page : '';



        let promiseArray = [
            shopifyCalls('https://' + decoded.shopUrl + '/admin/api/2019-04/products.json' + productQuery, decoded.accessToken),
            shopifyCalls('https://' + decoded.shopUrl + '/admin/api/2019-04/products/count.json' + countQuery, decoded.accessToken)
        ]

        await Promise.all(promiseArray).then(async responses => {
            console.log(responses[0].headers['x-shopify-shop-api-call-limit']);
            console.log(responses[0].headers['http_x_shopify_shop_api_call_limit']);
            console.log(responses[0].headers['Retry-After']);

            rcResponse.data = { ...responses[0].body, ...responses[1].body }
        }).catch(function (err) {
            handleError(err, req, rcResponse);
        });
    } catch (err) {
        handleError(err, req, rcResponse);
    }
    return res.status(rcResponse.code).send(rcResponse);
};

shopifyCalls = async (url, accessToken) => {
    try {
        return new Promise(function (resolve, reject) {
            shopifyReuest.get(url, accessToken).then(function (response) {
                resolve(response)
            }).catch(function (err) {
                reject(err);
            });
        })
    } catch (err) {
        throw err;
    }
}


module.exports.getCollection = async (req, res) => {
    let rcResponse = new ApiResponse();
    let { decoded } = req;
    try {
        let promiseArray = [
            shopifyCalls('https://' + decoded.shopUrl + '/admin/api/2019-07/custom_collections.json', decoded.accessToken),
            shopifyCalls('https://' + decoded.shopUrl + '/admin/api/2019-07/smart_collections.json', decoded.accessToken),
        ]

        await Promise.all(promiseArray).then(async responses => {
            console.log(responses[0].headers['x-shopify-shop-api-call-limit']);
            console.log(responses[0].headers['http_x_shopify_shop_api_call_limit']);
            console.log(responses[0].headers['Retry-After']);

            let collections = responses[0].body.custom_collections.concat(responses[1].body.smart_collections);

            rcResponse.data = {
                collections: collections
            }
        }).catch(function (err) {
            handleError(err, req, rcResponse);
        });
    } catch (err) {
        handleError(err, req, rcResponse);
    }
    return res.status(rcResponse.code).send(rcResponse);
};


module.exports.create = async (req, res) => {
    let rcResponse = new ApiResponse();
    let { body, decoded } = req;
    try {
        let user = await accessToken(decoded.id)

        let options = {
            method: 'POST',
            url: 'https://www.googleapis.com/content/v2.1/products/batch',
            body: body,
            json: true,
            headers: {
                'content-type': 'application/json',
                'authorization': 'Bearer ' + user.access_token
            },
        };

        var productData = await handlePromiseRequest(options);
        let products = [];

        productData.entries.forEach((product, index) => {
            let info = { ...product.product, ...body.entries[index].product }
            let data = {
                shopUrl: decoded.shopUrl,
                productId: body.entries[index].product.offerId,
                userId: decoded.id,
                info: info,
                status: 'submitted',
                updated: Date.now()
            }
            products.push(data);
        });

        console.log(products);
        console.log(products.length);
        productData = await productModel.insertMany(products);

        rcResponse.data = productData;
    } catch (err) {
        handleError(err, req, rcResponse);
    }
    return res.status(rcResponse.code).send(rcResponse);
}

module.exports.getProductCount = async (req, res) => {
    let rcResponse = new ApiResponse();
    let { decoded } = req;
    console.log(decoded);
    try {
        let url = 'https://' + decoded.shopUrl + '/admin/api/2019-04/products/count.json';

        await shopifyReuest.get(url, decoded.accessToken).then(async function (response) {
            
            let user = {
                productCount:response.body.count
            }

            await userModel.updateUser(decoded.id, user);
            rcResponse.data = response.body;
            return res.status(rcResponse.code).send(rcResponse);
        }).catch(function (err) {
            console.log(err);
            SetResponse(rcResponse, err.statusCode, RequestErrorMsg(null, req, err.error), false);
            return res.status(rcResponse.code).send(rcResponse);
        });

    } catch (err) {
        handleError(err, req, rcResponse);
        return res.status(rcResponse.code).send(rcResponse);
    }
}

module.exports.productStatuses = async (req, res) => {
    let rcResponse = new ApiResponse();
    let { body, decoded } = req;
    try {
        let user = await accessToken(decoded.id)

        let options = {
            method: 'POST',
            url: 'https://www.googleapis.com/content/v2.1/productstatuses/batch',
            body: body,
            json: true,
            headers: {
                'content-type': 'application/json',
                'authorization': 'Bearer ' + user.access_token
            },
        };

        console.log(options);

        var productData = await handlePromiseRequest(options);
        rcResponse.data = productData;
    } catch (err) {
        handleError(err, req, rcResponse);
    }
    return res.status(rcResponse.code).send(rcResponse);
}


module.exports.accountStatuses = async (req, res) => {
    let rcResponse = new ApiResponse();
    let { body, decoded } = req;
    try {
        let user = await accessToken(decoded.id)

        let options = {
            method: 'POST',
            url: 'https://www.googleapis.com/content/v2/accountstatuses/batch',
            body: body,
            json: true,
            headers: {
                'content-type': 'application/json',
                'authorization': 'Bearer ' + user.access_token
            },
        };

        var productData = await handlePromiseRequest(options);
        rcResponse.data = productData;
    } catch (err) {
        handleError(err, req, rcResponse);
    }
    return res.status(rcResponse.code).send(rcResponse);
}



module.exports.singleProductStatuses = async (req, res) => {
    let rcResponse = new ApiResponse();
    let { body, decoded, params } = req;
    try {
        let user = await accessToken(decoded.id)

        let options = {
            method: 'GET',
            url: 'https://www.googleapis.com/content/v2.1/' + user.merchantId + '/productstatuses/' + params.productId + '?destinations=SurfacesAcrossGoogle',
            json: true,
            headers: {
                'content-type': 'application/json',
                'authorization': 'Bearer ' + user.access_token
            },
        };

        var productData = await handlePromiseRequest(options);
        rcResponse.data = productData;
    } catch (err) {
        handleError(err, req, rcResponse);
    }
    return res.status(rcResponse.code).send(rcResponse);
}

