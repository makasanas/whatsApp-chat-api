var cron = require('node-cron');
const recurringCtrl = require('./recurringCtrl');

cron.schedule('00 01 * * *', async () => {
    await recurringCtrl.recurringPlanCronJob();
    return true;
}, {
    scheduled: true,
});

// (async () => {
//     console.log("test clone job");
// })();
