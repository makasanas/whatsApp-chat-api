

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
		const count = await userModel.getUsersCount();
		const users = await userModel.getUsers(skip, limit, sort);
		rcResponse.data = {
            users: users,
            count: count
        };
	} catch (err) {
		handleError(err, req, rcResponse);
    }
    return res.status(rcResponse.code).send(rcResponse);
};