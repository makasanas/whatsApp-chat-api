
const { ApiResponse, SetError, Plans } = require('./../helpers/common');
const { handleError, handleshopifyRequest, sendMail } = require('./../helpers/utils');
const activePlanModel = require('../model/activePlan');
const userModel = require('../model/user');

module.exports.create = async (req, res) => {
    let rcResponse = new ApiResponse();
    const { decoded, body } = req;
    try {
        if (!req.body.recurring_application_charge.name || !req.body.recurring_application_charge.price || !req.body.recurring_application_charge.return_url || !req.body.recurring_application_charge.trial_days) {
            throw SetError({}, 400, 'InvalidParams');
        }
        let shopifyResponse = await handleshopifyRequest('post', 'https://' + decoded.shopUrl + process.env.apiVersion + 'recurring_application_charges.json', decoded.accessToken, body);
        rcResponse.data = shopifyResponse.body;
    } catch (err) {
        handleError(err, rcResponse);
    }
    return res.status(rcResponse.code).send(rcResponse);
}

module.exports.getPlan = async (req, res) => {
    let rcResponse = new ApiResponse();
    const { decoded } = req;
    try {
        rcResponse.data = await activePlanModel.findOne({ userId: decoded.id });
    } catch (err) {
        handleError(err, rcResponse);
    }
    return res.status(rcResponse.code).send(rcResponse);
}

module.exports.activePlan = async (req, res) => {
    let rcResponse = new ApiResponse();
    const { decoded, params } = req;
    try {
        let plan = await activePlanModel.findOne({ userId: decoded.id, chargeInfo: { $elemMatch: { id: params.planId } } });
        if (!plan) {
            let shopifyResponse = await handleshopifyRequest('post', 'https://' + decoded.shopUrl + process.env.apiVersion + 'recurring_application_charges/' + params.planId + '/activate.json', decoded.accessToken);
            let plan = shopifyResponse.body.recurring_application_charge;
            let data = {
                $set: {
                    planName: plan.name,
                    planId: plan.id,
                    planPrice: plan.price,
                    status: plan.status,
                    activated_on: plan.activated_on,
                    currentMonthStartDate: plan.activated_on,
                    nextMonthStartDate: new Date(
                        new Date(plan.activated_on).getTime()
                        + plan.trial_days * 24 * 60 * 60 * 1000
                        + 30 * 24 * 60 * 60 * 1000),
                    type: 'monthly',
                    recurringPlanType: 'paid',
                    planMeta: Plans[plan.name]
                },
                $push: {
                    chargeInfo: {
                        startDate: plan.activated_on,
                        planName: plan.name,
                        planPrice: plan.price,
                        id: plan.id,
                    }
                }
            }

            let updatedPlan = await activePlanModel.findOneAndUpdate({ userId: decoded.id }, data);

            let user = {
                $set: {
                    recurringPlanName: updatedPlan.planName,
                    recurringPlanType: 'paid',
                    trial_days: plan.trial_days,
                    trial_start: plan.activated_on,
                }
            }
            rcResponse.data = await userModel.findOneAndUpdate({ _id: decoded.id }, user, { accessToken: 0 });
            console.log( rcResponse.data);
        } else {
            rcResponse.data = await userModel.findOne({ _id: decoded.id }, { accessToken: 0 });
        }
    } catch (err) {
        handleError(err, rcResponse);
    }
    return res.status(rcResponse.code).send(rcResponse);
}


module.exports.recurringPlanCronJob = async () => {
    try {
        var today = new Date();
        let findQuery = { 'nextMonthStartDate': { $lte: today } };
        let plans = await activePlanModel.find(findQuery);

        let promise = [];
        plans.forEach(async (plan) => {
            promise.push(this.updatePlanOnMonth(plan));
        });

        await Promise.all(promise).then(async () => {
            return true;
        }).catch((err) => {
            throw err;
        });
    } catch (err) {
        let mailBody = "error in plan cron job\n" + err.stack;
        await sendMail("makasanas@yahoo.in", mailBody, "Error in plan update");
    }
    return true;
};

module.exports.updatePlanOnMonth = async (plan) => {
    try {
        var utc = new Date().toJSON().slice(0, 10);
        let data = {
            $set: {
                currentMonthStartDate: new Date(utc),
                nextMonthStartDate: new Date(new Date(utc).getTime() + (30 * 24 * 60 * 60 * 1000)),
                updated: new Date()
            },
            $push: {
                chargeInfo: {
                    startDate: new Date(utc),
                    planName: plan.planName,
                    planPrice: plan.planPrice,
                    id: plan.planId,
                }
            }
        }

        await activePlanModel.findOneAndUpdate({ userId: plan.userId }, data);
    } catch (err) {
        throw err;
    }
    return true;
}