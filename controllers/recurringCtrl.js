
const { SetResponse, RequestErrorMsg, ErrMessages, ApiResponse } = require('./../helpers/common');
const shopifyReuest = require('./../helpers/shopifyReuest.js');
const activePlan = require('./../models/activePlan');
const userModel = require('./../models/usersModel');
const productModel = require('./../models/productModel');

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
    console.log("innnnnnnnnnninnnnnnnnnnninnnnnnnnnnninnnnnnnnnnn")
    let rcResponse = new ApiResponse();
    let httpStatus = 200;
    const { decoded } = req;
    try {
        console.log(decoded.id);
        const findPlan = await activePlan.findOne({ userId: decoded.id }).lean().exec();
        console.log(findPlan, "**********")
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
        let url = 'https://' + decoded.shopUrl + '/admin/api/2019-04/recurring_application_charges/' + params.planId + '/activate.json';
        await shopifyReuest.post(url, decoded.accessToken).then(async function (response) {
            let productCount = 0;
            if (response.body.recurring_application_charge.name == "Free") {
                productCount = 1;
            } else if (response.body.recurring_application_charge.name == "Silver") {
                productCount = 2;
            } else if (response.body.recurring_application_charge.name == "Gold") {
                productCount = 3;
            } else {
                productCount = 4;
            }
            let data = {
                shopUrl: decoded.shopUrl,
                userId: decoded.id,
                planName: response.body.recurring_application_charge.name,
                planId: response.body.recurring_application_charge.id,
                planPrice: response.body.recurring_application_charge.price,
                status: response.body.recurring_application_charge.status,
                started: response.body.recurring_application_charge.activated_on,
                nextBillDate: response.body.recurring_application_charge.activated_on,
                cancelled_on: response.body.recurring_application_charge.cancelled_on,
                products: productCount,
                type: 'monthly'
            }

            const findPlan = await activePlan.findOne({ userId: decoded.id }).lean().exec();

            if (findPlan) {
                const updatePlan = await activePlan.findOneAndUpdate({ _id: findPlan._id }, { $set: data }, { new: true }).lean().exec();

                let totalProducts = await productModel.find({ userId: decoded.id });
                if (findPlan.products > productCount) {
                    let deleteProduct = totalProducts.slice(productCount, totalProducts.length);
                    let updatableProducts = deleteProduct.map(product => product._id);

                    const updateProducts = await productModel.updateMany({ _id: { $in: updatableProducts } }, { $set: { deleted: true } }, { multi: true });
                }

                let userPlanData = {
                    recurringPlanName: response.body.recurring_application_charge.name,
                    recurringPlanId: updatePlan._id
                }
                const updateUserPlan = await userModel.findOneAndUpdate({ _id: decoded.id }, { $set: userPlanData }, { new: true }).lean().exec();

                rcResponse.data = updatePlan
            } else {
                const plan = new activePlan(data);
                const planSave = await plan.save();

                let userPlanData = {
                    recurringPlanName: response.body.recurring_application_charge.name,
                    recurringPlanId: planSave._id
                }
                const updateUserPlan = await userModel.findOneAndUpdate({ _id: decoded.id }, { $set: userPlanData }, { new: true }).lean().exec();

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
        const plan = await activePlan.findOne({ _id: params.planId }).lean().exec();
        let url = 'https://' + decoded.shopUrl + '/admin/api/2019-04/recurring_application_charges/' + plan.planId + '.json';
        await shopifyReuest.delete(url, decoded.accessToken).then(async function (response) {
            rcResponse.data = response.body;
            data = {
                status: "cancelled",
                planName: "Free",
                products:"1"
            }
            const updatePlan = await activePlan.findOneAndUpdate({ userId: decoded.id }, { $set: data }, { new: true }).lean().exec();
            var date = new Date(updatePlan.started);
            let expiryDate = date.setDate(date.getDate() + 30);

            const updateUserPlan = await userModel.findOneAndUpdate({ _id: decoded.id }, { $set: { recurringPlanName: 'Free', recurringPlanExpiryDate: expiryDate } }, { new: true }).lean().exec();

            rcResponse.data = updatePlan
        }).catch(function (err) {
            SetResponse(rcResponse, err.statusCode, RequestErrorMsg(null, req, err.error), false);
        });
    } catch (err) {
        SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
        httpStatus = 500;
    }
    return res.status(httpStatus).send(rcResponse);
}