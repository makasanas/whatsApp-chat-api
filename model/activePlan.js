const activePlanSchema = require('./../schema/activePlan');


module.exports.deleteManyByShopUrl = async (shopUrl) => {
    try {
      return await activePlanSchema.deleteMany({ shopUrl: shopUrl });
    } catch (error) {
      throw error;
    }
  }