const userSchema = require('../schema/user');

module.exports.getUserByShopUrl = async (shopUrl) => {
  try {
    return await userSchema.findOne({ shopUrl: shopUrl });
  } catch (error) {
    throw error;
  }
}
