const sessionSchema = require('./../schema/session');


module.exports.deleteManyByShopUrl = async (shopUrl) => {
    try {
      return await sessionSchema.deleteMany({ shopUrl: shopUrl });
    } catch (error) {
      throw error;
    }
  }