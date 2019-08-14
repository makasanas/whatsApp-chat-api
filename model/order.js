const orderSchema = require('./../schema/order');


module.exports.deleteManyByShopUrl = async (shopUrl) => {
    try {
      return await orderSchema.deleteMany({ shopUrl: shopUrl });
    } catch (error) {
      throw error;
    }
  }