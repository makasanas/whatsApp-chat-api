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
      return await activePlanSchema.findOne({ userId: userId });
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

  module.exports.savePlan = async (planObj) => {
    try {
      const plan = await new activePlanSchema(planObj);
      const planSave = await plan.save();
      return  planSave;
    } catch (error) {
      throw error;
    }
  }
  