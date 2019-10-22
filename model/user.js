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
    return await userSchema.findOne({ storeId: storeId }).lean().exec();
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
    const user = await new userSchema(UserObj);
    const userSave = await user.save();
    return  userSave;
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

module.exports.updateCredit = async (userId, credit) => {
  try {
    return await userSchema.findOneAndUpdate({ _id: userId }, {  $inc: { 'credit': credit } }, { new: true }).lean().exec();
  } catch (error) {
    throw error;
  }
}

module.exports.getUserById = async (userId) => {
  try {
    return await userSchema.findOne({ _id: userId }).lean().exec();
  } catch (error) {
    throw error;
  }
}

module.exports.getUserByEmail = async (email) => {
  try {
    return await userSchema.findOne({ email: email }).lean().exec();
  } catch (error) {
    throw error;
  }
}

module.exports.getUserByTokenAndDate = async (token) => {
  try {
    return await userSchema.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } }).lean().exec();
  } catch (error) {
    throw error;
  }
}

module.exports.getUsers = async (skip, limit, sort) => {
  try {
    return await userSchema.find({}, {accessToken:0 }).sort(sort).skip(skip).limit(limit).lean().exec();
  } catch (error) {
    throw error;
  }
}

module.exports.getUsersCount = async () => {
  try {
    return await userSchema.count().lean().exec();
  } catch (error) {
    throw error;
  }
}