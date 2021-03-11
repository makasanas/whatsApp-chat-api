const { ApiResponse } = require('../helpers/common');
const { handleError } = require('../helpers/utils');
const commonModel = require('./../model/common');

module.exports.createSettings = async (req, res) => {
    let rcResponse = new ApiResponse();
    let { decoded, body } = req;
    try {
        rcResponse.data = await commonModel.findOneAndUpdate('settings', { userId: decoded.id }, { configurations: body });
    } catch (err) {
        handleError(err, rcResponse);
    }
    return res.status(rcResponse.code).send(rcResponse);
}

module.exports.updateSettings = async (req, res) => {
    let rcResponse = new ApiResponse();
    let { body } = req;
    try {
        let id = body.id;
        delete body.id;
        rcResponse.data = await commonModel.findOneAndUpdate('settings', { id: id }, body.data);
    } catch (err) {
        handleError(err, rcResponse);
    }
    return res.status(rcResponse.code).send(rcResponse);
}

module.exports.getSettingsByShopUrl = async (req, res) => {
    let rcResponse = new ApiResponse();
    let { params } = req;
    try {
        rcResponse.data = await commonModel.findOne('settings', { shopUrl: params.shopUrl, active: true });
    } catch (err) {
        handleError(err, rcResponse);
    }
    return res.status(rcResponse.code).send(rcResponse);
}

module.exports.getWidgets = async (req, res) => {
    let rcResponse = new ApiResponse();
    let { decoded } = req;
    try {
        rcResponse.data = await commonModel.find('settings', { shopUrl: decoded.shopUrl });
    } catch (err) {
        handleError(err, rcResponse);
    }
    return res.status(rcResponse.code).send(rcResponse);
}
