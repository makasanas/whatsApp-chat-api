const { ApiResponse } = require('./../helpers/common');
const { handleError, handleshopifyRequest, getPaginationLink } = require('./../helpers/utils');
const productModel = require('./../model/product')
const productTypeModel = require('./../model/productType');
const productSyncDetailModel = require('./../model/productSyncDetail');
const userModel = require('./../model/user')
const mongoose = require('mongoose');

module.exports.getProductFilter = async (req, res) => {
    /* Contruct response object */
    let rcResponse = new ApiResponse();
    let { decoded, body } = req;
    try {
        rcResponse.data = body;
        let limit = body.limit ? parseInt(body.limit) : 50;
        let skip = body.page ? ((parseInt(body.page)) * (limit)) : 0;
        let sort = { created: -1 };
        let userQuery = { userId: mongoose.Types.ObjectId(decoded.id) };
        let findQuery = {};
        if (body.filters) {
            body.filters.forEach(filter => {
                if (filter.type) {
                    if (filter.value == 'true' || filter.value == 'false') {
                        findQuery[filter.type + '.' + filter.key] = JSON.parse(filter.value);
                    } else {
                        var regex = new RegExp(["^", filter.value, "$"].join(""), "i");
                        if (filter.key === 'title') {
                            regex = new RegExp(`^${filter.value}`, 'i');
                        }
                        findQuery[filter.type + '.' + filter.key] = regex;
                    }
                } else {
                    var regex = new RegExp(["^", filter.value, "$"].join(""), "i");
                    findQuery[filter.key] = regex;
                }
            });
        }

        const products = await productModel.getProductFilter(findQuery, userQuery, skip, limit, sort);
        if (products.length) {
            rcResponse.data = products[0];
        } else {
            rcResponse.data = {}
        }
    } catch (err) {
        handleError(err, rcResponse);
    }
    return res.status(rcResponse.code).send(rcResponse);
};

module.exports.syncProducts = async (req, res) => {
    let rcResponse = new ApiResponse();
    let { decoded } = req;
    try {
        let product_type = [];
        let totalProduct = 0;
        // here we need logic for plan upgread before it's sync all other product 
        

        await getAllProducts('https://' + decoded.shopUrl + process.env.apiVersion + 'products.json?limit=250', decoded, product_type, totalProduct);
        rcResponse.data = true;
    } catch (err) {
        handleError(err, rcResponse);
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
                    shopifyData: product
                }
                if (product.product_type !== '') {
                    let str = product.product_type;
                    str = str.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
                    product_type.indexOf(str) === -1 ? product_type.push(str) : '';
                }

                promise.push(
                    {
                        updateOne: {
                            filter: { productId: data.productId },
                            update: data,
                            "upsert": true
                        }
                    }
                )
            });

            await productModel.bulkWrite(promise);
            totalProduct += promise.length;
            await getAllProducts(pagination.next, decoded, product_type, totalProduct);
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
            await userModel.findOneAndUpdate({ _id: decoded.id }, { $set: { productCount: totalProduct } });
            return true;
        }
    } catch (err) {
        console.log(err);
        throw err;
    }
}