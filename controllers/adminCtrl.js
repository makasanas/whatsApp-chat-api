

const { ApiResponse } = require('./../helpers/common');
const { handleError } = require('./../helpers/utils');
const userModel = require('./../model/user');
const deletedUserModel = require('./../model/deletedUser');
const jwt = require('jsonwebtoken');


module.exports.getUsers = async (req, res) => {
    /* Contruct response object */
    let rcResponse = new ApiResponse();
    let { query } = req;
    try {
        let limit = query.limit ? parseInt(query.limit) : 10;
        let skip = query.page ? ((parseInt(query.page) - 1) * (limit)) : 0;
        let sort = { created: -1 };
        rcResponse.data = (await userModel.findWithCount({}, {}, skip, limit, sort))[0];
    } catch (err) {
        handleError(err, rcResponse);
    }
    return res.status(rcResponse.code).send(rcResponse);
};

module.exports.generateAccessToken = async (req, res) => {
    let rcResponse = new ApiResponse();
    const { query } = req;
    try {
        const encodedData = {
            shopUrl: query.shopUrl,
            adminId: req.decoded.userId,
            role: req.decoded.role
        };
        const token = jwt.sign(encodedData, process.env['ADMIN_KEY']);

        rcResponse.data = { 'token': token };
    } catch (err) {
        handleError(err, rcResponse);
    }
    return res.status(rcResponse.code).send(rcResponse);
};


module.exports.getDeletedUsers = async (req, res) => {
    /* Contruct response object */
    let rcResponse = new ApiResponse();
    let { query } = req;
    try {
        let limit = query.limit ? parseInt(query.limit) : 10;
        let skip = query.page ? ((parseInt(query.page) - 1) * (limit)) : 0;
        let sort = { created: -1 };
        rcResponse.data = (await deletedUserModel.findWithCount({}, {}, skip, limit, sort))[0];
    } catch (err) {
        handleError(err, rcResponse);
    }
    return res.status(rcResponse.code).send(rcResponse);
};