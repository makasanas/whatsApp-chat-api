var cron = require('node-cron');
const activePlanModel = require('../model/activePlan');
const userModel = require('./../model/user')
const { handleError, sendMail } = require('./../helpers/utils');

cron.schedule('00 01 * * *', async () => {
    try {
        var today = new Date();
        let findQuery = { 'nextMonthStartDate': { $lte: today } }
        let plans = await activePlanModel.find(findQuery);
        var utc = new Date().toJSON().slice(0, 10);

        plans.forEach(async (plan) => {
            plan = JSON.parse(JSON.stringify(plan));
            delete plan.chargeInfo;

            plan.currentMonthStartDate = new Date(utc);
            plan.nextMonthStartDate = new Date(new Date(utc).getTime() + (30 * 24 * 60 * 60 * 1000));

            plan['$push'] = {
                chargeInfo: {
                    startDate: new Date(utc),
                    planName: plan.planName,
                    planPrice: plan.planPrice
                }
            }

            userData = { credit: plan.products }
            const updatePlan = await activePlanModel.updatePlan(plan.userId, plan);
            const updateUser = await userModel.updateUser(plan.userId, userData);
        });

        let mailBody = "Today's cron job is done and update "+ plans.length +" "+ utc;
        await sendMail("makasanas@yahoo.in", mailBody, "cron job status");
        return true;
    } catch (err) {
        let mailBody = "error in cron schedule wherer\n" + err.stack;
        await sendMail("makasanas@yahoo.in", mailBody, "Error in process");
        handleError(err, {}, {});
    }
}, {
    scheduled: true,
    // timezone: "Asia/Kolkata"
});
