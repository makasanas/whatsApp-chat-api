/*
FileName : authCtrl.js
Date : 2nd Aug 2018
Description : This file consist of functions related to user's authentication
*/

/* DEPENDENCIES */
const { SetResponse, RequestErrorMsg, ErrMessages, ApiResponse } = require('./../helpers/common');
const jwt = require('jsonwebtoken');
const userSchema = require('./../schema/user');
const userModel = require('./../model/user');
const utils = require('./../helpers/utils');
const ObjectId = require('mongoose').Types.ObjectId;
const activePlanSchema = require('./../schema/activePlan');
var nodemailer = require("nodemailer");
var crypto = require('crypto');

/* Authenticate user */
module.exports.login = async (req, res) => {
	/* Contruct response object */
	let rcResponse = new ApiResponse();
	let httpStatus = 200;

	/* Check body params */
	if (!req.body.shopUrl || !req.body.password) {
		SetResponse(rcResponse, 400, RequestErrorMsg('InvalidParams', req, null), false);
		httpStatus = 400;
		return res.status(httpStatus).send(rcResponse);
	}

	try {
		/* Check if email exists */
		const findUser = await userSchema.findOne({ shopUrl: req.body.shopUrl }).lean().exec();
		if (findUser) {
			const currentPlan = await activePlanSchema.findOne({ shopUrl: findUser.shopUrl }).lean().exec();

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
		const userData = await userSchema.findOne({ _id: decoded.id, deleted: false }, { password: 0, accessToken:0 }).lean().exec();
		const currentPlan = await activePlanSchema.findOne({ shopUrl: userData.shopUrl }).lean().exec();
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
		const updateUser = await userSchema.findByIdAndUpdate({ _id: req.params.userId }, { $set: userObj }, { new: true, runValidators: true }).lean().exec();
		delete updateUser.password;
		rcResponse.data = updateUser;
		rcResponse.message = 'User details has been updated successfully';
		// } else {
		//   SetResponse(rcResponse, 400, RequestErrorMsg('EmailExists', req, null), false);
		//   httpStatus = 400;
		// }
	} catch (err) {
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
		const userData = await userSchema.findOne({ _id: req.params.userId }).lean().exec();
		if (userData) {
			const passHash = await utils.generatePasswordHash(req.body.password);
			let userObj = {
				password: passHash,
			};
			// userObj = JSON.parse(JSON.stringify(userObj));
			const updateUser = await userSchema.findOneAndUpdate({ _id: req.params.userId }, { $set: userObj }, { new: true }).lean().exec();
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


const uuid = require('uuid/v4');

const uuidPromise = (u) => new Promise((resolve, reject) => {
  crypto.randomBytes(16, (err, random) => {
    if (err) {
      return reject(err);
    }
    resolve(u({random}));
  });
});


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
		const findUser = await userSchema.findOne({ email: req.body.email }).exec();
		if (findUser) {

			var token = await uuidPromise(uuid).then(u => { return u}).catch(e =>{
				SetResponse(rcResponse, 403, RequestErrorMsg('userNotFound', req, null), false);
				httpStatus = 403;
				return res.status(httpStatus).send(rcResponse);
			});

			findUser.resetPasswordToken = token;
			findUser.resetPasswordExpires = Date.now() + (24*3600000); // 24 hour
			
			await findUser.save();

			var smtpTransport = nodemailer.createTransport({
				host: "smtp.zoho.com",
				port: 465,
    			secure: true, //ssl
				auth: {
					user: "hello@webrexstudio.com",
					pass: "Sanjay.143"
				}
			});
			let mailBody = 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
			'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
			req.body.appdomain + '/app/set-new-password/?token=' + token +'&email='+findUser.email+' \n\n' +
			'If you did not request this, please ignore this email and your password will remain unchanged.\n'

			var mailOptions = {
				to: findUser.email,
				subject: 'Reset Password | Bargain Bot',
				text: mailBody,
				from:'Bargaining Bot <hello@webrexstudio.com>'
			}
			smtpTransport.sendMail(mailOptions, function (error, response) {
				if (error) {
					SetResponse(rcResponse, 404, RequestErrorMsg('wrongHappened', req, null), false);
					httpStatus = 404;
					return res.status(httpStatus).send(rcResponse);
				} else {
					return res.status(httpStatus).send(rcResponse);
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
}



/* Get user's profile information */
module.exports.resetPassword = async (req, res) => {
	/* Contruct response object */
	let rcResponse = new ApiResponse();
	let httpStatus = 200;

	try {
		userSchema.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, async function(err, user) {
			if (!user) {
				SetResponse(rcResponse, 404, RequestErrorMsg('tokenInvalid', req, null), false);
				httpStatus = 404;
				return res.status(httpStatus).send(rcResponse);
			}else{
				const passHash = await utils.generatePasswordHash(req.body.password);
				user.password = passHash;
				user.resetPasswordExpires = undefined;
				user.resetPasswordToken = undefined;
				user.passwordSet = true;

				await user.save(function(err) { 
					if(err){
						SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
						httpStatus = 500;
					}
					return res.status(httpStatus).send(rcResponse);
				})
			}
			
		});
	} catch (err) {
		SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
		httpStatus = 500;
	}
};



module.exports.checkUserExist = async (req, res) => {
	let rcResponse = new ApiResponse();
	let httpStatus = 200;

    try {
		const user = await userModel.getUserByShopUrl(req.params.shopUrl);
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