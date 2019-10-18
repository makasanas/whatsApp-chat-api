const adminSchema = require('./../schema/admin');


module.exports.getUserById = async (userId) => {
  try {
    return await adminSchema.findOne({ _id: userId }).lean().exec();
  } catch (error) {
    throw error;
  }
}

module.exports.getUserByEmail = async (email) => {
  try {
    return await adminSchema.findOne({ email: email }).lean().exec();
  } catch (error) {
    throw error;
  }
}

module.exports.create = async (adminObj) => {
  try {
    const admin = await new adminSchema(adminObj);
    const adminSave = await admin.save();
    return adminSave;
  } catch (error) {
    throw error;
  }
}