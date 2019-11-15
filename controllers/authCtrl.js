/*
FileName : authCtrl.js
Date : 2nd Aug 2018
Description : This file consist of functions related to user's authentication
*/

/* DEPENDENCIES */
const { ApiResponse, SetError } = require('./../helpers/common');
const { handleError } = require('./../helpers/utils');
const userModel = require('./../model/user');

/* Get user's profile information */
module.exports.getUserProfile = async (req, res) => {
	/* Contruct response object */
	let rcResponse = new ApiResponse();
	const { decoded } = req;

	try {
		rcResponse.data = await userModel.findOne({_id:decoded.id}, {accessToken:0});
	} catch (err) {
		handleError(err, rcResponse);
	}
	return res.status(rcResponse.code).send(rcResponse);
};

module.exports.checkToken = async (req, res) => {
	let rcResponse = new ApiResponse();
	const { decoded } = req; 
    try {
		const user = await userModel.findOne({_id:decoded.id});
		if(!user){
			throw SetError({}, 403, 'ShopNotExists');
		}		
    } catch (err) {
        handleError(err, rcResponse);
	}
	
	return res.status(rcResponse.code).send(rcResponse);
}
