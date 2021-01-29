const { ApiResponse } = require('../helpers/common');
const { handleError } = require('../helpers/utils');
const commonModel = require('./../model/common');

module.exports.addOrUpdateSettings = async (req, res) => {
    let rcResponse = new ApiResponse();
    let { decoded, body } = req;
    try {
        rcResponse.data = await commonModel.findOneAndUpdate('settings', { userId: decoded.id }, body);
    } catch (err) {
        handleError(err, rcResponse);
    }
    return res.status(rcResponse.code).send(rcResponse);
}

module.exports.getSettingsByShopUrl = async (req, res) => {
    let rcResponse = new ApiResponse();
    let { params } = req;
    try {
        rcResponse.data = await commonModel.findOne('settings', { shopUrl: params.shopUrl });
    } catch (err) {
        handleError(err, rcResponse);
    }
    return res.status(rcResponse.code).send(rcResponse);
}