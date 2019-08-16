const productSchema = require('./../schema/product');


module.exports.deleteManyByShopUrl = async (shopUrl) => {
    try {
      return await productSchema.deleteMany({ shopUrl: shopUrl });
    } catch (error) {
      throw error;
    }
}


module.exports.findProductByShopUrlAndProductId = async (shopUrl, productId) => {
  try {
    return await productSchema.findOne({ shopUrl: shopUrl, productId:productId });
  } catch (error) {
    throw error;
  }
}