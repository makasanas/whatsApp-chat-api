/*
FileName : utils.js
Date : 2nd Aug 2018
Description : This file consist of utility functions
*/

const { handlePromiseRequest } = require('./utils');



module.exports.post = async (url, token, body) => {
    try {
        let options = {
            method: 'POST',
            url: url,
            json: true,
            resolveWithFullResponse: true,
            headers: {
                'X-Shopify-Access-Token': token,
                'content-type': 'application/json'
            },
            body: body
        };

        return handlePromiseRequest(options);
    } catch (err) {
        throw err;
    }
}

module.exports.get = async (url, token) => {
    try {
        let options = {
            method: 'GET',
            url: url,
            json: true,
            resolveWithFullResponse: true,//added this to view status code
            headers: {
                'X-Shopify-Access-Token': token,
                'content-type': 'application/json'
            },
        };
        return handlePromiseRequest(options);
    } catch (err) {
        throw err;
    }
}

module.exports.delete = async (url, token) => {
    try {
        let options = {
            method: 'DELETE',
            url: url,
            json: true,
            resolveWithFullResponse: true,//added this to view status code
            headers: {
                'X-Shopify-Access-Token': token,
                'content-type': 'application/json'
            },
        };
        return handlePromiseRequest(options);
    } catch (err) {
        throw err;
    }

}

module.exports.put = async (url, token, body) => {
    try {
        let options = {
            method: 'PUT',
            url: url,
            json: true,
            resolveWithFullResponse: true,
            headers: {
                'X-Shopify-Access-Token': token,
                'content-type': 'application/json'
            },
            body: body
        };
        return handlePromiseRequest(options);
    } catch (err) {
        throw err;
    }
}

