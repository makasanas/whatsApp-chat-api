/*
FileName : authCtrl.js
Date : 2nd Aug 2018
Description : This file consist of functions related to user's authentication
*/

/* DEPENDENCIES */
const { SetResponse, RequestErrorMsg, ErrMessages, ApiResponse } = require('./../helpers/common');
const jwt = require('jsonwebtoken');
const userModel = require('./../models/usersModel');
const utils = require('./../helpers/utils');
const ObjectId = require('mongoose').Types.ObjectId;
const activePlan = require('./../models/activePlan');
var nodemailer = require("nodemailer");


/* Authenticate user */
module.exports.login = async (req, res) => {
	/* Contruct response object */
	let rcResponse = new ApiResponse();
	let httpStatus = 200;

	/* Check body params */
	if (!req.body.email || !req.body.password) {
		SetResponse(rcResponse, 400, RequestErrorMsg('InvalidParams', req, null), false);
		httpStatus = 400;
		return res.status(httpStatus).send(rcResponse);
	}

	try {
		/* Check if email exists */
		const findUser = await userModel.findOne({ email: req.body.email }).lean().exec();
		if (findUser) {
			const currentPlan = await activePlan.findOne({ shopUrl: findUser.shopUrl }).lean().exec();

			const encodedData = {
				id: findUser._id,
				accessToken: findUser.accessToken,
				shopUrl: findUser.shopUrl,
				email: findUser.email,
				role: findUser.role,
				plan: currentPlan.planName,
				type: currentPlan.type,
				started: currentPlan.started
			};
			// generate accessToken using JWT
			const token = jwt.sign(encodedData, process.env['SECRET']);
			let planObj = { planName: currentPlan.planName, status: currentPlan.status, type: currentPlan.type, started: currentPlan.started }

			const userObj = {
				_id: findUser._id,
				shopUrl: findUser.shopUrl,
				storeName: findUser.storeName,
				email: findUser.email,
				phone: findUser.phone,
				storeId: findUser.storeId,
				passwordSet: findUser.passwordSet,
				token: token,
				plan: planObj
			};

			if (findUser.passwordSet) {
				const comparePassword = await utils.comparePassword(req.body.password, findUser.password);
				if (comparePassword) {
					rcResponse.data = userObj;
				} else {
					SetResponse(rcResponse, 403, RequestErrorMsg('InvalidPassword', req, null), false);
					httpStatus = 403;
					return res.status(httpStatus).send(rcResponse);
				}
			} else {
				SetResponse(rcResponse, 400, RequestErrorMsg('PasswordNotSet', req, null), false);
				httpStatus = 400;
				return res.status(httpStatus).send(rcResponse);
			}
		} else {
			SetResponse(rcResponse, 403, RequestErrorMsg('InvalidPassword', req, null), false);
			httpStatus = 403;
			return res.status(httpStatus).send(rcResponse);
		}
	} catch (err) {
		SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
		httpStatus = 500;
	}
	return res.status(httpStatus).send(rcResponse);
};

/* Get user's profile information */
module.exports.getUserProfile = async (req, res) => {
	/* Contruct response object */
	let rcResponse = new ApiResponse();
	let httpStatus = 200;

	try {
		const { decoded } = req;
		console.log(decoded);
		const userData = await userModel.findOne({ _id: decoded.id, deleted: false }, { password: 0, accessToken: 0 }).lean().exec();
		const currentPlan = await activePlan.findOne({ shopUrl: userData.shopUrl }).lean().exec();
		let planObj = { planName: currentPlan.planName, status: currentPlan.status, type: currentPlan.type, started: currentPlan.started }


		rcResponse.data = { ...userData, plan: planObj };
	} catch (err) {
		SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
		httpStatus = 500;
	}
	return res.status(httpStatus).send(rcResponse);
};

/* Update user details */
module.exports.userUpdate = async (req, res) => {
	/* Contruct response object */
	let rcResponse = new ApiResponse();
	let httpStatus = 200;

	try {
		let userObj = {
			name: req.body.name != undefined ? req.body.name : undefined,
			email: req.body.email != undefined ? req.body.email : undefined,
			phone: req.body.phone != undefined ? req.body.phone : undefined,
		};
		userObj = JSON.parse(JSON.stringify(userObj));
		const updateUser = await userModel.findByIdAndUpdate({ _id: req.params.userId }, { $set: userObj }, { new: true, runValidators: true }).lean().exec();
		delete updateUser.password;
		rcResponse.data = updateUser;
		rcResponse.message = 'User details has been updated successfully';
		// } else {
		//   SetResponse(rcResponse, 400, RequestErrorMsg('EmailExists', req, null), false);
		//   httpStatus = 400;
		// }
	} catch (err) {
		console.log(err);
		if (err.code == 11000) {
			SetResponse(rcResponse, 400, RequestErrorMsg('EmailExists', req, null), false);
			httpStatus = 400;
		} else {
			SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
			httpStatus = 500;
		}
	}
	return res.status(httpStatus).send(rcResponse);
};

/* Update password details */
module.exports.userPasswordUpdate = async (req, res) => {
	/* Contruct response object */
	let rcResponse = new ApiResponse();
	let httpStatus = 200;
	try {
		const userData = await userModel.findOne({ _id: req.params.userId }).lean().exec();
		if (userData) {
			const passHash = await utils.generatePasswordHash(req.body.password);
			let userObj = {
				password: passHash,
			};
			// userObj = JSON.parse(JSON.stringify(userObj));
			const updateUser = await userModel.findOneAndUpdate({ _id: req.params.userId }, { $set: userObj }, { new: true }).lean().exec();
			delete updateUser.password;
			rcResponse.data = updateUser;
			rcResponse.message = 'User password has been updated successfully';
		} else {
			SetResponse(rcResponse, 400, RequestErrorMsg('userNotFound', req, null), false);
			httpStatus = 400;
		}
	} catch (err) {
		SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
		httpStatus = 500;
	}
	return res.status(httpStatus).send(rcResponse);
};

module.exports.forgetPassword = async (req, res) => {
	/* Contruct response object */
	let rcResponse = new ApiResponse();
	let httpStatus = 200;

	/* Check body params */
	if (!req.body.email) {
		SetResponse(rcResponse, 400, RequestErrorMsg('InvalidParams', req, null), false);
		httpStatus = 400;
		return res.status(httpStatus).send(rcResponse);
	}

	try {
		/* Check if email exists */
		const findUser = await userModel.findOne({ email: req.body.email }).lean().exec();
		if (findUser) {

			var smtpTransport = nodemailer.createTransport({
				service: "Gmail",
				host: "smtp.gmail.com",
				auth: {
					user: "dudharejiyarahul@gmail.com",
					pass: "rd@2747rd"
				}
			});

			let mailBody = "You are recived this mail because you have requested for reset password of your account in Bargain Bot. \n\n " +
				"Please Click on the following link, or paste this into your browser to complete the process for reseting password. \n \n" +
				"link generate \n \n" +
				"If you did not request this, please ignore this email and your password will remain unchanged. \n";

			var mailOptions = {
				to: findUser.email,
				subject: 'Reset Password | Bargain Bot',
				text: mailBody
			}
			smtpTransport.sendMail(mailOptions, function (error, response) {
				if (error) {
					console.log(error);
					res.end("error");
				} else {
					console.log("Message sent:");
					
					res.end("sent");
				}
			});

		} else {
			SetResponse(rcResponse, 403, RequestErrorMsg('userNotFound', req, null), false);
			httpStatus = 403;
			return res.status(httpStatus).send(rcResponse);
		}
	} catch (err) {
		SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
		httpStatus = 500;
	}
	return res.status(httpStatus).send(rcResponse);
}

