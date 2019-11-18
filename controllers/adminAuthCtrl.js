/* DEPENDENCIES */
const { ApiResponse, SetError } = require('./../helpers/common');
const { handleError, comparePassword, generatePasswordHash } = require('./../helpers/utils');
const jwt = require('jsonwebtoken');
const adminModel = require('./../model/admin');

/* Authenticate user */
module.exports.login = async (req, res) => {
	let rcResponse = new ApiResponse();
	try {
		// await this.register({
		// 	body: {
		// 		name: "Sanjay Makasana",
		// 		password: "sanjay.143",
		// 		email: "makasanas@yahoo.in",
		// 		phone: 9724690996,
		// 		type: 1,
		// 		adminKey: "OxxGyAfT8UXG4NJbvTqOftCyeGBxH5GvoinSKkvPxSwT5KYrB27OHuNyyWRKljgnvQGLPwD01jRXYPPJoK52YSJ2N4SZD37SY1Gc"
		// 	}
		// });

		if (!req.body.email || !req.body.password) {
			throw SetError({}, 403, 'InvalidParams');
		}

		if (req.body.adminKey !== process.env['ADMIN_KEY']) {
			throw SetError({}, 403, 'InvalidAdminKey');
		}

		/* Check if email exists */
		const user = await adminModel.findOne({ email: req.body.email });

		if (user) {
			/* Compare password */
			const comparePasswordResult = await comparePassword(req.body.password, user.password);

			if (comparePasswordResult) {
				/* Password matched */
				const encodedData = {
					id: user._id,
					role: user.role
				};

				// generate accessToken using JWT
				const token = jwt.sign(encodedData, process.env['SECRET']);

				rcResponse.data = { ...user, ...{ token: token } };
			} else {
				throw SetError({}, 403, 'InvalidPassword');
			}
		} else {
			throw SetError({}, 403, 'UserNotFound');
		}
	} catch (err) {
		handleError(err, rcResponse);
	}
	return res.status(rcResponse.code).send(rcResponse);
};

/* Register user */
module.exports.register = async (req) => {
	console.log(req);
	try {
		if (!req.body.email || !req.body.password || !req.body.name || !req.body.phone || !req.body.type) {
			throw SetError({}, 400, 'InvalidParams');
		}

		if (req.body.type === 1 && req.body.adminKey !== process.env['ADMIN_KEY']) {
			throw SetError({}, 400, 'InvalidParams');
		}

		const passHash = await generatePasswordHash(req.body.password);
		let user = {
			name: req.body.name,
			email: req.body.email,
			phone: req.body.phone,
			password: passHash,
			role: parseInt(req.body.type)
		};

		user = await adminModel.create(user);
	} catch (err) {
		if (err.code === 11000) {
			throw SetError({}, 400, 'EmailExists');
		} else {
			// handleError(err, rcResponse);
			throw err;
		}
	}
	return true;
	// return res.status(rcResponse.code).send(rcResponse);
};

/* Get user's profile information */
module.exports.getUserProfile = async (req, res) => {
	/* Contruct response object */
	let rcResponse = new ApiResponse();
	const { decoded } = req;
	console.log(decoded);

	try {
		rcResponse.data = await adminModel.findOne({ _id: decoded.id });
	} catch (err) {
		handleError(err, rcResponse);
	}
	return res.status(rcResponse.code).send(rcResponse);

};

