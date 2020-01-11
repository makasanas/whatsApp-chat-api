/* DEPENDENCIES */
const { ApiResponse, SetError } = require('./../helpers/common');
const { handleError } = require('./../helpers/utils');
const commonModel = require('./../model/common');

/* Get user's profile information */
module.exports.getUserProfile = async (req, res) => {
	/* Contruct response object */
	let rcResponse = new ApiResponse();
	const { decoded } = req;
	let admin;
	try {
		console.log(decoded);
		if (decoded.role === 1) {
			admin = await commonModel.findOne("admin", { _id: decoded.adminId });
		}

		const userData = await commonModel.findOne('user',{_id:decoded.id}, {accessToken:0});
		if (admin) {
			rcResponse.data = { ...userData, admin: true };
		} else {
			rcResponse.data = { ...userData };
		}

	} catch (err) {
		handleError(err, rcResponse);
	}
	return res.status(rcResponse.code).send(rcResponse);
};


module.exports.checkToken = async (req, res) => {
	let rcResponse = new ApiResponse();
	const { decoded } = req; 
    try {
		const user = await commonModel.findOne('user',{_id:decoded.id});
		if(!user){
			throw SetError({}, 403, 'ShopNotExists');
		}		
    } catch (err) {
        handleError(err, rcResponse);
	}
	
	return res.status(rcResponse.code).send(rcResponse);
}
