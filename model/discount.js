const discountSchema = require('./../schema/discount');


module.exports.deleteManyByShopUrl = async (shopUrl) => {
    try {
      return await discountSchema.deleteMany({ shopUrl: shopUrl });
    } catch (error) {
      throw error;
    }
  }