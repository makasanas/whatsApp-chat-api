const userSchema = require('./../schema/user');

module.exports.getUserByShopUrl = async (shopUrl) => {
  try {
    return await userSchema.findOne({ shopUrl: shopUrl, deleted: false });
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

module.exports.saveUser = async (UserObj) => {
  try {
    return await userSchema.save(UserObj);
  } catch (error) {
    throw error;
  }
}

module.exports.updateUser = async (userId, data) => {
  try {
    return await userSchema.findOneAndUpdate({ _id: userId }, { $set: data }, { new: true }).lean().exec();
  } catch (error) {
    throw error;
  }
}

module.exports.getUserById = async (userId) => {
  try {
    return await userSchema.findOne({ _id: userId, deleted: false }).lean().exec();
  } catch (error) {
    throw error;
  }
}

module.exports.getUserByEmail = async (email) => {
  try {
    return await userSchema.findOne({ email: email, deleted: false }).lean().exec();
  } catch (error) {
    throw error;
  }
}

module.exports.getUserByTokenAndDate = async (token,date) => {
  try {
    return await userSchema.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }).lean().exec();
  } catch (error) {
    throw error;
  }
}



