const activePlanSchema = require('./../schema/activePlan');


module.exports.deleteManyByShopUrl = async (shopUrl) => {
    try {
      return await activePlanSchema.deleteMany({ shopUrl: shopUrl });
    } catch (error) {
      throw error;
    }
  }

  module.exports.findActivePlanByUserId = async (userId) => {
    try {
      return await activePlanSchema.deleteMany({ shopUrl: shopUrl });
    } catch (error) {
      throw error;
    }
  }

  module.exports.updatePlan = async (planId, data) => {
    try {
      return await activePlanSchema.findOneAndUpdate({ _id: planId }, { $set: data }, { new: true }).lean().exec();
    } catch (error) {
      throw error;
    }
  }