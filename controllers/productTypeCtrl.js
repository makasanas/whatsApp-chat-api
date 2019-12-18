const { ApiResponse } = require('./../helpers/common');
const { handleError } = require('./../helpers/utils');
const commonModel = require('./../model/common');

module.exports.getProductType = async (req, res) => {
    let rcResponse = new ApiResponse();
    let { decoded } = req;
    try {
        rcResponse.data = await commonModel.findOne('productType', { userId: decoded.id });
    } catch (err) {
        handleError(err, rcResponse);
    }
    return res.status(rcResponse.code).send(rcResponse);
}