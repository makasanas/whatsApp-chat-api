const { ApiResponse, SetError, Plans } = require('./../helpers/common');
const { handleError, handleshopifyRequest } = require('./../helpers/utils');
const commonModel = require('./../model/common');

// check if the requesting user is Admin user
module.exports.isValidPlan = async (req, res, next) => {
    let rcResponse = new ApiResponse();
    let { decoded } = req;
    try {
        let user = await commonModel.findOne('user', { _id: decoded.id });
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


