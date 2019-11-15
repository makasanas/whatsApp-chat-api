const { ApiResponse } = require('./../helpers/common');
const productSyncDetailModel = require('./../model/productSyncDetail');
const { handleError } = require('./../helpers/utils');

module.exports.get = async (req, res) => {
    let rcResponse = new ApiResponse();
    let { decoded } = req;
    try {
        rcResponse.data = await productSyncDetailModel.find({ userId: decoded.id }, { created: -1 });
    } catch (err) {
        handleError(err, req, rcResponse);
    }
    return res.status(rcResponse.code).send(rcResponse);
}