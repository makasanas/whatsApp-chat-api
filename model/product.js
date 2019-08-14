const productSchema = require('./../schema/product');


module.exports.deleteManyByShopUrl = async (shopUrl) => {
    try {
      return await productSchema.deleteMany({ shopUrl: shopUrl });
    } catch (error) {
      throw error;
    }
  }