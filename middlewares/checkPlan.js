const { ApiResponse, UserRoles, SetError, Plans } = require('./../helpers/common');
const crypto = require('crypto')
const { handleError, handleshopifyRequest } = require('./../helpers/utils');
const activePlanModel = require('../model/activePlan');
const userModel = require('../model/user');


// check if the requesting user is Admin user
module.exports.isValidPlan = async (req, res, next) => {
    let rcResponse = new ApiResponse();
    let { decoded } = req;
    try {
        let user = await userModel.findOne({ _id: decoded.id });
        let activePlan = Plans[user['recurringPlanName']];
        let productsCount = await handleshopifyRequest('get', 'https://' + decoded.shopUrl + process.env.apiVersion + 'products/count.json', user.accessToken);
        if (activePlan['maxProduct'] < productsCount.body.count) {
            throw SetError({}, 402, 'UpgradePlan');
        } else {
            next();
        }
    } catch (err) {
        handleError(err, rcResponse);
        return res.status(rcResponse.code).send(rcResponse);
    }
};


