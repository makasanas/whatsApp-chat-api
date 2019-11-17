

const {  ApiResponse } = require('./../helpers/common');
const userModel = require('./../model/user');
const { handleError } = require('./../helpers/utils');


module.exports.getUsers = async (req, res) => {
	/* Contruct response object */
	let rcResponse = new ApiResponse();
    let {  query } = req;
	try {
        let limit = query.limit ? parseInt(query.limit) : 10;
        let skip = query.page ?  ((parseInt(query.page) - 1) * (limit)) : 0;
        let sort = {created: -1};
		rcResponse.data = await userModel.findWithCount(skip, limit, sort);
	} catch (err) {
		handleError(err, rcResponse);
    }
    return res.status(rcResponse.code).send(rcResponse);
};