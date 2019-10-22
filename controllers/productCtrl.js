const { ApiResponse } = require('./../helpers/common');
const shopifyReuest = require('./../helpers/shopifyReuest.js');
const { handleError } = require('./../helpers/utils');
const userModel = require('./../model/user')

module.exports.get = async (req, res) => {
    let rcResponse = new ApiResponse();
    let { decoded, query } = req;
    let countQuery = '?';
    let productQuery = '?';
    let promiseArray = [];
    try {
        if (!query.link) {
            productQuery += query.title ? 'title=' + query.title : '';
            productQuery += query.collection_id ? '&collection_id=' + query.collection_id : '';
            productQuery += query.created_at_min ? '&created_at_min=' + query.created_at_min : '';
            productQuery += query.created_at_max ? '&created_at_max=' + query.created_at_max : '';
            productQuery += query.published_status ? '&published_status=' + query.published_status : '';
            productQuery += query.fields ? '&fields=' + query.fields : '';

            countQuery = productQuery;
            productQuery += query.limit ? '&limit=' + query.limit : '';
            productQuery += query.since_id ? '&since_id=' + query.since_id : '';
            promiseArray = [
                shopifyCalls('https://' + decoded.shopUrl + process.env.apiVersion + 'products.json' + productQuery, decoded.accessToken),
                shopifyCalls('https://' + decoded.shopUrl + process.env.apiVersion + 'products/count.json' + countQuery, decoded.accessToken)
            ]
        } else {
            promiseArray = [
                shopifyCalls(query.link, decoded.accessToken)
            ]
        }

        await Promise.all(promiseArray).then(async responses => {
            if (responses[0].headers['link']) {
                links = responses[0].headers['link'].split(',');
                var obj = {};
                links.forEach((link) => {
                    link = link.split(';');
                    obj[link[1].trim().substr(5).slice(0, -1)] = link[0].trim().substr(1).slice(0, -1);
                })
            }

            if (responses.length == 2) {
                rcResponse.data = { ...responses[0].body, ...responses[1].body, pagination: obj }
            } else {
                rcResponse.data = { ...responses[0].body, pagination: obj }
            }
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
            console.log(url);
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
            shopifyCalls('https://' + decoded.shopUrl + process.env.apiVersion + 'custom_collections.json', decoded.accessToken),
            shopifyCalls('https://' + decoded.shopUrl + process.env.apiVersion + 'smart_collections.json', decoded.accessToken),
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


module.exports.getProductCount = async (req, res) => {
    let rcResponse = new ApiResponse();
    let { decoded } = req;
    console.log(decoded);
    try {
        let url = 'https://' + decoded.shopUrl + process.env.apiVersion + 'products/count.json';
        console.log(url);
        await shopifyReuest.get(url, decoded.accessToken).then(async function (response) {

            let user = {
                productCount: response.body.count
            }

            await userModel.updateUser(decoded.id, user);
            rcResponse.data = response.body;
            return res.status(rcResponse.code).send(rcResponse);
        }).catch(function (err) {
            handleError(err, req, rcResponse);
            return res.status(rcResponse.code).send(rcResponse);
        });

    } catch (err) {
        handleError(err, req, rcResponse);
        return res.status(rcResponse.code).send(rcResponse);
    }
}
