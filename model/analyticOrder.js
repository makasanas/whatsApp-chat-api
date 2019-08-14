const analyticOrderSchema = require('./../schema/analyticOrder');


module.exports.deleteManyByShopUrl = async (shopUrl) => {
    try {
      return await analyticOrderSchema.deleteMany({ shopUrl: shopUrl });
    } catch (error) {
      throw error;
    }
  }