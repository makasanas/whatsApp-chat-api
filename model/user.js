const userSchema = require('./../schema/user');

module.exports.getUserByShopUrl = async (shopUrl) => {
  try {
    return await userSchema.findOne({ shopUrl: shopUrl });
  } catch (error) {
    throw error;
  }
}


module.exports.getUserByStoreId = async (storeId) => {
  try {
    return await userSchema.findOne({ storeId: storeId });
  } catch (error) {
    throw error;
  }
}


module.exports.deleteManyByShopUrl = async (shopUrl) => {
  try {
    return await userSchema.deleteMany({ shopUrl: shopUrl });
  } catch (error) {
    throw error;
  }
}
