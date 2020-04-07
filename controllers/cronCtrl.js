var cron = require('node-cron');
const recurringCtrl = require('./recurringCtrl');
const emailCtrl = require('./emailCtrl');
const commonModel = require('./../model/common');

cron.schedule('00 01 * * *', async () => {
    await recurringCtrl.recurringPlanCronJob();
    return true;
}, {
    scheduled: true,
});


cron.schedule('00 01 * * *', async () => {
    await emailCtrl.regularAppReview();
    return true;
}, {
    scheduled: true,
});


(async () => {
    console.log("test clone job");
    try {
        let stores = await commonModel.find('user', { nextReviewDate: { $gt: new Date().getTime(), $lt: new Date().getTime() + 1000 * 60 * 60 } });
        // console.log()
        await emailCtrl.regularAppReview(stores);
    } catch (err) {
        console.log("error--------------");
        console.log(err);
        // let mailBody = "error in cron schedule wherer\n" + err.stack;
        // await sendMail("makasanas@yahoo.in", mailBody, "Error in process");
    }
    return true;
})();
