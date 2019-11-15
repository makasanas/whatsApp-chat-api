const { ApiResponse } = require('./../helpers/common');
const shopifyReuest = require('./../helpers/shopifyReuest.js');
const userModel = require('./../model/user')
const { handleError, handleshopifyRequest, getPaginationLink } = require('./../helpers/utils');
const productModel = require('./../model/product')
const productTypeModel = require('./../model/productType');
const productSyncDetailModel = require('./../model/productSyncDetail');


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
    try {
        let url = 'https://' + decoded.shopUrl + process.env.apiVersion + 'products/count.json';
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

// module.exports.syncProducts = async (req, res) => {
//     let rcResponse = new ApiResponse();

//     try {
//         let products = await getAllProducts(req, '', rcResponse,res);
//     } catch (err) {
//         handleError(err, req, rcResponse);
//     }
// }
// getAllProducts = async (req, next, rcResponse,res) => {
//     try {
//         let countQuery = '?';
//         let productQuery = '?';
//         let promiseArray = [];
//         let { decoded, query } = req;
//         if (next == '') {
//             productQuery += query.title ? 'title=' + query.title : '';
//             productQuery += query.collection_id ? '&collection_id=' + query.collection_id : '';
//             productQuery += query.created_at_min ? '&created_at_min=' + query.created_at_min : '';
//             productQuery += query.created_at_max ? '&created_at_max=' + query.created_at_max : '';
//             productQuery += query.published_status ? '&published_status=' + query.published_status : '';
//             productQuery += query.fields ? '&fields=' + query.fields : '';

//             countQuery = productQuery;
//             productQuery += query.limit ? '&limit=' + query.limit : '';
//             productQuery += query.since_id ? '&since_id=' + query.since_id : '';
//             promiseArray = [
//                 shopifyCalls('https://' + decoded.shopUrl + process.env.apiVersion + 'products.json' + productQuery, decoded.accessToken),
//             ]
//         } else {
//             promiseArray = [
//                 shopifyCalls(next, decoded.accessToken)
//             ]
//         }
//         await Promise.all(promiseArray).then(async responses => {
//             if (responses[0].headers['link']) {
//                 links = responses[0].headers['link'].split(',');
//                 var obj = {};
//                 links.forEach((link) => {
//                     link = link.split(';');
//                     obj[link[1].trim().substr(5).slice(0, -1)] = link[0].trim().substr(1).slice(0, -1);
//                 })
//             }
//             if (obj.next) {
//                 let productArray = [];
//                 productArray = responses[0].body.products;
//                 productArray.forEach(product => {
//                     let insertObj = {
//                         shopUrl: decoded.shopUrl,
//                         productId: product.id,
//                         userId: decoded.id,
//                         title: product.title,
//                         description: product.body_html,
//                         vendor: product.vendor,
//                         product_type: product.product_type,
//                         handle: product.handle,
//                         published_at: product.published_at,
//                         template_suffix: product.template_suffix,
//                         tags: product.tags,
//                         published_scope: product.published_scope,
//                         admin_graphql_api_id: product.admin_graphql_api_id,
//                         variants: product.variants,
//                         options: product.options,
//                         images: product.images,
//                         image: product.image,
//                     }
//                     productModal.syncProducts(insertObj);
//                 })
//                 getAllProducts(req, obj.next, rcResponse,res)
//             } else {
//                 return res.status(rcResponse.code).send(rcResponse);
//             }
//         }).catch(function (err) {
//             handleError(err, req, rcResponse);
//         });
//     } catch (err) {
//         throw err;
//     }
// }



module.exports.syncProducts = async (req, res) => {
    let rcResponse = new ApiResponse();
    let { decoded } = req;
    try {
        let product_type = [];
        let totalProduct = 0;

        await getAllProducts('https://' + decoded.shopUrl + process.env.apiVersion + 'products.json?limit=250', decoded, product_type, totalProduct);

        rcResponse.data = true;
    } catch (err) {
        handleError(err, req, rcResponse);
    }
    return res.status(rcResponse.code).send(rcResponse);
}

getAllProducts = async (next, decoded, product_type, totalProduct) => {
    try {
        if (next) {
            var productData = await handleshopifyRequest('get', next, decoded.accessToken);
            let pagination = await getPaginationLink(productData);

            let promise = [];
            productData.body.products.forEach((product) => {
                let data = {
                    userId: decoded.id,
                    shopUrl: decoded.shopUrl,
                    productId: product.id,
                    shopifyData: {
                        id: product.id,
                        title: product.title,
                        body_html: product.body_html,
                        vendor: product.vendor,
                        product_type: product.product_type,
                        handle: product.handle,
                        published_at: product.published_at,
                        template_suffix: product.template_suffix,
                        tags: product.tags,
                        published_scope: product.published_scope,
                        admin_graphql_api_id: product.admin_graphql_api_id,
                        variants: product.variants,
                        options: product.options,
                        images: product.images,
                        image: product.image,
                    }
                }
                if (product.product_type !== '') {
                    let str = product.product_type;
                    str = str.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
                    product_type.indexOf(str) === -1 ? product_type.push(str) : '';
                }
                promise.push(productModel.findOneAndUpdate(data));
            });

            await Promise.all(promise).then(async () => {
                totalProduct += productData.body.products.length;
                await getAllProducts(pagination.next, decoded, product_type, totalProduct);
            }).catch((err) => {
                throw err;
            });

        } else {
            // handel product type data 
            product_type.sort(function (a, b) {
                if (a < b) { return -1; }
                if (a > b) { return 1; }
                return 0;
            })
    
            let data = {
                product_type: product_type,
                userId: decoded.id,
                shopUrl: decoded.shopUrl
            }
            await productTypeModel.findOneAndUpdate({ userId: decoded.id }, data);

            // product count data in table 
            let syncDetail = {
                userId: decoded.id,
                shopUrl: decoded.shopUrl,
                totalProduct: totalProduct
            }

            await productSyncDetailModel.create(syncDetail);
            return true;
        }
    } catch (err) {
        throw err;
    }
}