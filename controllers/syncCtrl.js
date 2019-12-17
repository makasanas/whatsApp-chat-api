const { ApiResponse } = require('../helpers/common');
const { handleError } = require('../helpers/utils');
const commonModel = require('./../model/common');

module.exports.syncDetails = async (req, res) => {
    let rcResponse = new ApiResponse();
    let { decoded } = req;
    try {
        rcResponse.data = await syncDetailModel.findOne({ userId: decoded.id }, { created: -1 });
    } catch (err) {
        handleError(err, rcResponse);
    }
    return res.status(rcResponse.code).send(rcResponse);
}