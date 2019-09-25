/*
FileName : authCtrl.js
Date : 2nd Aug 2018
Description : This file consist of functions related to user's authentication
*/

/* DEPENDENCIES */
const { SetResponse, RequestErrorMsg, ErrMessages, ApiResponse } = require('./../helpers/common');
const userModel = require('./../model/user');
var crypto = require('crypto');


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