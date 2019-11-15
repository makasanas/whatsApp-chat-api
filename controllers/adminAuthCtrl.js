/* DEPENDENCIES */
const { SetResponse, RequestErrorMsg, ApiResponse } = require('./../helpers/common');
const jwt = require('jsonwebtoken');
const utils = require('./../helpers/utils');
var nodemailer = require("nodemailer");
var crypto = require('crypto');
const adminModel = require('./../model/admin');

/* Authenticate user */
module.exports.login = async (req, res) => {

	// this.register({
	// 	body: {
	// 		name: "Sanjay Makasana",
	// 		password: "sanjay.143",
	// 		email: "makasanas@yahoo.in",
	// 		phone: 9724690996,
	// 		type: 1,
	// 		adminKey:"OxxGyAfT8UXG4NJbvTqOftCyeGBxH5GvoinSKkvPxSwT5KYrB27OHuNyyWRKljgnvQGLPwD01jRXYPPJoK52YSJ2N4SZD37SY1Gc"
	// 	}
	// });

	/* Contruct response object */
	let rcResponse = new ApiResponse();
	let httpStatus = 200;

	/* Check body params */
	if (!req.body.email || !req.body.password) {
		SetResponse(rcResponse, 400, RequestErrorMsg('InvalidParams', req, null), false);
		httpStatus = 400;
		return res.status(httpStatus).send(rcResponse);
	}

	if (req.body.adminKey !== process.env['ADMIN_KEY']) {
		SetResponse(rcResponse, 401, RequestErrorMsg('InvalidAdminKey', req, null), false);
		httpStatus = 401;
		return res.status(httpStatus).send(rcResponse);
	}

	try {
		/* Check if email exists */
		const findUser = await adminModel.getUserByEmail(req.body.email);
		if (findUser) {
			/* Compare password */

			const comparePassword = await utils.comparePassword(req.body.password, findUser.password);

			if (comparePassword) {
				/* Password matched */
				const encodedData = {
					userId: findUser._id,
					role: findUser.role
				};
				// generate accessToken using JWT
				const token = jwt.sign(encodedData, process.env['SECRET']);

				const userObj = {
					_id: findUser._id,
					role: findUser.role,
					name: findUser.name,
					email: findUser.email,
					phone: findUser.phone,
					token: token
				};
				rcResponse.data = userObj;
			} else {
				SetResponse(rcResponse, 403, RequestErrorMsg('InvalidPassword', req, null), false);
				httpStatus = 403;
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




/* Register user */
module.exports.register = async (req) => {


	/* Contruct response object */
	let rcResponse = new ApiResponse();
	let httpStatus = 200;

	/* Check body params */
	if (!req.body.email || !req.body.password || !req.body.name || !req.body.phone || !req.body.type) {
		return false;
	}

	/* Check admin Key, if it's Admin user */
	if (req.body.type === 1 && req.body.adminKey !== process.env['ADMIN_KEY']) {
		return false;
	}

	try {
		const passHash = await utils.generatePasswordHash(req.body.password);
		const userObj = {
			name: req.body.name,
			email: req.body.email,
			phone: req.body.phone,
			password: passHash,
			role: parseInt(req.body.type)
		};

		const createUser = await adminModel.create(userObj);
		const encodedData = {
			userId: createUser._id,
			role: createUser.role
		};

		// generate accessToken using JWT
		// const token = jwt.sign(encodedData, process.env['SECRET']);
		rcResponse.data = { _id: createUser._id, role: createUser.role, name: createUser.name, email: createUser.email, phone: createUser.phone };
	} catch (err) {
		if (err.code === 11000) {
			SetResponse(rcResponse, 400, RequestErrorMsg('EmailExists', req, null), false);
			httpStatus = 400;
		} else {
			SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
			httpStatus = 500;
		}
	}
	// return res.status(httpStatus).send(rcResponse);
};


/* Get user's profile information */
/* Get user's profile information */
module.exports.getUserProfile = async (req, res) => {
	/* Contruct response object */
	let rcResponse = new ApiResponse();
	let httpStatus = 200;

	try {
		const { decoded } = req;
		const userData = await adminModel.getUserById(decoded.userId);
		rcResponse.data = userData;
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
		resolve(u({ random }));
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
		const findUser = await userSchema.getUserByEmail(req.body.email).exec();
		if (findUser) {

			var token = await uuidPromise(uuid).then(u => { return u }).catch(e => {
				SetResponse(rcResponse, 403, RequestErrorMsg('userNotFound', req, null), false);
				httpStatus = 403;
				return res.status(httpStatus).send(rcResponse);
			});

			findUser.resetPasswordToken = token;
			findUser.resetPasswordExpires = Date.now() + (24 * 3600000); // 24 hour

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
				req.body.appdomain + '/app/set-new-password/?token=' + token + '&email=' + findUser.email + ' \n\n' +
				'If you did not request this, please ignore this email and your password will remain unchanged.\n'

			var mailOptions = {
				to: findUser.email,
				subject: 'Reset Password | Bargain Bot',
				text: mailBody,
				from: 'Bargaining Bot <hello@webrexstudio.com>'
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
		userSchema.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, async function (err, user) {
			if (!user) {
				SetResponse(rcResponse, 404, RequestErrorMsg('tokenInvalid', req, null), false);
				httpStatus = 404;
				return res.status(httpStatus).send(rcResponse);
			} else {
				const passHash = await utils.generatePasswordHash(req.body.password);
				user.password = passHash;
				user.resetPasswordExpires = undefined;
				user.resetPasswordToken = undefined;
				user.passwordSet = true;

				await user.save(function (err) {
					if (err) {
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




module.exports.generateAccessToken = async (req, res) => {
	/* Contruct response object */
	let rcResponse = new ApiResponse();
	let httpStatus = 200;

	try {
		const { query } = req;

		const encodedData = {
			shopUrl: query.shopUrl,
			adminId:  req.decoded.userId,
			role: req.decoded.role
		};
		const token = jwt.sign(encodedData, process.env['ADMIN_KEY']);

		rcResponse.data = {'token': token}; 
	} catch (err) {
		SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
		httpStatus = 500;
	}
	return res.status(httpStatus).send(rcResponse);
};