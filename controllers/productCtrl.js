const request = require('request-promise');
const { SetResponse, RequestErrorMsg, ErrMessages, ApiResponse, signedCookies, normalCookes, generateRandom } = require('./../helpers/common');
var Algorithmia = require("algorithmia");
const productModel = require('./../model/product');
const shopifyReuest = require('./../helpers/shopifyReuest.js');
const { handleError } = require('./../helpers/utils');


module.exports.get = async (req, res) => {
    let rcResponse = new ApiResponse();
    let { decoded, query } = req;
    let countQuery = '?';
    let productQuery = '?';

    try {

        productQuery += query.title ? 'title=' +query.title : '';
        productQuery += query.collection_id ? '&collection_id=' + query.collection_id : '';
        // productQuery += query.vendor ? '&vendor=' + query.vendor : '';
        // productQuery += query.product_type ? '&product_type=' + query.product_type : '';
        productQuery += query.created_at_min ? '&created_at_min=' + query.created_at_min : '';
        productQuery += query.created_at_max ? '&created_at_max=' + query.created_at_max : '';
        productQuery += query.published_status ? '&published_status=' + query.published_status : '';

        countQuery = productQuery;
        productQuery += query.limit ? '&limit=' + query.limit : '';
        productQuery += query.since_id ? '&since_id=' + query.since_id : '';
        productQuery += query.page ? '&page=' + query.page : '';



        let promiseArray = [
            shopifyCalls('https://' + decoded.shopUrl + '/admin/api/2019-04/products.json'+productQuery, decoded.accessToken),
            shopifyCalls('https://' + decoded.shopUrl + '/admin/api/2019-04/products/count.json'+countQuery, decoded.accessToken)
        ]

        await Promise.all(promiseArray).then(async responses => {
            console.log(responses[0].headers['x-shopify-shop-api-call-limit']);
            console.log(responses[0].headers['http_x_shopify_shop_api_call_limit']);
            console.log(responses[0].headers['Retry-After']);

            rcResponse.data = { ...responses[0].body, ...responses[1].body }
        }).catch(function(err) {
            handleError(err,req, rcResponse);
        });
    } catch (err) {
        handleError(err,req, rcResponse);
    }
    return res.status(rcResponse.code).send(rcResponse);
};

shopifyCalls = async (url, accessToken) =>{
    try {
        return new Promise(function(resolve, reject) {
            shopifyReuest.get(url, accessToken).then(function (response) {
                resolve(response)
            }).catch(function (err) {
                reject(err);
            });
          })
    }catch (err) {
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
                collections:collections
            }
        }).catch(function(err) {
            handleError(err,req, rcResponse);
        });
    } catch (err) {
        handleError(err, req, rcResponse);
    }
    return res.status(rcResponse.code).send(rcResponse);
};


betterDescription = async (input) => {
    var result;
    if(input.length < 200){
    	input = result;
    }else {
      do {
        console.log(input.length);
        console.log("time it's run", input.length);
        var lines = input.split(".");
        console.log(lines.length);
        if(lines.length == 2){
            result = input;
        }else{
            lines.splice(-2, 2)
            result = lines.join(".")+'.';
            console.log(result.length);
            input = result;   
        }
      }while (input.length >= 200 && lines.length == 2);
	}
    return {
        text : result,
        length : result.length + 1
    } 
}





module.exports.getDescription = async (req, res) => {
	let rcResponse = new ApiResponse();
    let httpStatus = 200;
    let {  decoded } = req;
    let { product, input } = req.body;
    console.log(decoded);
	try {
        await new Promise(function(resolve, reject) {
            if(req.body.input.length > 100){
                Algorithmia.client("sim7vmAg6g0I7IlqvcOGfLnYxMa1").algo("nlp/Summarizer/0.1.8").pipe(req.body.input).then( async (response) => {
                    let input = response.get();
                    rcResponse.data = await betterDescription(input.replace(/\s\s+/g, ' ').trim());
                    resolve(true);
                })
            }else{
                rcResponse.data = {
                    text : req.body.input,
                    length : req.body.input.length 
                }
            }
        })
        
        let productObj = {
            shopUrl: decoded.shopUrl,
            productId:  product.id,
            userId: decoded.id,
            image: product.image.src,
            title: product.title,
            description: rcResponse.data.text,
            url: product.handle
        }
        rcResponse.data = await productModel.creat(productObj);

	} catch (error) {
		httpStatus = 500;
		SetResponse(rcResponse, httpStatus, RequestErrorMsg(null, req, error), false);
    }
    
    return res.status(httpStatus).send(rcResponse);
}


