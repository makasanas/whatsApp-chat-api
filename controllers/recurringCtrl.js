
const { SetResponse, RequestErrorMsg, ErrMessages, ApiResponse } = require('./../helpers/common');
const shopifyReuest = require('./../helpers/shopifyReuest.js');
const activePlanModel = require('../model/activePlan');
const userModel = require('../model/user');

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
        const findPlan = await activePlanModel.findActivePlanByUserId(decoded.id);
        // const findPlan = await activePlanSchema.findOne({ userId: decoded.id }).lean().exec();
        rcResponse.data = findPlan
    } catch (err) {
        SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
        httpStatus = 500;
    }
    return res.status(httpStatus).send(rcResponse);
}

module.exports.activePlanSchema = async (req, res) => {

    let rcResponse = new ApiResponse();
    let httpStatus = 200;
    const { decoded, params } = req;

    try {

        // const credit = await this.creditCalculator(req, rcResponse, httpStatus, params.planId);

        let url = 'https://' + decoded.shopUrl + '/admin/api/2019-04/recurring_application_charges/' + params.planId + '/activate.json';

        await shopifyReuest.post(url, decoded.accessToken).then(async function (response) {
            console.log(response.body);

            let productCount = 0;
            if (response.body.recurring_application_charge.name == "Free") {
                productCount = process.env.Free;
            } else if (response.body.recurring_application_charge.name == "Silver") {
                productCount = process.env.Silver;
            } else if (response.body.recurring_application_charge.name == "Gold") {
                productCount = process.env.Gold;
            } else {
                productCount = process.env.Platinium;
            }


            let data = {
                shopUrl: decoded.shopUrl,
                userId: decoded.id,
                planName: response.body.recurring_application_charge.name,
                planId: response.body.recurring_application_charge.id,
                planPrice: response.body.recurring_application_charge.price,
                status: response.body.recurring_application_charge.status,
                activated_on: response.body.recurring_application_charge.activated_on,
                currentMonthStartDate: response.body.recurring_application_charge.activated_on,
                nextMonthStartDate: new Date(new Date(response.body.recurring_application_charge.activated_on).getTime() + (30 * 24 * 60 * 60 * 1000)),
                products: productCount,
                type: 'monthly'
            }
            
            data['$push'] = {
                chargeInfo: {
                    startDate: response.body.recurring_application_charge.activated_on,
                    planName: response.body.recurring_application_charge.name,
                    planPrice: response.body.recurring_application_charge.price
                }
            }

            const findPlan = await activePlanModel.findActivePlanByUserId(decoded.id);

            // const findPlan = await activePlanSchema.findOne({ userId: decoded.id }).lean().exec();

            if (findPlan) {
                const updatePlan = await activePlanModel.updatePlan(findPlan.userId, data);

                let userPlanData = {
                    recurringPlanName: response.body.recurring_application_charge.name,
                    recurringPlanId: updatePlan._id,
                    credit: productCount
                }
                const updateUserPlan = await userModel.updateUser(decoded.id, userPlanData);
                // const updateUserPlan = await userModel.findOneAndUpdate({ _id: decoded.id }, { $set: userPlanData }, { new: true }).lean().exec();

                rcResponse.data = updatePlan
            } else {
                const plan = new activePlanSchema(data);
                const planSave = await plan.save();

                let userPlanData = {
                    recurringPlanName: response.body.recurring_application_charge.name,
                    recurringPlanId: planSave._id
                }
                const updateUserPlan = await userModel.updateUser(decoded.id, userPlanData);

                // const updateUserPlan = await userModel.findOneAndUpdate({ _id: decoded.id }, { $set: userPlanData }, { new: true }).lean().exec();

                rcResponse.data = planSave
            }
        }).catch(function (err) {
            SetResponse(rcResponse, err.statusCode, RequestErrorMsg(null, req, err.error), false);
        });
    } catch (err) {
        SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
        httpStatus = 500;
    }
    return res.status(httpStatus).send(rcResponse);
}


module.exports.creditCalculator = async (req, rcResponse, httpStatus, newPlanId) => {

    const { decoded, params } = req;
    let newPlan = {};
    let newPlanPrice;
    try {

        if (newPlanId) {
            let url = 'https://' + decoded.shopUrl + '/admin/api/2019-04/recurring_application_charges/' + newPlanId + '.json';
            await shopifyReuest.get(url, decoded.accessToken).then(async function (response) {
                newPlan = response.body;
                newPlanPrice = parseInt(response.body.recurring_application_charge.price);
            }).catch(function (err) {
                SetResponse(rcResponse, err.statusCode, RequestErrorMsg(null, req, err.error), false);
            });
        } else {
            newPlanPrice = 0;
        }

        const currentPlan = await activePlanModel.findActivePlanByUserId(decoded.id);
        // const currentPlan = await activePlanSchema.findOne({ userId: decoded.id }).lean().exec();

        if (newPlanPrice < currentPlan.planPrice) {
            url = 'https://' + decoded.shopUrl + '/admin/api/2019-04/recurring_application_charges/' + currentPlan.planId + '.json';
            await shopifyReuest.get(url, decoded.accessToken).then(async function (response) {
                oneDay = 86400 * 1000;
                days = parseInt((new Date(response.body.recurring_application_charge.billing_on) - new Date()) / oneDay);
                const credit = (currentPlan.planPrice - newPlanPrice) * (days / 30)
                if (credit > 0) {
                    url = 'https://' + decoded.shopUrl + '/admin/api/2019-07/application_credits.json';
                    let data = {
                        "application_credit": {
                            "description": "application credit for downgrades",
                            "amount": credit,
                            "test": true
                        }
                    }
                    await shopifyReuest.post(url, decoded.accessToken, data).then(function (response) {
                    }).catch(function (err) {
                        SetResponse(rcResponse, err.statusCode, RequestErrorMsg(null, req, err.error), false);
                    });
                }
            }).catch(function (err) {
                SetResponse(rcResponse, err.statusCode, RequestErrorMsg(null, req, err.error), false);
            });
        }
    } catch (err) {
        SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
        httpStatus = 500;
    }
}

module.exports.deactivePlanSchema = async (req, res) => {
    let rcResponse = new ApiResponse();
    let httpStatus = 200;
    const { decoded, params } = req;
    try {

        // const credit = await this.creditCalculator(req, rcResponse, httpStatus);

        const plan = await activePlanModel.findActivePlanByUserId(decoded.id);

        // const plan = await activePlanSchema.findOne({ userId: decoded.id }).lean().exec();

        let url = 'https://' + decoded.shopUrl + '/admin/api/2019-04/recurring_application_charges/' + plan.planId + '.json';
        await shopifyReuest.delete(url, decoded.accessToken).then(async function (response) {
            rcResponse.data = response.body;
            data = {
                status: "active",
                planName: "Free",
                planPrice: 0,
                products: process.env.Free,
                planId: undefined
            }
            const updatePlan = await activePlanModel.updatePlan(decoded.id, data);

            // const updatePlan = await activePlanSchema.findOneAndUpdate({ userId: decoded.id }, { $set: data }, { new: true }).lean().exec();
            var date = new Date(updatePlan.started);
            let expiryDate = date.setDate(date.getDate() + 30);

            const updateUserPlan = await userModel.updateUser(decoded.id, { recurringPlanName: 'Free', recurringPlanExpiryDate: expiryDate });

            // const updateUserPlan = await userModel.findOneAndUpdate({ _id: decoded.id }, { $set: { recurringPlanName: 'Free', recurringPlanExpiryDate: expiryDate } }, { new: true }).lean().exec();

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