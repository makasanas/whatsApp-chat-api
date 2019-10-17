/*
FileName : authCtrl.js
Date : 2nd Aug 2018
Description : This file consist of functions related to user's authentication
*/

/* DEPENDENCIES */
const { SetResponse, RequestErrorMsg, ErrMessages, ApiResponse } = require('./../helpers/common');
const userModel = require('./../model/user');
const { handleError } = require('./../helpers/utils');
const request = require('request');


/* Get user's profile information */
module.exports.getUserProfile = async (req, res) => {
	/* Contruct response object */
	let rcResponse = new ApiResponse();
	let httpStatus = 200;

	try {
		const { decoded } = req;
		const userData = await userModel.getUserById(decoded.id);

		rcResponse.data = { ...userData };
	} catch (err) {
		SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
		httpStatus = 500;
	}
	return res.status(httpStatus).send(rcResponse);
};


module.exports.checkToken = async (req, res) => {
	let rcResponse = new ApiResponse();
	let httpStatus = 200;
	const { decoded } = req; 

    try {
		const user = await userModel.getUserById(decoded.id);
		if(!user){
			httpStatus = 404
			SetResponse(rcResponse, httpStatus, RequestErrorMsg('ShopNotExists', req, null), false);
		}else{
			SetResponse(rcResponse, httpStatus, RequestErrorMsg('ShopExists', req, null), true);
		}		
    } catch (error) {
		httpStatus = 500;
		SetResponse(rcResponse, httpStatus, RequestErrorMsg(null, req, err), false);
	}
	
	return res.status(httpStatus).send(rcResponse);
}



module.exports.generateAuthToken = async (req, res) => {
	let rcResponse = new ApiResponse();
	const { decoded, query } = req;

	try {
		await request.post({
			url: 'https://oauth2.googleapis.com/token',
			form: {
				code: query.code,
				client_id: '825133742036-5aj1qk5sdfni90g5175pma62kssgb52e.apps.googleusercontent.com',
				client_secret: 'Dpnn4i-fFjDljBGUbV21GzRL',
				grant_type: 'authorization_code',
				redirect_uri: query.redirect_uri
			}
		}, async (err, httpResponse, body) => {
			body = JSON.parse(body);
			if (body.error) {
				rcResponse.code = 400;
				handleError({ "name": "googleAuthError" }, req, rcResponse);
				return res.status(rcResponse.code).send(rcResponse);
			} else {

				let options = {
					method: 'GET',
					url: 'https://www.googleapis.com/content/v2.1/accounts/authinfo',
					json: true,
					headers: {
						'content-type': 'application/json',
						'authorization': 'Bearer ' + body.access_token
					},
				};

				request.get(options, async (err, httpResponse, response) => {
					if (response.error) {
						rcResponse.code = 400;
						handleError({ "name": "googleAuthError" }, req, rcResponse);
						return res.status(rcResponse.code).send(rcResponse);
					} else {
						body.merchantId = response.accountIdentifiers[0].merchantId;
						const user = await userModel.updateUser(decoded.id, body);
						rcResponse.data = user;
						return res.status(rcResponse.code).send(rcResponse);
					}
				})
			}
		})
	} catch (err) {
		handleError(err, req, rcResponse);
		return res.status(rcResponse.code).send(rcResponse);
	}
}


module.exports.refreshToken = async (req, res) => {
	let rcResponse = new ApiResponse();
	const { decoded, query } = req;
	try{
		const user = await userModel.getUserById(decoded.id);
		console.log(user);
		request.post({
			url: 'https://oauth2.googleapis.com/token',
			form: {
				client_id: '825133742036-5aj1qk5sdfni90g5175pma62kssgb52e.apps.googleusercontent.com',
				client_secret: 'Dpnn4i-fFjDljBGUbV21GzRL',
				grant_type: 'refresh_token',
				refresh_token: user.refresh_token
			}
		}, async (err, httpResponse, body) => {
			body = JSON.parse(body);
			console.log(body);
			if (body.error) {
				rcResponse.code = 400;
				handleError({ "name": "googleAuthError" }, req, rcResponse);
				return res.status(rcResponse.code).send(rcResponse);
			} else {
				const user = await userModel.updateUser(decoded.id, body);
				rcResponse.data = user;
				return res.status(rcResponse.code).send(rcResponse);
			}
		})
	}catch (err) {
		handleError(err, req, rcResponse);
		return res.status(rcResponse.code).send(rcResponse);
	}
}