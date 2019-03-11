/*
FileName : utils.js
Date : 2nd Aug 2018
Description : This file consist of utility functions
*/
const request = require('request-promise');


module.exports.post = async (url, token, body ) => {
    let options = {
        method: 'POST',
        uri: url,
        json: true,
        resolveWithFullResponse: true,
        headers: {
            'X-Shopify-Access-Token': token,
            'content-type': 'application/json'
        },
        body: body
    };

    return await request.post(options);
}

module.exports.get = async (url, token) => {
    let options = {
        method: 'GET',
        uri: url,
        json: true,
        resolveWithFullResponse: true,//added this to view status code
        headers: {
            'X-Shopify-Access-Token': token,
            'content-type': 'application/json'
        },
    };
    return request.get(options);
}
