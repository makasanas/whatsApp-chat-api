const request = require('request-promise');
const { SetResponse, RequestErrorMsg, ErrMessages, ApiResponse, signedCookies, normalCookes, generateRandom } = require('./../helpers/common');
var Algorithmia = require("algorithmia");
const productModel = require('./../model/product');

module.exports.get = async (req, res) => {
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

        let productUrl = 'https://' + req.decoded.shopUrl + '/admin/products.json';
        let countUrl = 'https://' + req.decoded.shopUrl + '/admin/products/count.json' + countQuery;

        let product = {
            method: 'GET',
            uri: productUrl,
            json: true,
            headers: {
                'X-Shopify-Access-Token': req.decoded.accessToken,
                'content-type': 'application/json'
            }
        };

        let count = {   
            method: 'GET',
            uri: countUrl,
            json: true,
            headers: {
                'X-Shopify-Access-Token': req.decoded.accessToken,
                'content-type': 'application/json'
            }
        };

        promiseArray.push(request(product))
        promiseArray.push(request(count))

        await Promise.all(promiseArray).then(async responses => {
            rcResponse.data = { ...responses[0], ...responses[1] }
            return res.status(httpStatus).send(rcResponse);
        })
    } catch (err) {
        SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
        httpStatus = 500;
        return res.status(httpStatus).send(rcResponse);

    }
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


