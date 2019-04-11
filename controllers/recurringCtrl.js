
const { SetResponse, RequestErrorMsg, ErrMessages, ApiResponse } = require('./../helpers/common');
const shopifyReuest = require('./../helpers/shopifyReuest.js');
const activePlan = require('./../models/activePlan');

module.exports.create = async (req, res) => {
    let rcResponse = new ApiResponse();
    let httpStatus = 200;
    const { decoded } = req;
    try {
        if (!req.body.recurring_application_charge.name || !req.body.recurring_application_charge.price || !req.body.recurring_application_charge.return_url) {
            SetResponse(rcResponse, 400, RequestErrorMsg('InvalidParams', req, null), false);
            httpStatus = 400;
        }
        let url = 'https://' + decoded.shopUrl + '/admin/api/2019-04/recurring_application_charges.json';
        await shopifyReuest.post(url, decoded.accessToken, req.body).then(function (response) {
            rcResponse.data = response.body;
        }).catch(function (err) {
            SetResponse(rcResponse, err.statusCode, RequestErrorMsg(null, req, err.error), false);
        });
    } catch (err) {
        SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
        httpStatus = 500;
    }
    return res.status(httpStatus).send(rcResponse);
}

module.exports.getPlan = async (req, res) => {
    let rcResponse = new ApiResponse();
    let httpStatus = 200;
    const { decoded } = req;
    try {
        const findPlan = await activePlan.findOne({ userId:  decoded.id }).lean().exec();
        rcResponse.data = findPlan
    } catch (err) {
        SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
        httpStatus = 500;
    }
    return res.status(httpStatus).send(rcResponse);
}

module.exports.activePlan = async (req, res) => {
    let rcResponse = new ApiResponse();
    let httpStatus = 200;
    const { decoded, params } = req;
    try {
        let url = 'https://' + decoded.shopUrl + '/admin/api/2019-04/recurring_application_charges/'+params.planId+'/activate.json';
        await shopifyReuest.post(url, decoded.accessToken).then(async function (response) {
            console.log(response.body);
            let data = {
                shopUrl: decoded.shopUrl,
                userId: decoded.id,
                planName: response.body.recurring_application_charge.name,
                planId: response.body.recurring_application_charge.id,
                planPrice: response.body.recurring_application_charge.price,
                status : response.body.recurring_application_charge.status,
                started: response.body.recurring_application_charge.activated_on,
                cancelled_on: response.body.recurring_application_charge.cancelled_on,
                type:'monthly'
            }

            const findPlan = await activePlan.findOne({ userId:  decoded.id }).lean().exec();

            if (findPlan) {
                const updateProduct = await activePlan.findOneAndUpdate({ _id: findPlan._id }, { $set: data }, { new: true }).lean().exec();
                rcResponse.data = updateProduct
            }else{  
                const plan = new activePlan(data);
                const planSave = await plan.save();
                rcResponse.data = planSave
            }
        }).catch(function (err) {
            console.log(err);
            SetResponse(rcResponse, err.statusCode, RequestErrorMsg(null, req, err.error), false);
        });
    } catch (err) {
        SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
        httpStatus = 500;
    }
    return res.status(httpStatus).send(rcResponse);
}

module.exports.deactivePlan = async (req, res) => {
    let rcResponse = new ApiResponse();
    let httpStatus = 200;
    const { decoded, params } = req;
    try {
        let url = 'https://' + decoded.shopUrl + '/admin/api/2019-04/recurring_application_charges/'+params.planId+'.json';
        await shopifyReuest.delete(url, decoded.accessToken).then(async function (response) {
            rcResponse.data = response.body;
            console.log(response.body);
            data = {
                status:"cancelled"
            }

            const updateProduct = await activePlan.findOneAndUpdate({ userId:  decoded.id }, { $set: data }, { new: true }).lean().exec();
            rcResponse.data = updateProduct
        }).catch(function (err) {
            SetResponse(rcResponse, err.statusCode, RequestErrorMsg(null, req, err.error), false);
        });
    } catch (err) {
        SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
        httpStatus = 500;
    }
    return res.status(httpStatus).send(rcResponse);
}