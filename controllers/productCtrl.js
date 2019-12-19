const { ApiResponse } = require('./../helpers/common');
const { handleError, handleshopifyRequest, getPaginationLink } = require('./../helpers/utils');
const mongoose = require('mongoose');
const commonModel = require('./../model/common');
const productModel = require('./../model/product');

module.exports.getProduct = async (req, res) => {
    /* Contruct response object */
    let rcResponse = new ApiResponse();
    let { query, decoded } = req;

    try {
        let limit = query.limit ? parseInt(query.limit) : 10;
        let skip = query.page ? ((parseInt(query.page) - 1) * (limit)) : 0;
        let sort = { created: - 1 };

        let userQuery = { userId: mongoose.Types.ObjectId(decoded.id), shopifyData: { $exists: true } };
        let searchQuery = [];

        if (query.search) {
            searchQuery.push({ $text: { $search: query.search } });
            sort = { score: { $meta: "textScore" }, created: - 1 };
        }
        if (query.type) {
            searchQuery.push({ 'shopifyData.product_type': { $regex: new RegExp(query.type, "i") } })
        }

        searchQuery.push(userQuery);

        let promise = [];
        promise.push(commonModel.findWithCount('product', searchQuery, skip, limit, sort));
        promise.push(productModel.getCount(userQuery));


        await Promise.all(promise).then(async (res) => {
            rcResponse.data = {
                result: res[0][0],
                count: res[1][0]
            }
        }).catch((err) => {
            throw err;
        });
    } catch (err) {
        handleError(err, rcResponse);
    }
    return res.status(rcResponse.code).send(rcResponse);
}

module.exports.syncProducts = async (req, res) => {
    let rcResponse = new ApiResponse();
    let { decoded } = req;
    try {
        let product_type = [];
        let allProducts = [];
        let totalProduct = 0;

        // here we need logic for plan upgread before it's sync all other product 
        await this.getAllProducts('https://' + decoded.shopUrl + process.env.apiVersion + 'products.json?limit=250', decoded, product_type, totalProduct, allProducts, rcResponse);

    } catch (err) {
        handleError(err, rcResponse);
    }
    return res.status(rcResponse.code).send(rcResponse);
}

module.exports.getAllProducts = async (next, decoded, product_type, totalProduct, allProducts, rcResponse) => {
    try {
        if (next) {
            var productData = await handleshopifyRequest('get', next, decoded.accessToken);
            let pagination = await getPaginationLink(productData);
            let products = [];
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

                products.push(
                    {
                        updateOne: {
                            filter: { productId: data.productId },
                            update: data,
                            "upsert": true,
                            "setDefaultsOnInsert": true
                        }
                    }
                )
            });

            await commonModel.bulkWrite('product', products);
            allProducts = allProducts.concat(products);
            await this.getAllProducts(pagination.next, decoded, product_type, totalProduct, allProducts, rcResponse);
        } else {
            rcResponse.data = await writeData(decoded, product_type, totalProduct, allProducts);
        }

    } catch (err) {
        throw err;
    }
}

writeData = async (decoded, product_type, totalProduct, allProducts) => {
    
    totalProduct = allProducts.length;

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

    await commonModel.findOneAndUpdate('productType', { shopUrl: decoded.shopUrl }, data);

    await commonModel.findOneAndUpdate('user', { _id: decoded.id }, { $set: { productCount: totalProduct } });

    let syncData = {
        $set: {
            shopUrl: decoded.shopUrl,
            userId: decoded.id,
            productSync: {
                lastSync: new Date(),
                status: 'Synced',
                count: totalProduct
            }
        }
    }

    return await commonModel.findOneAndUpdate('syncDetail', { shopUrl: decoded.shopUrl }, syncData);
}
