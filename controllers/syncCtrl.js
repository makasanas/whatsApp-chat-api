const { ApiResponse } = require('../helpers/common');
const syncDetailModel = require('../model/syncDetail');
const { handleError } = require('../helpers/utils');

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